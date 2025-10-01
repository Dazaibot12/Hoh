'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import en from '@/lang/en.json';
import id from '@/lang/id.json';

export type Language = 'en' | 'id';

type Translations = typeof en;

const languages: Record<Language, Translations> = { en, id };

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof Translations, options?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'dazai-convert-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('id'); // Default to Indonesian
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let initialLang: Language = 'id';
    try {
      const storedLang = localStorage.getItem(LANGUAGE_KEY);
      if (storedLang && (storedLang === 'en' || storedLang === 'id')) {
        initialLang = storedLang;
      } else {
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'en') {
          initialLang = 'en';
        }
      }
    } catch (error) {
      console.error("Failed to load language from localStorage", error);
    }
    setLang(initialLang);
    setIsLoaded(true);
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem(LANGUAGE_KEY, newLang);
    } catch (error) {
      console.error("Failed to save language to localStorage", error);
    }
  };

  const t = (key: keyof Translations, options?: Record<string, string | number>): string => {
    let translation = languages[lang][key] || languages['en'][key] || key;
    if (options) {
      Object.keys(options).forEach(optionKey => {
        translation = translation.replace(`{${optionKey}}`, String(options[optionKey]));
      });
    }
    return translation;
  };
  
  if (!isLoaded) {
    return null; // or a loading skeleton
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
