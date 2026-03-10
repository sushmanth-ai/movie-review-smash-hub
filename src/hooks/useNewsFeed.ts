import { useState, useEffect, useCallback, useRef } from 'react';

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

const CACHE_KEY = 'sm_news_cache_v4';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Multiple RSS-to-JSON services for fallback
const RSS2JSON_SERVICES = [
  (feedUrl: string) =>
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&t=${Date.now()}`,
  (feedUrl: string) =>
    `https://rss2json.com/api.json?rss_url=${encodeURIComponent(feedUrl)}&t=${Date.now()}`,
];

const RSS_FEEDS = [
  'https://www.telugu360.com/feed/',
  'https://www.123telugu.com/feed',
  'https://www.greatandhra.com/rss',
  'https://www.gulte.com/feed/',
  'https://www.mirchi9.com/feed/',
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
  'audio launch', 'song release',
];

const EXCLUDE_KEYWORDS = [
  'cricket', 'politics', 'election', 'modi', 'congress', 'bjp',
  'ysrcp', 'jagan mohan', 'chandrababu', 'stock market', 'ipl',
  'sports', 'horoscope', 'astrology', 'real estate', 'gold price',
  'revanth reddy',
];

function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim() || '';
}

function isTollywoodNews(title: string, desc: string, link: string): boolean {
  const text = `${title} ${desc}`.toLowerCase();
  const url = link.toLowerCase();
  for (const kw of EXCLUDE_KEYWORDS) if (text.includes(kw)) return false;
  if (url.includes('/politics') || url.includes('/sports') || url.includes('/cricket')) return false;
  for (const n of TOLLYWOOD_NAMES) if (text.includes(n)) return true;
  for (const kw of TOLLYWOOD_KEYWORDS) if (text.includes(kw)) return true;
  const generic = ['movie', 'film', 'cinema', 'trailer', 'song', 'director', 'review', 'release', 'poster', 'ott'];
  for (const kw of generic) if (text.includes(kw)) return true;
  return false;
}

function extractImage(item: any): string {
  if (item.thumbnail && item.thumbnail.length > 10) return item.thumbnail;
  if (item.enclosure?.link && item.enclosure.link.length > 10) return item.enclosure.link;
  const htmlFields = [item.content, item.description];
  for (const html of htmlFields) {
    if (!html) continue;
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match?.[1] && !match[1].startsWith('data:')) return match[1];
  }
  return '';
}

// --------- Strategy 1: Supabase Edge Function (deployed version) ---------
async function fetchFromEdgeFunction(): Promise<NewsItem[]> {
  console.log('[NewsFeed] Trying Supabase Edge Function...');
  const url = `${SUPABASE_URL}/functions/v1/fetch-news?t=${Date.now()}`;
  const resp = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!resp.ok) throw new Error(`Edge function HTTP ${resp.status}`);
  const data = await resp.json();
  if (!data.items || data.items.length === 0) throw new Error('Edge function returned no items');
  console.log(`[NewsFeed] Edge function returned ${data.items.length} items`);
  return data.items;
}

// --------- Strategy 2: Direct rss2json.com from frontend ---------
async function fetchFeedFromRss2Json(feedUrl: string): Promise<NewsItem[]> {
  for (const buildUrl of RSS2JSON_SERVICES) {
    try {
      const apiUrl = buildUrl(feedUrl);
      const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
      if (!resp.ok) continue;
      const data = await resp.json();
      if (data.status !== 'ok' || !data.items) continue;

      const source = data.feed?.title?.split('|')[0]?.trim() || 'News';
      return data.items
        .map((item: any) => {
          const title = stripHtml(item.title || '');
          const description = stripHtml(item.description || '').slice(0, 200);
          return {
            id: btoa(unescape(encodeURIComponent((item.link || item.title || '').slice(0, 60)))).slice(0, 40),
            title,
            description,
            content: stripHtml(item.content || item.description || ''),
            link: item.link || '',
            image: extractImage(item),
            source,
            pubDate: item.pubDate || new Date().toISOString(),
          } as NewsItem;
        })
        .filter((item: NewsItem) => item.title.length >= 5 && isTollywoodNews(item.title, item.description, item.link));
    } catch {
      continue;
    }
  }
  return [];
}

async function fetchAllFromRss2Json(): Promise<NewsItem[]> {
  console.log('[NewsFeed] Trying direct rss2json from frontend...');
  const results = await Promise.allSettled(RSS_FEEDS.map(url => fetchFeedFromRss2Json(url)));
  const all: NewsItem[] = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => (r as PromiseFulfilledResult<NewsItem[]>).value);

  // Deduplicate
  const seen = new Set<string>();
  const unique = all.filter(item => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  unique.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  console.log(`[NewsFeed] rss2json returned ${unique.length} items`);
  return unique.slice(0, 25);
}

// --------- Main fetch with fallback chain ---------
async function fetchAllNews(): Promise<NewsItem[]> {
  // Strategy 1: Try Supabase Edge Function first
  try {
    const items = await fetchFromEdgeFunction();
    if (items.length > 0) return items;
  } catch (e) {
    console.warn('[NewsFeed] Edge function failed:', e);
  }

  // Strategy 2: Try direct rss2json from frontend
  try {
    const items = await fetchAllFromRss2Json();
    if (items.length > 0) return items;
  } catch (e) {
    console.warn('[NewsFeed] rss2json failed:', e);
  }

  throw new Error('All news sources failed. Please check your internet connection and try again.');
}

export const useNewsFeed = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchCount = useRef(0);

  const fetchNews = useCallback(async (force = false) => {
    // On force refresh, clear the local cache
    if (force) {
      try { localStorage.removeItem(CACHE_KEY); } catch {}
    } else {
      // Use cache if still fresh
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { items, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION && items?.length > 0) {
            setNews(items);
            setIsLoading(false);
            return;
          }
        }
      } catch {}
    }

    setIsLoading(true);
    setError(null);
    fetchCount.current += 1;
    const currentFetch = fetchCount.current;

    try {
      const items = await fetchAllNews();

      // Prevent stale responses from overriding newer ones
      if (currentFetch !== fetchCount.current) return;

      if (items.length > 0) {
        setNews(items);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ items, timestamp: Date.now() }));
      }
    } catch (e: any) {
      if (currentFetch !== fetchCount.current) return;
      console.error('[NewsFeed] All fetches failed:', e);
      setError(e.message || 'Failed to fetch news');
    } finally {
      if (currentFetch === fetchCount.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(true), CACHE_DURATION);
    return () => clearInterval(interval);
  }, [fetchNews]);

  return { news, isLoading, error, refetch: () => fetchNews(true) };
};
