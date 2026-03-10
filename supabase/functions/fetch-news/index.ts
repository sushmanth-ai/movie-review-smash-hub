const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RSS_FEEDS = [
  { url: "https://www.telugu360.com/feed/", tollywoodOnly: false },
  { url: "https://www.123telugu.com/feed", tollywoodOnly: false },
  { url: "https://www.greatandhra.com/rss", tollywoodOnly: false },
  { url: "https://www.idlebrain.com/rss/news.xml", tollywoodOnly: false },
  { url: "https://www.gulte.com/feed/", tollywoodOnly: false },
  { url: "https://www.mirchi9.com/feed/", tollywoodOnly: false },
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

// Telugu/Tollywood actor & director names
const TOLLYWOOD_NAMES = [
  "mahesh babu", "prabhas", "allu arjun", "jr ntr", "ntr", "ram charan",
  "chiranjeevi", "mega star", "nani", "ravi teja", "vijay deverakonda",
  "pawan kalyan", "balakrishna", "nagarjuna", "venkatesh", "nithin",
  "nithiin", "rana daggubati", "sharwanand", "sudheer babu",
  "varun tej", "sai dharam tej", "bellamkonda", "sundeep kishan",
  "naga chaitanya", "chay", "akhil akkineni", "adivi sesh", "vishwak sen",
  "naga shaurya", "allari naresh", "suhas", "priyadarshi", "naveen polishetty",
  "samantha", "rashmika", "pooja hegde", "sree leela", "sreeleela",
  "anupama", "keerthy suresh", "kajal", "tamannaah", "tamannah",
  "rajamouli", "trivikram", "sukumar", "koratala siva", "boyapati",
  "anil ravipudi", "parasuram", "gopichand malineni", "harish shankar",
  "sekhar kammula", "venky atluri", "buchi babu", "sandeep reddy vanga",
  "nag ashwin", "hanu raghavapudi", "sreenu vaitla", "gopichand",
  "ram charan", "ram pothineni", "nikhil", "siddhu jonnalagadda",
  "ar rahman peddi", "dil raju", "mythri", "geetha arts",
];

// Telugu movie specific terms
const TOLLYWOOD_KEYWORDS = [
  "tollywood", "telugu movie", "telugu film", "telugu cinema",
  "south indian", "south film",
  // Specific Telugu movie titles/franchises
  "pushpa", "rrr", "baahubali", "salaar", "kalki", "spirit", "devara",
  "game changer", "peddi", "irumudi",
  // Telugu-specific terms
  "crore", "first look", "pre-release", "motion poster",
  "theatrical", "box office", "ott release", "pan india",
  "pan-india", "digital rights", "satellite rights",
  "aha video", "item song", "advance booking",
];

// General movie keywords (used as secondary signal)
const MOVIE_KEYWORDS = [
  "movie", "film", "cinema", "trailer", "teaser", "song release",
  "shoot", "shooting", "director", "producer", "sequel",
  "blockbuster", "hit", "flop", "collection",
  "review", "release date", "poster", "lyrical",
  "schedule", "remake", "dubbed", "theatrical",
  "audio launch", "censored", "runtime", "streaming",
  "amazon prime", "netflix", "hotstar", "zee5", "sun nxt",
];

// Bollywood-specific content to exclude
const BOLLYWOOD_NAMES = [
  "aamir khan", "shah rukh khan", "srk", "salman khan", "akshay kumar",
  "ajay devgn", "ranveer singh", "ranbir kapoor", "deepika padukone",
  "alia bhatt", "rani mukerji", "katrina kaif", "kareena kapoor",
  "priyanka chopra", "hrithik roshan", "varun dhawan", "tiger shroff",
  "kartik aaryan", "vicky kaushal", "rajkummar rao", "ayushmann",
  "bollywood",
];

// Non-movie content
const EXCLUDE_KEYWORDS = [
  "cricket", "politics", "election", "modi", "congress", "bjp", "tdp",
  "ysrcp", "ycp", "jagan", "chandrababu", "stock market", "ipl",
  "sports", "weather", "recipe", "health tips", "astrology", "horoscope",
  "rashi", "panchangam", "real estate", "gold price", "petrol price",
  "metro rail", "railway", "flight", "airport", "temple", "devotional",
  "world cup", "t20", "odi", "revanth reddy", "cm revanth",
];

function isTollywoodMovieNews(title: string, description: string, link: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  const url = link.toLowerCase();

  // Hard exclude non-movie content
  for (const kw of EXCLUDE_KEYWORDS) {
    if (text.includes(kw)) return false;
  }

  // Exclude pure Bollywood news (unless it also mentions Tollywood names)
  let isBollywood = false;
  for (const name of BOLLYWOOD_NAMES) {
    if (text.includes(name)) { isBollywood = true; break; }
  }

  let hasTollywoodName = false;
  for (const name of TOLLYWOOD_NAMES) {
    if (text.includes(name)) { hasTollywoodName = true; break; }
  }

  // If it mentions Bollywood names but no Tollywood names, exclude
  if (isBollywood && !hasTollywoodName) return false;

  // URL-based filtering
  const excludeUrlPaths = ["/politics", "/sports", "/cricket", "/business", "/tech", "/lifestyle", "/health", "/bollywood"];
  for (const p of excludeUrlPaths) {
    if (url.includes(p)) return false;
  }

  const movieUrlPaths = ["/movie", "/telugu-movie", "/review", "/box-office", "/tollywood", "/movienews", "/mnews"];
  for (const p of movieUrlPaths) {
    if (url.includes(p)) return true;
  }

  // Check for Tollywood names/keywords
  if (hasTollywoodName) return true;
  for (const kw of TOLLYWOOD_KEYWORDS) {
    if (text.includes(kw)) return true;
  }

  // Check for generic movie keywords (only if from known Telugu sites)
  for (const kw of MOVIE_KEYWORDS) {
    if (text.includes(kw)) return true;
  }

  return false;
}

function extractAllImages(item: any): string {
  const candidates: string[] = [];

  // 1. Thumbnail
  if (item.thumbnail && item.thumbnail.length > 10) candidates.push(item.thumbnail);
  // 2. Enclosure
  if (item.enclosure?.link && item.enclosure.link.length > 10) candidates.push(item.enclosure.link);
  if (item.enclosure?.url && item.enclosure.url.length > 10) candidates.push(item.enclosure.url);
  // 3. Media content
  if (item["media:content"]?.url) candidates.push(item["media:content"].url);

  // 4. Extract from content/description HTML
  const htmlSources = [item.content, item.description, item.encoded, item["content:encoded"]];
  for (const html of htmlSources) {
    if (!html) continue;
    const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
    for (const match of imgMatches) {
      if (match[1] && match[1].length > 10 && !match[1].includes("data:")) candidates.push(match[1]);
    }
    // Also find bare image URLs
    const urlMatches = html.matchAll(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>]*)?/gi);
    for (const match of urlMatches) candidates.push(match[0]);
  }

  for (const url of candidates) {
    if (url.includes("gravatar") || url.includes("1x1") || url.includes("pixel") || url.includes("favicon") || url.includes("feed-image")) continue;
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
    const feedPromises = RSS_FEEDS.map(async ({ url: feedUrl }) => {
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
          .filter((item: NewsItem) => {
            // Skip empty items
            if (!item.title || item.title.length < 5) return false;
            return isTollywoodMovieNews(item.title, item.description, item.link);
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

    // Deduplicate by similar titles
    const seen = new Set<string>();
    const unique = allItems.filter((item) => {
      const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    unique.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    const top = unique.slice(0, 20);

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
