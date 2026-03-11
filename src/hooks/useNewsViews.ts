import { useState, useEffect, useCallback } from 'react';
import { db } from '@/utils/firebase';
import { doc, getDoc, setDoc, increment, onSnapshot } from 'firebase/firestore';

const VIEW_CACHE_KEY = 'sm_news_viewed_';

export const useNewsViews = (newsId: string) => {
  const [views, setViews] = useState(0);

  useEffect(() => {
    if (!db || !newsId) return;

    const docRef = doc(db, 'news_views', newsId);
    
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setViews(snap.data().count || 0);
      }
    }, () => {
      // Silently fail
    });

    return () => unsub();
  }, [newsId]);

  const trackView = useCallback(async () => {
    if (!db || !newsId) return;

    const cacheKey = VIEW_CACHE_KEY + newsId;
    if (sessionStorage.getItem(cacheKey)) return;

    try {
      const docRef = doc(db, 'news_views', newsId);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        await setDoc(docRef, { count: increment(1) }, { merge: true });
      } else {
        await setDoc(docRef, { count: 1 });
      }
      
      sessionStorage.setItem(cacheKey, '1');
    } catch (e) {
      console.error('[NewsViews] Track error:', e);
    }
  }, [newsId]);

  return { views, trackView };
};

// Batch view fetcher for the feed
export const useNewsViewsBatch = (newsIds: string[]) => {
  const [viewsMap, setViewsMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!db || newsIds.length === 0) return;

    const unsubs: (() => void)[] = [];

    newsIds.forEach((id) => {
      const docRef = doc(db, 'news_views', id);
      const unsub = onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          setViewsMap((prev) => ({ ...prev, [id]: snap.data().count || 0 }));
        }
      }, () => {});
      unsubs.push(unsub);
    });

    return () => unsubs.forEach((u) => u());
  }, [newsIds.join(',')]);

  return viewsMap;
};
