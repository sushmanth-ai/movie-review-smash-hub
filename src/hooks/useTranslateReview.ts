import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { MovieReview } from '@/data/movieReviews';

interface ReviewTexts {
  title: string;
  review: string;
  firstHalf: string;
  secondHalf: string;
  positives: string;
  negatives: string;
  overall: string;
}

// Persistent in-memory cache for translated content (clears on page reload)
const translationCache = new Map<string, ReviewTexts>();

// Language code map for MyMemory API
const LANG_CODE_MAP: Record<string, string> = {
  te: 'te',
  hi: 'hi',
  ta: 'ta',
  en: 'en',
};

/**
 * Translates a single piece of text using MyMemory free API.
 * No API key required. Limit: 5000 chars/day per IP (usually enough for reviews).
 */
async function translateText(text: string, targetLang: string, signal: AbortSignal): Promise<string> {
  if (!text || text.trim() === '') return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  const data = await response.json();
  const translated = data?.responseData?.translatedText;
  if (translated && data?.responseStatus === 200) {
    return translated;
  }
  return text; // fallback to original if translation fails
}

/**
 * Translates all ReviewTexts fields in parallel for speed.
 */
async function translateAll(texts: ReviewTexts, targetLang: string, signal: AbortSignal): Promise<ReviewTexts> {
  const fields: (keyof ReviewTexts)[] = ['title', 'review', 'firstHalf', 'secondHalf', 'positives', 'negatives', 'overall'];
  const results = await Promise.all(
    fields.map(field => translateText(texts[field], targetLang, signal).catch(() => texts[field]))
  );
  return Object.fromEntries(fields.map((f, i) => [f, results[i]])) as ReviewTexts;
}

export function useTranslateReview(
  reviewId: string,
  original: ReviewTexts,
  localTranslations?: MovieReview['translations']
) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState<ReviewTexts>(original);
  const [isTranslating, setIsTranslating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stableOriginal = useMemo(() => ({
    title: original.title || '',
    review: original.review || '',
    firstHalf: original.firstHalf || '',
    secondHalf: original.secondHalf || '',
    positives: original.positives || '',
    negatives: original.negatives || '',
    overall: original.overall || '',
  }), [original.title, original.review, original.firstHalf, original.secondHalf, original.positives, original.negatives, original.overall]);

  const contentKey = useMemo(() => {
    return `${reviewId}|${stableOriginal.review}|${stableOriginal.firstHalf}`;
  }, [reviewId, stableOriginal.review, stableOriginal.firstHalf]);

  useEffect(() => {
    // English: always show the (possibly already-in-English) original
    if (language === 'en') {
      const localEn = localTranslations?.['en'];
      if (localEn) {
        setTranslated({
          title: localEn.title || stableOriginal.title,
          review: localEn.review || stableOriginal.review,
          firstHalf: localEn.firstHalf || stableOriginal.firstHalf,
          secondHalf: localEn.secondHalf || stableOriginal.secondHalf,
          positives: localEn.positives || stableOriginal.positives,
          negatives: localEn.negatives || stableOriginal.negatives,
          overall: localEn.overall || stableOriginal.overall,
        });
      } else {
        setTranslated(stableOriginal);
      }
      setIsTranslating(false);
      return;
    }

    // Skip if content not loaded yet
    if (!stableOriginal.review && !stableOriginal.firstHalf && !stableOriginal.title) {
      setTranslated(stableOriginal);
      return;
    }

    // Use local translations if available (highest priority after English)
    const local = localTranslations?.[language];
    if (local) {
      setTranslated({
        title: local.title || stableOriginal.title,
        review: local.review || stableOriginal.review,
        firstHalf: local.firstHalf || stableOriginal.firstHalf,
        secondHalf: local.secondHalf || stableOriginal.secondHalf,
        positives: local.positives || stableOriginal.positives,
        negatives: local.negatives || stableOriginal.negatives,
        overall: local.overall || stableOriginal.overall,
      });
      setIsTranslating(false);
      return;
    }

    // Check in-memory cache
    const cacheKey = `${contentKey}-${language}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      setTranslated(cached);
      setIsTranslating(false);
      return;
    }

    // Auto-translate using MyMemory free API
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const targetLang = LANG_CODE_MAP[language] || language;

    const doTranslate = async () => {
      if (controller.signal.aborted) return;
      setIsTranslating(true);

      try {
        const result = await translateAll(stableOriginal, targetLang, controller.signal);
        if (controller.signal.aborted) return;
        translationCache.set(cacheKey, result);
        setTranslated(result);
      } catch (err: any) {
        if (err.name === 'AbortError' || controller.signal.aborted) return;
        console.error('Auto-translation failed:', err);
        setTranslated(stableOriginal);
      } finally {
        if (!controller.signal.aborted) {
          setIsTranslating(false);
        }
      }
    };

    // Short delay to debounce rapid language switches
    const timeout = setTimeout(doTranslate, 200);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [language, contentKey, stableOriginal, localTranslations]);

  return { translated, isTranslating };
}
