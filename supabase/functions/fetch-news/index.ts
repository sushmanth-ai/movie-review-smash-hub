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

// Tollywood/Telugu movie keywords for filtering
const TOLLYWOOD_KEYWORDS = [
  "tollywood", "telugu", "movie", "film", "cinema", "box office",
  "review", "trailer", "teaser", "song", "shoot", "cast",
  "hero", "heroine", "director", "producer", "star",
  "blockbuster", "hit", "flop", "collection", "crore",
  "ott", "release", "first look", "motion poster", "pre-release",
  "audio", "lyrical", "shooting", "wrap", "schedule",
  // Common Telugu film industry names
  "mahesh", "prabhas", "allu arjun", "jr ntr", "ram charan",
  "chiranjeevi", "nani", "ravi teja", "vijay deverakonda",
  "pawan kalyan", "balakrishna", "nagarjuna", "venkatesh",
  "rajamouli", "trivikram", "sukumar", "koratala",
  "pushpa", "rrr", "baahubali", "salaar",
  // Telugu words commonly in titles
  "గ", "చి", "సి", "మూ", "హీ",
];

// Non-Tollywood keywords to exclude
const EXCLUDE_KEYWORDS = [
  "cricket", "politics", "election", "modi", "congress", "bjp",
  "stock market", "ipl", "sports", "weather", "recipe", "health tips",
  "astrology", "horoscope", "rashi", "panchangam",
];

function isTollywoodNews(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  
  // Exclude non-movie content
  for (const keyword of EXCLUDE_KEYWORDS) {
    if (text.includes(keyword)) return false;
  }
  
  // These sources are primarily Tollywood, so be lenient
  // Check if it contains any movie-related keyword
  for (const keyword of TOLLYWOOD_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) return true;
  }
  
  // For Telugu movie sites, most content IS Tollywood, so include if not excluded
  return true;
}

function extractAllImages(item: any): string {
  // Try multiple image sources in order of quality
  const candidates: string[] = [];
  
  // 1. Thumbnail from RSS2JSON
  if (item.thumbnail && item.thumbnail.length > 10) {
    candidates.push(item.thumbnail);
  }
  
  // 2. Enclosure
  if (item.enclosure?.link && item.enclosure.link.length > 10) {
    candidates.push(item.enclosure.link);
  }
  if (item.enclosure?.url && item.enclosure.url.length > 10) {
    candidates.push(item.enclosure.url);
  }
  
  // 3. Media content
  if (item["media:content"]?.url) {
    candidates.push(item["media:content"].url);
  }
  
  // 4. Extract from content HTML
  const contentHtml = item.content || item.description || "";
  const imgMatches = contentHtml.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
  for (const match of imgMatches) {
    if (match[1] && match[1].length > 10 && !match[1].includes("data:")) {
      candidates.push(match[1]);
    }
  }
  
  // 5. Extract og:image or any image URL from content
  const urlMatches = contentHtml.matchAll(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)/gi);
  for (const match of urlMatches) {
    candidates.push(match[0]);
  }
  
  // Return first valid candidate
  for (const url of candidates) {
    // Skip tiny icons/trackers
    if (url.includes("gravatar") || url.includes("1x1") || url.includes("pixel") || url.includes("favicon")) continue;
    return url;
  }
  
  return "";
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
        const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(12000) });
        if (!resp.ok) return [];
        const data = await resp.json();
        if (data.status !== "ok" || !data.items) return [];

        const source = data.feed?.title || getSourceName(feedUrl);

        return data.items
          .map((item: any) => {
            const title = stripHtml(item.title || "");
            const description = stripHtml(item.description || "").slice(0, 200);
            
            return {
              id: btoa(item.link || item.title).slice(0, 40),
              title,
              description,
              content: stripHtml(item.content || item.description || ""),
              link: item.link || "",
              image: extractAllImages(item),
              source,
              pubDate: item.pubDate || new Date().toISOString(),
              _isTollywood: isTollywoodNews(title, description),
            };
          })
          .filter((item: any) => item._isTollywood)
          .map(({ _isTollywood, ...rest }: any) => rest as NewsItem);
      } catch (e) {
        console.error(`Feed error for ${feedUrl}:`, e);
        return [];
      }
    });

    const results = await Promise.allSettled(feedPromises);
    const allItems: NewsItem[] = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<NewsItem[]>).value);

    // Sort by date descending, take top 20
    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    const top = allItems.slice(0, 20);

    return new Response(JSON.stringify({ items: top }), {
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
