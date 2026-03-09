import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function getOrCreateVapidKeys(supabase: any) {
  // Check if keys exist
  const { data: existing } = await supabase
    .from("push_settings")
    .select("*")
    .limit(1)
    .single();

  if (existing) {
    return { publicKey: existing.public_key, privateKey: existing.private_key };
  }

  // Generate new VAPID keys
  const vapidKeys = webpush.generateVAPIDKeys();

  await supabase.from("push_settings").insert({
    public_key: vapidKeys.publicKey,
    private_key: vapidKeys.privateKey,
  });

  return { publicKey: vapidKeys.publicKey, privateKey: vapidKeys.privateKey };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // GET vapid public key
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

    // Subscribe
    if (action === "subscribe") {
      const { subscription, deviceHash } = body;
      if (!subscription?.endpoint || !subscription?.keys) {
        return new Response(
          JSON.stringify({ error: "Invalid subscription" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
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
        console.error("Subscribe error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Unsubscribe
    if (action === "unsubscribe") {
      const { endpoint } = body;
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", endpoint);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send notification to all subscribers
    if (action === "send") {
      const { title, message, icon, url: notifUrl, tag, image } = body;

      const keys = await getOrCreateVapidKeys(supabase);

      webpush.setVapidDetails(
        "mailto:smreviews@example.com",
        keys.publicKey,
        keys.privateKey
      );

      // Fetch all subscriptions
      const { data: subscriptions, error: fetchError } = await supabase
        .from("push_subscriptions")
        .select("*");

      if (fetchError) {
        console.error("Fetch subscriptions error:", fetchError);
        return new Response(
          JSON.stringify({ error: fetchError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
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
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, payload);
          sent++;
        } catch (err: any) {
          console.error("Push failed for:", sub.endpoint, err.statusCode);
          failed++;
          // Remove expired subscriptions (410 Gone or 404)
          if (err.statusCode === 410 || err.statusCode === 404) {
            expiredEndpoints.push(sub.endpoint);
          }
        }
      }

      // Cleanup expired subscriptions
      if (expiredEndpoints.length > 0) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .in("endpoint", expiredEndpoints);
      }

      return new Response(
        JSON.stringify({
          success: true,
          sent,
          failed,
          cleaned: expiredEndpoints.length,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Push notification error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
