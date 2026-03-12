import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Fetch or Init VAPID Keys
    const { data: settings } = await supabase.from("push_settings").select("*").single();
    let vapidKeys = settings;
    if (!vapidKeys) {
      const newKeys = webpush.generateVAPIDKeys();
      const { data: inserted } = await supabase.from("push_settings").insert({
        public_key: newKeys.publicKey,
        private_key: newKeys.privateKey,
      }).select().single();
      vapidKeys = inserted;
    }

    webpush.setVapidDetails(
      "mailto:smreviews@example.com",
      vapidKeys.public_key,
      vapidKeys.private_key
    );

    if (req.method === "GET" && action === "vapid-public-key") {
      return new Response(JSON.stringify({ publicKey: vapidKeys.public_key }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    if (action === "subscribe") {
      const { subscription, deviceHash } = body;
      const { error } = await supabase.from("push_subscriptions").upsert({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        device_hash: deviceHash || null,
      }, { onConflict: "endpoint" });

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "send") {
      const { title, message, url: notifUrl, image, movieName } = body;
      const { data: subscriptions } = await supabase.from("push_subscriptions").select("*");

      const payload = JSON.stringify({
        title: title || "SM Review 3.0",
        body: message || "New update!",
        url: notifUrl || "/",
        image: image || null,
        movieName: movieName || null,
        timestamp: Date.now(),
      });

      let sent = 0;
      let failed = 0;
      const expired: string[] = [];

      const results = await Promise.all((subscriptions || []).map(async (sub) => {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          }, payload, {
            Urgency: "high",
            TTL: 3600
          });
          sent++;
        } catch (err) {
          failed++;
          if (err.statusCode === 410 || err.statusCode === 404) {
            expired.push(sub.endpoint);
          }
        }
      }));

      if (expired.length > 0) {
        await supabase.from("push_subscriptions").delete().in("endpoint", expired);
      }

      return new Response(JSON.stringify({ success: true, sent, failed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Unknown Action", { status: 400 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
