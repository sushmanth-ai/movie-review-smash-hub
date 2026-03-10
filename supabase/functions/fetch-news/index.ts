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

// Keywords that indicate movie/Tollywood content
const MOVIE_KEYWORDS = [
  "movie", "film", "cinema", "box office", "review", "trailer", "teaser",
  "song", "shoot", "cast", "hero", "heroine", "director", "producer",
  "blockbuster", "hit", "flop", "collection", "crore", "ott", "release",
  "first look", "motion poster", "pre-release", "audio launch", "lyrical",
  "shooting", "wrap", "schedule", "sequel", "remake", "dubbed",
  "tollywood", "telugu movie", "telugu film", "south film",
  "mass", "pan india", "pan-india", "theatrical",
  // Actor names
  "mahesh babu", "prabhas", "allu arjun", "jr ntr", "ram charan",
  "chiranjeevi", "nani", "ravi teja", "vijay deverakonda", "vijay devarakonda",
  "pawan kalyan", "balakrishna", "nagarjuna", "venkatesh", "nithin",
  "nithiin", "siddharth", "rana", "sharwanand", "sudheer babu",
  "varun tej", "sai dharam tej", "bellamkonda", "sundeep kishan",
  "naga chaitanya", "akhil", "adivi sesh", "vishwak sen", "naga shaurya",
  "allari naresh", "suhas", "priyadarshi", "naveen polishetty",
  "samantha", "rashmika", "pooja hegde", "sree leela", "sreeleela",
  "anupama", "mrunal", "keerthy suresh", "kajal",
  // Director names
  "rajamouli", "trivikram", "sukumar", "koratala", "boyapati",
  "anil ravipudi", "parasuram", "gopichand malineni", "harish shankar",
  "sekhar kammula", "venky atluri", "buchi babu", "sandeep reddy vanga",
  "nag ashwin", "hanu raghavapudi", "sreenu vaitla",
  // Movie titles / franchises
  "pushpa", "rrr", "baahubali", "salaar", "spirit", "devara",
  "game changer", "saripodhaa sanivaaram",
  // Industry terms
  "pre-release event", "audio function", "title poster", "look test",
  "censored", "runtime", "songs released", "item song", "interval",
  "climax", "screen count", "advance booking", "satellite rights",
  "digital rights", "streaming", "amazon prime", "netflix", "hotstar",
  "zee5", "aha", "sun nxt",
];

// Definite non-movie content to exclude
const EXCLUDE_KEYWORDS = [
  "cricket", "politics", "election", "modi", "congress", "bjp", "tdp",
  "ysrcp", "ycp", "jagan", "chandrababu", "stock market", "ipl",
  "sports", "weather", "recipe", "health tips", "astrology", "horoscope",
  "rashi", "panchangam", "real estate", "gold price", "petrol price",
  "metro", "railway", "flight", "airport", "temple", "devotional",
  "chatgpt", "gemini ai", "world cup", "t20", "odi",
];

function isTollywoodMovieNews(title: string, description: string, link: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  const url = link.toLowerCase();

  // Check URL path for movie categories (many Telugu sites use /movie/ or /telugu-movie/ paths)
  const movieUrlPatterns = ["/movie", "/telugu-movie", "/review", "/box-office", "/tollywood", "/gossip"];
  const nonMovieUrlPatterns = ["/politics", "/sports", "/cricket", "/business", "/tech", "/lifestyle", "/health"];

  for (const pattern of nonMovieUrlPatterns) {
    if (url.includes(pattern)) return false;
  }

  // Hard exclude non-movie content
  for (const keyword of EXCLUDE_KEYWORDS) {
    if (text.includes(keyword)) return false;
  }

  // Check URL for movie category
  for (const pattern of movieUrlPatterns) {
    if (url.includes(pattern)) return true;
  }

  // Check content for movie keywords
  for (const keyword of MOVIE_KEYWORDS) {
    if (text.includes(keyword)) return true;
  }

  // Not clearly movie-related, exclude
  return false;
}

function extractAllImages(item: any): string {
  const candidates: string[] = [];

  if (item.thumbnail && item.thumbnail.length > 10) candidates.push(item.thumbnail);
  if (item.enclosure?.link && item.enclosure.link.length > 10) candidates.push(item.enclosure.link);
  if (item.enclosure?.url && item.enclosure.url.length > 10) candidates.push(item.enclosure.url);
  if (item["media:content"]?.url) candidates.push(item["media:content"].url);

  const contentHtml = item.content || item.description || "";
  const imgMatches = contentHtml.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
  for (const match of imgMatches) {
    if (match[1] && match[1].length > 10 && !match[1].includes("data:")) candidates.push(match[1]);
  }

  const urlMatches = contentHtml.matchAll(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)/gi);
  for (const match of urlMatches) candidates.push(match[0]);

  for (const url of candidates) {
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
            } as NewsItem;
          })
          .filter((item: NewsItem) => isTollywoodMovieNews(item.title, item.description, item.link));
      } catch (e) {
        console.error(`Feed error for ${feedUrl}:`, e);
        return [];
      }
    });

    const results = await Promise.allSettled(feedPromises);
    const allItems: NewsItem[] = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<NewsItem[]>).value);

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
