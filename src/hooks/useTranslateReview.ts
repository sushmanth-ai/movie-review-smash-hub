import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

interface ReviewTexts {
  review: string;
  firstHalf: string;
  secondHalf: string;
  positives: string;
  negatives: string;
  overall: string;
}

// Persistent in-memory cache (survives re-renders, clears on page reload)
const translationCache = new Map<string, ReviewTexts>();

export function useTranslateReview(reviewId: string, original: ReviewTexts) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState<ReviewTexts>(original);
  const [isTranslating, setIsTranslating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Stabilize original texts to avoid unnecessary re-renders
  const stableOriginal = useMemo(() => ({
    review: original.review || '',
    firstHalf: original.firstHalf || '',
    secondHalf: original.secondHalf || '',
    positives: original.positives || '',
    negatives: original.negatives || '',
    overall: original.overall || '',
  }), [original.review, original.firstHalf, original.secondHalf, original.positives, original.negatives, original.overall]);

  // Stable content fingerprint to avoid duplicate fetches
  const contentKey = useMemo(() => {
    return `${reviewId}|${stableOriginal.review}|${stableOriginal.firstHalf}`;
  }, [reviewId, stableOriginal.review, stableOriginal.firstHalf]);

  const translateViaFetch = useCallback(async (
    texts: ReviewTexts,
    targetLang: string,
    signal: AbortSignal
  ): Promise<ReviewTexts | null> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !anonKey) {
      console.warn('Missing env vars for translation');
      return null;
    }

    const url = `${supabaseUrl}/functions/v1/translate-review`;

    const response = await fetch(url, {
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
      const errText = await response.text().catch(() => '');
      throw new Error(`Translation failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data?.translated || null;
  }, []);

  useEffect(() => {
    // English = show original
    if (language === 'en') {
      setTranslated(stableOriginal);
      setIsTranslating(false);
      return;
    }

    // Skip if no content loaded yet
    if (!stableOriginal.review && !stableOriginal.firstHalf && !stableOriginal.secondHalf) {
      setTranslated(stableOriginal);
      return;
    }

    const cacheKey = `${contentKey}-${language}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      setTranslated(cached);
      setIsTranslating(false);
      return;
    }

    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let retries = 0;
    const maxRetries = 2;

    const doTranslate = async () => {
      if (controller.signal.aborted) return;
      setIsTranslating(true);

      try {
        const result = await translateViaFetch(stableOriginal, language, controller.signal);
        if (controller.signal.aborted) return;

        if (result) {
          translationCache.set(cacheKey, result);
          setTranslated(result);
        } else {
          setTranslated(stableOriginal);
        }
        setIsTranslating(false);
      } catch (err: any) {
        if (err.name === 'AbortError' || controller.signal.aborted) return;
        console.error('Translation error (attempt ' + (retries + 1) + '):', err);

        retries++;
        if (retries <= maxRetries) {
          // Exponential backoff: 1.5s, 3s
          const delay = retries * 1500;
          setTimeout(() => {
            if (!controller.signal.aborted) doTranslate();
          }, delay);
        } else {
          setTranslated(stableOriginal);
          setIsTranslating(false);
        }
      }
    };

    // Small delay to batch rapid language switches
    const timeout = setTimeout(doTranslate, 150);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [language, contentKey, stableOriginal, translateViaFetch]);

  return { translated, isTranslating };
}
