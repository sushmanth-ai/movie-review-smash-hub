import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── Utility functions ──

function base64UrlToUint8Array(b64url: string): Uint8Array {
  const padding = "=".repeat((4 - (b64url.length % 4)) % 4);
  const b64 = (b64url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function concatUint8(...arrays: Uint8Array[]): Uint8Array {
  const len = arrays.reduce((a, b) => a + b.length, 0);
  const result = new Uint8Array(len);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// ── VAPID Key Management ──

async function generateVAPIDKeys() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
  const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  const publicKey = uint8ArrayToBase64Url(new Uint8Array(publicKeyRaw));
  const privateKey = privateKeyJwk.d!;

  return { publicKey, privateKey };
}

async function getOrCreateVapidKeys(supabase: any) {
  const { data: existing } = await supabase
    .from("push_settings")
    .select("*")
    .limit(1)
    .single();

  if (existing) {
    return { publicKey: existing.public_key, privateKey: existing.private_key };
  }

  const keys = await generateVAPIDKeys();
  await supabase.from("push_settings").insert({
    public_key: keys.publicKey,
    private_key: keys.privateKey,
  });
  return keys;
}

// ── VAPID JWT ──

async function createVapidJwt(
  publicKey: string,
  privateKeyD: string,
  audience: string
) {
  const enc = new TextEncoder();
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 43200,
    sub: "mailto:smreviews@example.com",
  };

  const hB64 = uint8ArrayToBase64Url(enc.encode(JSON.stringify(header)));
  const pB64 = uint8ArrayToBase64Url(enc.encode(JSON.stringify(payload)));
  const unsigned = `${hB64}.${pB64}`;

  // Reconstruct JWK from public key bytes + private d
  const pubBytes = base64UrlToUint8Array(publicKey);
  const x = uint8ArrayToBase64Url(pubBytes.slice(1, 33));
  const y = uint8ArrayToBase64Url(pubBytes.slice(33, 65));

  const jwk = { kty: "EC", crv: "P-256", x, y, d: privateKeyD };
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const sig = new Uint8Array(
    await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      enc.encode(unsigned)
    )
  );

  // WebCrypto ECDSA returns raw r||s (64 bytes) for P-256
  return `${unsigned}.${uint8ArrayToBase64Url(sig)}`;
}

// ── RFC 8291 Web Push Encryption (aes128gcm) ──

async function hkdfDerive(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", ikm, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", key, salt.length ? salt : new Uint8Array(32)));

  const prkKey = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const infoWithCounter = concatUint8(info, new Uint8Array([1]));
  const okm = new Uint8Array(await crypto.subtle.sign("HMAC", prkKey, infoWithCounter));
  return okm.slice(0, length);
}

async function encryptPayload(
  p256dhBase64: string,
  authBase64: string,
  payload: string
): Promise<{ body: Uint8Array; salt: Uint8Array; serverPublicKeyRaw: Uint8Array }> {
  const enc = new TextEncoder();
  const clientPublicKey = base64UrlToUint8Array(p256dhBase64);
  const clientAuth = base64UrlToUint8Array(authBase64);
  const plaintext = enc.encode(payload);

  // Generate ephemeral ECDH key pair
  const serverKeys = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const serverPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", serverKeys.publicKey)
  );

  // Import client public key
  const clientKey = await crypto.subtle.importKey(
    "raw",
    clientPublicKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: clientKey },
      serverKeys.privateKey,
      256
    )
  );

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // IKM via auth secret
  const authInfo = concatUint8(
    enc.encode("WebPush: info\0"),
    clientPublicKey,
    serverPublicKeyRaw
  );
  const ikm = await hkdfDerive(clientAuth, sharedSecret, authInfo, 32);

  // Derive content encryption key and nonce
  const cekInfo = enc.encode("Content-Encoding: aes128gcm\0");
  const nonceInfo = enc.encode("Content-Encoding: nonce\0");

  const cek = await hkdfDerive(salt, ikm, cekInfo, 16);
  const nonce = await hkdfDerive(salt, ikm, nonceInfo, 12);

  // Pad plaintext: add delimiter byte 0x02 (final record)
  const paddedPlaintext = concatUint8(plaintext, new Uint8Array([2]));

  // Encrypt with AES-128-GCM
  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce },
      aesKey,
      paddedPlaintext
    )
  );

  // Build aes128gcm header: salt(16) + rs(4) + idlen(1) + keyid(65) + encrypted
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096);
  const idlen = new Uint8Array([65]); // length of server public key
  const body = concatUint8(salt, rs, idlen, serverPublicKeyRaw, encrypted);

  return { body, salt, serverPublicKeyRaw };
}

// ── Send Web Push ──

async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<Response> {
  const endpoint = new URL(subscription.endpoint);
  const audience = `${endpoint.protocol}//${endpoint.host}`;

  const jwt = await createVapidJwt(vapidPublicKey, vapidPrivateKey, audience);

  const { body } = await encryptPayload(
    subscription.keys.p256dh,
    subscription.keys.auth,
    payload
  );

  return await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      TTL: "86400",
      Urgency: "high",
    },
    body,
  });
}

// ── Main Handler ──

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // GET: vapid-public-key
    if (req.method === "GET" && action === "vapid-public-key") {
      const keys = await getOrCreateVapidKeys(supabase);
      return new Response(JSON.stringify({ publicKey: keys.publicKey }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    // POST: subscribe
    if (action === "subscribe") {
      const { subscription, deviceHash } = body;
      if (!subscription?.endpoint || !subscription?.keys) {
        return new Response(JSON.stringify({ error: "Invalid subscription" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          device_hash: deviceHash || null,
        },
        { onConflict: "endpoint" }
      );

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: unsubscribe
    if (action === "unsubscribe") {
      const { endpoint } = body;
      await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: send
    if (action === "send") {
      const { title, message, url: notifUrl, tag, image } = body;
      const keys = await getOrCreateVapidKeys(supabase);

      const { data: subscriptions, error: fetchError } = await supabase
        .from("push_subscriptions")
        .select("*");

      if (fetchError) {
        return new Response(JSON.stringify({ error: fetchError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const payload = JSON.stringify({
        title: title || "SM Review 3.0",
        body: message || "New update!",
        icon: "/pwa-icon-192.png",
        url: notifUrl || "/",
        tag: tag || "sm-review-update",
        image: image || null,
      });

      let sent = 0;
      let failed = 0;
      const expiredEndpoints: string[] = [];

      for (const sub of subscriptions || []) {
        try {
          const res = await sendWebPush(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
            keys.publicKey,
            keys.privateKey
          );
          if (res.ok || res.status === 201) {
            sent++;
          } else {
            const errText = await res.text();
            console.error(`Push failed for ${sub.endpoint}: ${res.status} ${errText}`);
            failed++;
            if (res.status === 410 || res.status === 404) {
              expiredEndpoints.push(sub.endpoint);
            }
          }
        } catch (err) {
          console.error("Push error:", sub.endpoint, err);
          failed++;
        }
      }

      if (expiredEndpoints.length > 0) {
        await supabase.from("push_subscriptions").delete().in("endpoint", expiredEndpoints);
      }

      return new Response(
        JSON.stringify({ success: true, sent, failed, cleaned: expiredEndpoints.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Push notification error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
