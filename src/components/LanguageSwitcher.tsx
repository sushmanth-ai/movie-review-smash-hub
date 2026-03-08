import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, languageNames, languageFlags } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: Language[] = ['en', 'te', 'hi', 'ta'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border-2 border-primary/50 bg-card/80 backdrop-blur-sm hover:border-primary hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all duration-300"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-primary">{languageFlags[language]}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-card border-2 border-primary/50 rounded-xl shadow-[0_0_25px_rgba(255,215,0,0.3)] overflow-hidden min-w-[160px] animate-scale-in">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors ${
                  language === lang
                    ? 'bg-primary/20 text-primary'
                    : 'text-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <span className="text-lg">{languageFlags[lang]}</span>
                <span>{languageNames[lang]}</span>
                {language === lang && <span className="ml-auto text-primary">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
