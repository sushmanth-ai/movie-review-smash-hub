import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

// Lazy-load supabase to prevent crash when env vars are missing (e.g. Vercel without config)
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

  useEffect(() => {
    // English = original, no translation needed
    if (language === 'en') {
      setTranslated(original);
      return;
    }

    const cacheKey = `${reviewId}-${language}`;
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

    supabase.functions
      .invoke('translate-review', {
        body: { texts: original, targetLang: language },
      })
      .then(({ data, error }) => {
        if (controller.signal.aborted) return;
        if (error || !data?.translated) {
          console.error('Translation failed:', error);
          setTranslated(original);
        } else {
          translationCache.set(cacheKey, data.translated);
          setTranslated(data.translated);
        }
        setIsTranslating(false);
      });

    return () => {
      controller.abort();
    };
  }, [language, reviewId, original.review]);

  return { translated, isTranslating };
}
