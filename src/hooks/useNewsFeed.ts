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

const CACHE_KEY = 'sm_news_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useNewsFeed = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (force = false) => {
    // Check cache first
    if (!force) {
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
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/fetch-news`, {
        headers: { 'apikey': SUPABASE_ANON_KEY },
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      if (data.items) {
        setNews(data.items);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ items: data.items, timestamp: Date.now() }));
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
