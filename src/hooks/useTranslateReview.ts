import { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

// Lazy-load supabase to prevent crash when env vars are missing
let _supabase: any = null;
async function getSupabase() {
  if (!_supabase) {
    try {
      const mod = await import('@/integrations/supabase/client');
      _supabase = mod.supabase;
    } catch {
      return null;
    }
  }
  return _supabase;
}

interface ReviewTexts {
  review: string;
  firstHalf: string;
  secondHalf: string;
  positives: string;
  negatives: string;
  overall: string;
}

// Simple in-memory cache: key = `${reviewId}-${lang}`
const translationCache = new Map<string, ReviewTexts>();

export function useTranslateReview(reviewId: string, original: ReviewTexts) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState<ReviewTexts>(original);
  const [isTranslating, setIsTranslating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Stable serialization of original texts to detect real changes
  const originalKey = useMemo(
    () => JSON.stringify(original),
    [original.review, original.firstHalf, original.secondHalf, original.positives, original.negatives, original.overall]
  );

  useEffect(() => {
    // English = original, no translation needed
    if (language === 'en') {
      setTranslated(original);
      return;
    }

    // Skip if original text is empty (review not loaded yet)
    const hasContent = original.review || original.firstHalf || original.secondHalf || original.positives || original.negatives || original.overall;
    if (!hasContent) {
      setTranslated(original);
      return;
    }

    const cacheKey = `${reviewId}-${language}-${originalKey}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      setTranslated(cached);
      return;
    }

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsTranslating(true);

    // Capture current original for this closure
    const textsToTranslate = { ...original };

    const doTranslate = async () => {
      try {
        const sb = await getSupabase();
        if (!sb || controller.signal.aborted) {
          setIsTranslating(false);
          return;
        }

        // Use fetch directly instead of SDK invoke for better mobile compatibility
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-review`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ texts: textsToTranslate, targetLang: language }),
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (!response.ok) {
          console.error('Translation request failed:', response.status);
          setTranslated(textsToTranslate);
          setIsTranslating(false);
          return;
        }

        const data = await response.json();
        
        if (data?.translated) {
          // Merge: use translated value if present, fall back to original
          const merged: ReviewTexts = {
            review: data.translated.review || textsToTranslate.review,
            firstHalf: data.translated.firstHalf || textsToTranslate.firstHalf,
            secondHalf: data.translated.secondHalf || textsToTranslate.secondHalf,
            positives: data.translated.positives || textsToTranslate.positives,
            negatives: data.translated.negatives || textsToTranslate.negatives,
            overall: data.translated.overall || textsToTranslate.overall,
          };
          translationCache.set(cacheKey, merged);
          setTranslated(merged);
        } else {
          console.error('Translation response missing translated field:', data);
          setTranslated(textsToTranslate);
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.error('Translation error:', err);
        setTranslated(textsToTranslate);
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
  }, [language, reviewId, originalKey]);

  return { translated, isTranslating };
}
