import { useState, useEffect, useCallback } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mhrbffdkssemqijcipni.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocmJmZmRrc3NlbXFpamNpcG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNTM1NzIsImV4cCI6MjA3NzcyOTU3Mn0.GIOdnlm0Gm7MD4bMz33w5ij65pfsuTg6lfTisQUulog';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  link: string;
  image: string;
  source: string;
  pubDate: string;
}

const CACHE_KEY = 'sm_news_cache_v3';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// RSS Feeds to fetch
const RSS_FEEDS = [
  { url: 'https://www.telugu360.com/feed/', source: 'Telugu360' },
  { url: 'https://www.123telugu.com/feed', source: '123Telugu' },
  { url: 'https://www.greatandhra.com/rss', source: 'GreatAndhra' },
  { url: 'https://www.gulte.com/feed/', source: 'Gulte' },
  { url: 'https://www.mirchi9.com/feed/', source: 'Mirchi9' },
];

const TOLLYWOOD_NAMES = [
  'mahesh babu', 'prabhas', 'allu arjun', 'jr ntr', 'ntr',
  'ram charan', 'chiranjeevi', 'megastar', 'nani', 'ravi teja',
  'vijay deverakonda', 'pawan kalyan', 'balakrishna', 'nagarjuna',
  'venkatesh', 'nithin', 'rana daggubati', 'sharwanand', 'varun tej',
  'sai dharam tej', 'naga chaitanya', 'akhil akkineni', 'adivi sesh',
  'vishwak sen', 'naveen polishetty', 'samantha', 'rashmika',
  'pooja hegde', 'sreeleela', 'keerthy suresh', 'kajal', 'tamannaah',
  'rajamouli', 'trivikram', 'sukumar', 'koratala siva', 'boyapati',
  'ram pothineni', 'nikhil', 'siddhu jonnalagadda',
];

const TOLLYWOOD_KEYWORDS = [
  'tollywood', 'telugu movie', 'telugu film', 'telugu cinema',
  'pushpa', 'rrr', 'baahubali', 'salaar', 'kalki', 'spirit', 'devara',
  'box office', 'first look', 'motion poster', 'pre-release',
  'audio launch', 'song release', 'ott release',
];

const EXCLUDE_KEYWORDS = [
  'cricket', 'politics', 'election', 'modi', 'congress', 'bjp',
  'ysrcp', 'jagan mohan', 'chandrababu', 'stock market', 'ipl',
  'sports', 'horoscope', 'astrology', 'real estate', 'gold price',
  'petrol price', 'world cup', 'revanth reddy', 'panchayat',
];

function isTollywoodNews(title: string, desc: string, link: string): boolean {
  const text = `${title} ${desc}`.toLowerCase();
  const url = link.toLowerCase();
  for (const kw of EXCLUDE_KEYWORDS) if (text.includes(kw)) return false;
  if (url.includes('/politics') || url.includes('/sports') || url.includes('/cricket')) return false;
  for (const n of TOLLYWOOD_NAMES) if (text.includes(n)) return true;
  for (const kw of TOLLYWOOD_KEYWORDS) if (text.includes(kw)) return true;
  const genericTerms = ['movie', 'film', 'cinema', 'trailer', 'song', 'director', 'review', 'release', 'poster', 'ott'];
  for (const kw of genericTerms) if (text.includes(kw)) return true;
  return false;
}

function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim() || '';
}

function extractImage(xml: string): string {
  const media = xml.match(/<media:(?:content|thumbnail)[^>]+url=["']([^"']+)["']/i);
  if (media?.[1]) return media[1];
  const enc = xml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  if (enc?.[1] && /\.(jpg|jpeg|png|webp|gif)/i.test(enc[1])) return enc[1];
  const img = xml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (img?.[1] && !img[1].startsWith('data:')) return img[1];
  return '';
}

function getXmlTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(re);
  return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
}

async function fetchFeedViaProxy(feedUrl: string, source: string): Promise<NewsItem[]> {
  // Use allorigins.win as a CORS proxy - returns fresh content every request
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}&t=${Date.now()}`;
  const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
  if (!resp.ok) throw new Error(`Proxy error ${resp.status}`);
  const json = await resp.json();
  const xml: string = json.contents || '';
  if (!xml) return [];

  const items: NewsItem[] = [];
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = stripHtml(getXmlTag(block, 'title'));
    const link = getXmlTag(block, 'link').trim() || '';
    const desc = stripHtml(getXmlTag(block, 'description')).slice(0, 200);
    const contentRaw = getXmlTag(block, 'content:encoded') || getXmlTag(block, 'description');
    const content = stripHtml(contentRaw);
    const pubDate = getXmlTag(block, 'pubDate') || new Date().toISOString();
    const image = extractImage(block);

    if (!title || title.length < 5) continue;
    if (!isTollywoodNews(title, desc, link)) continue;

    items.push({
      id: btoa(unescape(encodeURIComponent((link || title).slice(0, 60)))).slice(0, 40),
      title,
      description: desc,
      content,
      link,
      image,
      source,
      pubDate,
    });
  }
  return items;
}

async function fetchFromEdgeFunction(): Promise<NewsItem[]> {
  const url = new URL(`${SUPABASE_URL}/functions/v1/fetch-news`);
  url.searchParams.set('t', Date.now().toString());
  const resp = await fetch(url.toString(), {
    cache: 'no-store',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  if (!resp.ok) throw new Error(`Edge fn HTTP ${resp.status}`);
  const data = await resp.json();
  return data.items || [];
}

async function fetchAllNews(): Promise<NewsItem[]> {
  // Try frontend proxy fetching first — no server caching, always fresh
  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map(({ url, source }) => fetchFeedViaProxy(url, source))
    );
    const all: NewsItem[] = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => (r as PromiseFulfilledResult<NewsItem[]>).value);

    if (all.length > 0) {
      // Deduplicate
      const seen = new Set<string>();
      const unique = all.filter(item => {
        const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      unique.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      return unique.slice(0, 25);
    }
  } catch (e) {
    console.warn('[NewsFeed] Proxy fetch failed, falling back to edge fn:', e);
  }

  // Fall back to edge function
  return fetchFromEdgeFunction();
}

export const useNewsFeed = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (force = false) => {
    // On force refresh, wipe old cache
    if (force) {
      try { localStorage.removeItem(CACHE_KEY); } catch {}
    } else {
      // Serve from cache if still fresh
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { items, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setNews(items);
            setIsLoading(false);
            return;
          }
        }
      } catch {}
    }

    setIsLoading(true);
    setError(null);

    try {
      const items = await fetchAllNews();
      if (items.length > 0) {
        setNews(items);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ items, timestamp: Date.now() }));
      }
    } catch (e: any) {
      console.error('[NewsFeed] Fetch error:', e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(true), CACHE_DURATION);
    return () => clearInterval(interval);
  }, [fetchNews]);

  return { news, isLoading, error, refetch: () => fetchNews(true) };
};
