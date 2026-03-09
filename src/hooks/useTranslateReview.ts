import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

interface ReviewTexts {
  review: string;
  firstHalf: string;
  secondHalf: string;
  positives: string;
  negatives: string;
  overall: string;
}

// Persistent in-memory cache
const translationCache = new Map<string, ReviewTexts>();

export function useTranslateReview(reviewId: string, original: ReviewTexts) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState<ReviewTexts>(original);
  const [isTranslating, setIsTranslating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  const translateViaFetch = useCallback(async (
    texts: ReviewTexts,
    targetLang: string,
    signal: AbortSignal
  ): Promise<ReviewTexts | null> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !anonKey) {
      console.warn('Missing Supabase env vars for translation');
      return null;
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/translate-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ texts, targetLang }),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Translation failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data?.translated || null;
  }, []);

  useEffect(() => {
    // English = original
    if (language === 'en') {
      setTranslated(original);
      setIsTranslating(false);
      return;
    }

    // Skip if original is empty (not loaded yet)
    const hasContent = original.review || original.firstHalf || original.secondHalf;
    if (!hasContent) {
      setTranslated(original);
      return;
    }

    const cacheKey = `${reviewId}-${language}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      setTranslated(cached);
      setIsTranslating(false);
      return;
    }

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    retryCountRef.current = 0;

    const doTranslate = async () => {
      setIsTranslating(true);

      try {
        const result = await translateViaFetch(original, language, controller.signal);
        if (controller.signal.aborted) return;

        if (result) {
          translationCache.set(cacheKey, result);
          setTranslated(result);
        } else {
          setTranslated(original);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Translation error:', err);

        // Retry once after 2 seconds
        if (retryCountRef.current < 1 && !controller.signal.aborted) {
          retryCountRef.current++;
          setTimeout(() => {
            if (!controller.signal.aborted) doTranslate();
          }, 2000);
          return;
        }

        setTranslated(original);
      } finally {
        if (!controller.signal.aborted) {
          setIsTranslating(false);
        }
      }
    };

    doTranslate();

    return () => {
      controller.abort();
    };
  }, [language, reviewId, original.review, original.firstHalf, original.secondHalf, translateViaFetch]);

  return { translated, isTranslating };
}
