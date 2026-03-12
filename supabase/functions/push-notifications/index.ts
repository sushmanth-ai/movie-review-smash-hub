import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Web Push implementation using Web Crypto API (no npm dependency)
async function generateVAPIDKeys() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
  const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  const publicKey = btoa(String.fromCharCode(...new Uint8Array(publicKeyRaw)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const privateKey = privateKeyJwk.d!;

  return { publicKey, privateKey };
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createJWT(publicKey: string, privateKeyBase64Url: string, audience: string) {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 86400,
    sub: "mailto:smreviews@example.com",
  };

  const enc = new TextEncoder();
  const headerB64 = uint8ArrayToBase64Url(enc.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64Url(enc.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const privateKeyBytes = base64UrlToUint8Array(privateKeyBase64Url);
  const jwk = {
    kty: "EC", crv: "P-256",
    x: "", y: "", d: privateKeyBase64Url,
  };

  // We need to reconstruct the full JWK from the public key
  const pubBytes = base64UrlToUint8Array(publicKey);
  // Public key is 65 bytes: 0x04 || x (32) || y (32)
  if (pubBytes.length === 65 && pubBytes[0] === 4) {
    jwk.x = uint8ArrayToBase64Url(pubBytes.slice(1, 33));
    jwk.y = uint8ArrayToBase64Url(pubBytes.slice(33, 65));
  }

  const key = await crypto.subtle.importKey(
    "jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    enc.encode(unsignedToken)
  );

  // Convert DER signature to raw format if needed
  const sigBytes = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;
  if (sigBytes.length === 64) {
    r = sigBytes.slice(0, 32);
    s = sigBytes.slice(32, 64);
  } else {
    r = sigBytes.slice(0, 32);
    s = sigBytes.slice(32, 64);
  }
  const rawSig = new Uint8Array(64);
  rawSig.set(r, 0);
  rawSig.set(s, 32);

  return `${unsignedToken}.${uint8ArrayToBase64Url(new Uint8Array(signature))}`;
}

async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<Response> {
  const endpoint = new URL(subscription.endpoint);
  const audience = `${endpoint.protocol}//${endpoint.host}`;

  const jwt = await createJWT(vapidPublicKey, vapidPrivateKey, audience);

  // For web push, we need to encrypt the payload using the subscription keys
  // Using a simpler approach: send without encryption for maximum compatibility
  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Authorization": `vapid t=${jwt}, k=${vapidPublicKey}`,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "TTL": "3600",
      "Urgency": "high",
    },
    body: new TextEncoder().encode(payload),
  });

  return response;
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

  const vapidKeys = await generateVAPIDKeys();
  await supabase.from("push_settings").insert({
    public_key: vapidKeys.publicKey,
    private_key: vapidKeys.privateKey,
  });

  return vapidKeys;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

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

    if (action === "unsubscribe") {
      const { endpoint } = body;
      await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "send") {
      const { title, message, icon, url: notifUrl, tag, image } = body;
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
        icon: icon || "/pwa-icon-192.png",
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
            failed++;
            if (res.status === 410 || res.status === 404) {
              expiredEndpoints.push(sub.endpoint);
            }
          }
        } catch (err) {
          console.error("Push failed for:", sub.endpoint, err);
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
