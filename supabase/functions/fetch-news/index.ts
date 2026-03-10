const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RSS_FEEDS = [
  "https://www.telugu360.com/feed/",
  "https://www.123telugu.com/feed",
  "https://www.greatandhra.com/rss",
  "https://www.idlebrain.com/rss/news.xml",
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

const TOLLYWOOD_NAMES = [
  "mahesh babu", "prabhas", "allu arjun", "jr ntr", "ntr",
  "ram charan", "chiranjeevi", "mega star", "megastar", "nani",
  "ravi teja", "vijay deverakonda", "pawan kalyan", "balakrishna",
  "nagarjuna", "venkatesh", "nithin", "nithiin", "rana daggubati",
  "sharwanand", "sudheer babu", "varun tej", "sai dharam tej",
  "bellamkonda", "sundeep kishan", "naga chaitanya", "chay",
  "akhil akkineni", "adivi sesh", "vishwak sen", "naga shaurya",
  "allari naresh", "suhas", "priyadarshi", "naveen polishetty",
  "samantha", "rashmika", "pooja hegde", "sree leela", "sreeleela",
  "anupama", "keerthy suresh", "kajal", "tamannaah", "tamannah",
  "rajamouli", "trivikram", "sukumar", "koratala siva", "boyapati",
  "anil ravipudi", "parasuram", "gopichand malineni", "harish shankar",
  "sekhar kammula", "venky atluri", "buchi babu", "sandeep reddy vanga",
  "nag ashwin", "hanu raghavapudi", "sreenu vaitla", "gopichand",
  "ram pothineni", "nikhil", "siddhu jonnalagadda",
  "dil raju", "mythri", "geetha arts", "vyjayanthi",
  "tharun bhascker", "nani", "surekha", "allu sirish",
  "kamal haasan", "rajinikanth",
];

const TOLLYWOOD_KEYWORDS = [
  "tollywood", "telugu movie", "telugu film", "telugu cinema",
  "south indian film", "south cinema",
  "pushpa", "rrr", "baahubali", "salaar", "kalki", "spirit", "devara",
  "game changer", "peddi", "irumudi", "dhurandhar",
  "first look", "pre-release", "motion poster", "box office",
  "pan india", "pan-india", "theatrical release",
  "aha video", "advance booking", "digital rights", "satellite rights",
  "item song", "song release", "audio launch",
  "gaayapadda simham", "jana nayagan",
];

const EXCLUDE_KEYWORDS = [
  "cricket", "politics", "election", "modi", "congress", "bjp", "tdp party",
  "ysrcp", "ycp", "jagan mohan", "chandrababu", "stock market", "ipl",
  "sports", "weather", "recipe", "health tips", "astrology", "horoscope",
  "rashi", "panchangam", "real estate", "gold price", "petrol price",
  "metro rail", "railway station", "airport", "temple festival", "devotional",
  "world cup", "t20 world", "odi match", "revanth reddy", "cm revanth",
  "fuel alert", "lpg shortage", "petrol diesel", "gas cylinder",
  "panchayat", "municipality", "assembly", "parliament",
];

const EXCLUDE_URL_PATHS = [
  "/politics", "/sports", "/cricket", "/business", "/tech",
  "/lifestyle", "/health", "/bollywood", "/editorial",
];

const MOVIE_URL_PATHS = [
  "/movie", "/telugu-movie", "/review", "/box-office",
  "/tollywood", "/movienews", "/mnews", "/gossip",
  "/gallery", "/slideshow",
];

function isTollywoodMovieNews(title: string, desc: string, link: string): boolean {
  const text = `${title} ${desc}`.toLowerCase();
  const url = link.toLowerCase();

  for (const kw of EXCLUDE_KEYWORDS) {
    if (text.includes(kw)) return false;
  }
  for (const p of EXCLUDE_URL_PATHS) {
    if (url.includes(p)) return false;
  }

  // Check Tollywood-specific signals
  for (const p of MOVIE_URL_PATHS) {
    if (url.includes(p)) return true;
  }
  for (const name of TOLLYWOOD_NAMES) {
    if (text.includes(name)) return true;
  }
  for (const kw of TOLLYWOOD_KEYWORDS) {
    if (text.includes(kw)) return true;
  }

  // Generic movie terms - require at least one to pass for Telugu sites
  const genericMovieTerms = [
    "movie", "film", "cinema", "trailer", "teaser", "song",
    "shoot", "director", "producer", "sequel", "blockbuster",
    "hit", "flop", "collection", "review", "release", "poster",
    "ott", "streaming", "netflix", "amazon", "hotstar", "zee5",
  ];
  for (const kw of genericMovieTerms) {
    if (text.includes(kw)) return true;
  }

  return false;
}

function extractImage(item: any): string {
  const candidates: string[] = [];

  if (item.thumbnail && item.thumbnail.length > 10) candidates.push(item.thumbnail);
  if (item.enclosure?.link && item.enclosure.link.length > 10) candidates.push(item.enclosure.link);
  if (item.enclosure?.url && item.enclosure.url.length > 10) candidates.push(item.enclosure.url);

  const htmlSources = [item.content, item.description, item.encoded, item["content:encoded"]];
  for (const html of htmlSources) {
    if (!html) continue;
    const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
    for (const m of imgMatches) {
      if (m[1] && m[1].length > 10 && !m[1].includes("data:")) candidates.push(m[1]);
    }
    const urlMatches = html.matchAll(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>]*)?/gi);
    for (const m of urlMatches) candidates.push(m[0]);
  }

  for (const url of candidates) {
    if (url.includes("gravatar") || url.includes("1x1") || url.includes("pixel") || url.includes("favicon") || url.includes("feed-image")) continue;
    return url;
  }
  return "";
}

// Scrape og:image from article page for items without images
async function fetchOgImage(url: string): Promise<string> {
  try {
    const resp = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SMReviews/1.0)" },
    });
    if (!resp.ok) return "";
    const html = await resp.text();
    // Look for og:image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch?.[1]) return ogMatch[1];
    // Look for twitter:image
    const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (twMatch?.[1]) return twMatch[1];
    return "";
  } catch {
    return "";
  }
}

function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim() || "";
}

function getSourceName(feedUrl: string): string {
  try {
    const url = new URL(feedUrl);
    const host = url.hostname.replace("www.", "");
    const name = host.split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
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
        const cacheBust = `${feedUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
        const apiUrl = `${RSS2JSON_API}?rss_url=${encodeURIComponent(feedUrl + cacheBust)}&t=${Date.now()}`;
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
              image: extractImage(item),
              source,
              pubDate: item.pubDate || new Date().toISOString(),
            } as NewsItem;
          })
          .filter((item: NewsItem) => {
            if (!item.title || item.title.length < 5) return false;
            return isTollywoodMovieNews(item.title, item.description, item.link);
          });
      } catch (e) {
        console.error(`Feed error for ${feedUrl}:`, e);
        return [];
      }
    });

    const results = await Promise.allSettled(feedPromises);
    let allItems: NewsItem[] = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<NewsItem[]>).value);

    // Deduplicate
    const seen = new Set<string>();
    allItems = allItems.filter((item) => {
      const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    const top = allItems.slice(0, 20);

    // Fetch og:image for items without images (parallel, max 10)
    const needImage = top.filter((item) => !item.image);
    if (needImage.length > 0) {
      const ogPromises = needImage.slice(0, 10).map(async (item) => {
        const ogImg = await fetchOgImage(item.link);
        if (ogImg) item.image = ogImg;
      });
      await Promise.allSettled(ogPromises);
    }

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
