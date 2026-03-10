const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

const RSS_FEEDS = [
  "https://www.telugu360.com/feed/",
  "https://www.123telugu.com/feed",
  "https://www.greatandhra.com/rss",
  "https://www.idlebrain.com/rss/news.xml",
  "https://www.gulte.com/feed/",
  "https://www.mirchi9.com/feed/",
];

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

/** Extract the text content of the first matching XML tag */
function getXmlTag(xml: string, tag: string): string {
  // Try <tag>...</tag>
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}

/** Extract CDATA-wrapped content */
function stripCdata(val: string): string {
  return val.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
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

function extractImageFromHtml(html: string): string {
  if (!html) return "";
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1] && !imgMatch[1].startsWith("data:")) return imgMatch[1];
  const urlMatch = html.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>]*)?/i);
  return urlMatch?.[0] || "";
}

/** Parse a single RSS <item> XML block into a NewsItem */
function parseRssItem(itemXml: string, source: string): NewsItem | null {
  const title = stripHtml(stripCdata(getXmlTag(itemXml, "title")));
  const link = stripCdata(getXmlTag(itemXml, "link")).trim() ||
    (itemXml.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] ?? "");
  const description = stripHtml(stripCdata(getXmlTag(itemXml, "description"))).slice(0, 200);

  // Try to extract full content
  const contentEncoded = getXmlTag(itemXml, "content:encoded") || getXmlTag(itemXml, "content");
  const content = stripHtml(stripCdata(contentEncoded || getXmlTag(itemXml, "description")));

  const pubDate = getXmlTag(itemXml, "pubDate") || getXmlTag(itemXml, "dc:date") || new Date().toISOString();

  // Image extraction: <media:content>, <media:thumbnail>, <enclosure>, <description> img
  let image = "";
  const mediaContent = itemXml.match(/<media:(?:content|thumbnail)[^>]+url=["']([^"']+)["']/i);
  if (mediaContent?.[1]) image = mediaContent[1];
  if (!image) {
    const enclosure = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    if (enclosure?.[1] && /\.(jpg|jpeg|png|webp|gif)/i.test(enclosure[1])) image = enclosure[1];
  }
  if (!image) image = extractImageFromHtml(stripCdata(getXmlTag(itemXml, "description")));
  if (!image && contentEncoded) image = extractImageFromHtml(stripCdata(contentEncoded));

  if (!title || title.length < 5) return null;
  if (!isTollywoodMovieNews(title, description, link)) return null;

  return {
    id: btoa(unescape(encodeURIComponent(link || title))).slice(0, 40),
    title,
    description,
    content,
    link,
    image,
    source,
    pubDate,
  };
}

/** Fetch and parse an RSS feed directly */
async function fetchRssFeed(feedUrl: string): Promise<NewsItem[]> {
  try {
    const resp = await fetch(feedUrl, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SMReviews/2.0; +https://mhrbffdkssemqijcipni.supabase.co)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
        "Cache-Control": "no-cache, no-store",
        "Pragma": "no-cache",
      },
    });
    if (!resp.ok) {
      console.error(`[RSS] Feed ${feedUrl} responded with ${resp.status}`);
      return [];
    }
    const xml = await resp.text();

    // Try to determine source name from <title> inside <channel>
    const channelTitle = stripCdata(getXmlTag(xml, "title")) || getSourceName(feedUrl);
    const source = channelTitle.split("|")[0].trim() || getSourceName(feedUrl);

    // Split on <item> tags
    const items: NewsItem[] = [];
    const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = parseRssItem(match[1], source);
      if (item) items.push(item);
    }
    return items;
  } catch (e) {
    console.error(`[RSS] Error fetching ${feedUrl}:`, e);
    return [];
  }
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
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch?.[1]) return ogMatch[1];
    const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (twMatch?.[1]) return twMatch[1];
    return "";
  } catch {
    return "";
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { ...corsHeaders, ...noCacheHeaders },
    });
  }

  try {
    // Fetch all RSS feeds directly - bypasses rss2json caching entirely
    const feedPromises = RSS_FEEDS.map((feedUrl) => fetchRssFeed(feedUrl));
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
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        ...noCacheHeaders,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Fetch news error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json", ...noCacheHeaders },
    });
  }
});
