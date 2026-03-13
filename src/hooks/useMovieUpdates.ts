import { useState, useEffect, useCallback } from 'react';
import { db } from '@/utils/firebase';
import {
  collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, increment, limit, Timestamp
} from 'firebase/firestore';
import { supabase } from '@/integrations/supabase/client';

export interface MovieUpdate {
  id: string;
  movieName: string;
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  type: 'image' | 'text' | 'video';
  category: 'announcement' | 'trailer' | 'teaser' | 'release-date' | 'box-office' | 'shooting-update' | 'breaking-news';
  createdAt: Date;
  likes: number;
  comments: number;
  views: number;
}

const CATEGORY_INFO: Record<string, { emoji: string; label: string }> = {
  'announcement': { emoji: '📢', label: 'Announcement' },
  'trailer': { emoji: '🎬', label: 'Trailer' },
  'teaser': { emoji: '🎥', label: 'Teaser' },
  'release-date': { emoji: '📅', label: 'Release Date' },
  'box-office': { emoji: '📊', label: 'Box Office' },
  'shooting-update': { emoji: '🎥', label: 'Shooting Update' },
  'breaking-news': { emoji: '🔥', label: 'Breaking News' },
};

export const getCategoryInfo = (category: string) => CATEGORY_INFO[category] || { emoji: '📰', label: 'Update' };

export const useMovieUpdates = (pageSize = 15) => {
  const [updates, setUpdates] = useState<MovieUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) { setLoading(false); return; }

    const q = query(collection(db, 'movie_updates'), orderBy('createdAt', 'desc'), limit(pageSize));
    const unsub = onSnapshot(q, (snap) => {
      const items: MovieUpdate[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          movieName: data.movieName || '',
          title: data.title || '',
          description: data.description,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          type: data.type || 'text',
          category: data.category || 'announcement',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
          likes: data.likes || 0,
          comments: data.comments || 0,
          views: data.views || 0,
        };
      });
      setUpdates(items);
      setLoading(false);
    }, (err) => {
      console.error('[MovieUpdates] Snapshot error:', err);
      setLoading(false);
    });

    return () => unsub();
  }, [pageSize]);

  const addUpdate = useCallback(async (data: Omit<MovieUpdate, 'id' | 'createdAt' | 'likes' | 'comments' | 'views'>) => {
    if (!db) throw new Error('Database not initialized');

    // Validate required fields
    if (!data.movieName?.trim()) throw new Error('Movie name is required');
    if (!data.title?.trim()) throw new Error('Title is required');

    // Sanitize - remove undefined fields
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== '')
    );

    let docId = '';
    try {
      const docRef = await addDoc(collection(db, 'movie_updates'), {
        ...cleanData,
        createdAt: Timestamp.now(),
        likes: 0,
        comments: 0,
        views: 0,
      });
      docId = docRef.id;
    } catch (e) {
      console.error('[MovieUpdates] Firestore addDoc failed:', e);
      throw new Error('Failed to save update. Check your connection.');
    }

    // Not triggering push manually here anymore.
    // Firebase Cloud Functions will listen to this doc creation
    // and automatically dispatch the FCM notification.

    return docId;
  }, []);

  const likeUpdate = useCallback(async (updateId: string) => {
    if (!db) return;
    const key = `update_liked_${updateId}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
    try {
      const ref = doc(db, 'movie_updates', updateId);
      await updateDoc(ref, { likes: increment(1) });
    } catch (e) {
      console.error('[MovieUpdates] Like failed:', e);
      localStorage.removeItem(key);
    }
  }, []);

  const trackView = useCallback(async (updateId: string) => {
    if (!db) return;
    const key = `update_viewed_${updateId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    try {
      const ref = doc(db, 'movie_updates', updateId);
      await updateDoc(ref, { views: increment(1) });
    } catch (e) {
      console.error('[MovieUpdates] View track failed:', e);
    }
  }, []);

  return { updates, loading, addUpdate, likeUpdate, trackView };
};
