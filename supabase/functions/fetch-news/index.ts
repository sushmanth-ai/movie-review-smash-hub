const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RSS_FEEDS = [
  "https://www.greatandhra.com/rss",
  "https://www.telugu360.com/feed/",
  "https://www.idlebrain.com/rss/news.xml",
  "https://www.123telugu.com/feed",
  "https://www.gulte.com/feed/",
  "https://www.mirchi9.com/feed/",
];

const RSS2JSON_API = "https://api.rss2json.com/v1/api.json";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  link: string;
  image: string;
  source: string;
  pubDate: string;
}

function extractImageFromContent(content: string): string | null {
  const match = content?.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim() || "";
}

function getSourceName(feedUrl: string): string {
  try {
    const url = new URL(feedUrl);
    const host = url.hostname.replace("www.", "");
    return host.split(".")[0].charAt(0).toUpperCase() + host.split(".")[0].slice(1);
  } catch {
    return "Unknown";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const feedPromises = RSS_FEEDS.map(async (feedUrl) => {
      try {
        const apiUrl = `${RSS2JSON_API}?rss_url=${encodeURIComponent(feedUrl)}`;
        const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
        if (!resp.ok) return [];
        const data = await resp.json();
        if (data.status !== "ok" || !data.items) return [];

        const source = data.feed?.title || getSourceName(feedUrl);

        return data.items.map((item: any) => {
          const contentImage = extractImageFromContent(item.content || item.description || "");
          return {
            id: btoa(item.link || item.title).slice(0, 40),
            title: stripHtml(item.title || ""),
            description: stripHtml(item.description || "").slice(0, 200),
            content: stripHtml(item.content || item.description || ""),
            link: item.link || "",
            image: item.thumbnail || item.enclosure?.link || contentImage || "",
            source,
            pubDate: item.pubDate || new Date().toISOString(),
          } as NewsItem;
        });
      } catch (e) {
        console.error(`Feed error for ${feedUrl}:`, e);
        return [];
      }
    });

    const results = await Promise.allSettled(feedPromises);
    const allItems: NewsItem[] = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<NewsItem[]>).value);

    // Sort by date descending, take top 15
    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    const top15 = allItems.slice(0, 15);

    return new Response(JSON.stringify({ items: top15 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Fetch news error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
