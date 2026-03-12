import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIREBASE_PROJECT_ID = "clgsm-90aa8";

// Get current week key matching the client logic
function getCurrentWeekKey(): string {
  const now = new Date();
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + oneJan.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
}

// Fetch Firestore documents via REST API (no auth needed for public reads)
async function fetchFirestoreCollection(collectionName: string) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collectionName}?pageSize=500`;
  const resp = await fetch(url);
  if (!resp.ok) {
    console.error(`Firestore fetch error for ${collectionName}:`, await resp.text());
    return [];
  }
  const data = await resp.json();
  return data.documents || [];
}

// Parse Firestore value to JS value
function parseFirestoreValue(val: any): any {
  if (!val) return null;
  if ("stringValue" in val) return val.stringValue;
  if ("integerValue" in val) return parseInt(val.integerValue);
  if ("doubleValue" in val) return val.doubleValue;
  if ("booleanValue" in val) return val.booleanValue;
  if ("timestampValue" in val) return val.timestampValue;
  if ("mapValue" in val) {
    const result: any = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      result[k] = parseFirestoreValue(v);
    }
    return result;
  }
  if ("arrayValue" in val) {
    return (val.arrayValue.values || []).map(parseFirestoreValue);
  }
  return null;
}

function parseFirestoreDoc(doc: any) {
  const id = doc.name.split("/").pop();
  const fields: any = {};
  for (const [k, v] of Object.entries(doc.fields || {})) {
    fields[k] = parseFirestoreValue(v);
  }
  return { id, ...fields };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const weekKey = getCurrentWeekKey();
    console.log("Weekly digest: fetching trending for week", weekKey);

    // Fetch reviews and weekly metrics from Firebase
    const [reviewDocs, metricsDocs] = await Promise.all([
      fetchFirestoreCollection("reviews"),
      fetchFirestoreCollection("weeklyMetrics"),
    ]);

    const reviews = reviewDocs.map(parseFirestoreDoc);
    const metrics = metricsDocs.map(parseFirestoreDoc);

    // Filter metrics for current week
    const weeklyMetrics = new Map<string, { views: number; likes: number; comments: number; reactions: number }>();
    for (const m of metrics) {
      if (m.weekKey === weekKey) {
        weeklyMetrics.set(m.reviewId, {
          views: m.views || 0,
          likes: m.likes || 0,
          comments: m.comments || 0,
          reactions: m.reactions || 0,
        });
      }
    }

    // Calculate trending scores
    const scored = reviews.map((r: any) => {
      const m = weeklyMetrics.get(r.id) || { views: 0, likes: 0, comments: 0, reactions: 0 };
      const score = (m.views * 1) + (m.likes * 3) + (m.comments * 5) + (m.reactions * 2);
      return { id: r.id, title: r.title, image: r.image, score, views: m.views };
    });

    // Sort by score, take top 3
    scored.sort((a: any, b: any) => b.score - a.score);
    const top3 = scored.slice(0, 3);

    if (top3.length === 0) {
      console.log("No trending reviews found for this week");
      return new Response(JSON.stringify({ success: true, message: "No trending reviews to send" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build notification message
    const rankEmojis = ["🥇", "🥈", "🥉"];
    const summaryLines = top3.map((r: any, i: number) =>
      `${rankEmojis[i]} ${r.title.trim()}`
    );
    const notificationBody = `This week's top reviews:\n${summaryLines.join("\n")}`;

    console.log("Sending weekly digest:", notificationBody);

    // Call push-notifications edge function to broadcast
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const pushResponse = await fetch(
      `${supabaseUrl}/functions/v1/push-notifications?action=send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          title: "🔥 SM Reviews - Weekly Top 3",
          message: notificationBody,
          icon: "/pwa-icon-192.png",
          url: "/",
          tag: "weekly-digest",
          image: top3[0]?.image || null,
        }),
      }
    );

    const pushResult = await pushResponse.json();
    console.log("Push result:", pushResult);

    return new Response(
      JSON.stringify({
        success: true,
        weekKey,
        top3: top3.map((r: any) => ({ title: r.title, score: r.score })),
        pushResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Weekly digest error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
