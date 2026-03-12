import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, languageNames, languageFlags } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const languages: Language[] = ['en', 'te', 'hi', 'ta'];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-full border border-primary/40 bg-background/90 backdrop-blur-sm hover:border-primary hover:shadow-[0_0_10px_rgba(255,215,0,0.3)] transition-all duration-200"
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-bold text-primary uppercase">{language}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-[9999] bg-background border border-primary/40 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(255,215,0,0.2)] overflow-hidden min-w-[140px]">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors border-b border-primary/10 last:border-b-0 ${
                language === lang
                  ? 'bg-primary/15 text-primary'
                  : 'text-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <span className="text-sm">{languageFlags[lang]}</span>
              <span className="flex-1 text-left">{languageNames[lang]}</span>
              {language === lang && <span className="text-primary text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
