import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Language, LanguageOption, TranslationSchema } from './types';
import { translations, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string, fallbackOrParams?: string | Record<string, string | number>, params?: Record<string, string | number>) => string;
  supportedLanguages: LanguageOption[];
  currentLanguageOption: LanguageOption;
}

const STORAGE_KEY = 'ngo_digital_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved && translations[saved]) {
        return saved;
      }
    } catch {
      // LocalStorage access fallback
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = useCallback((newLang: Language) => {
    if (translations[newLang]) {
      setLanguageState(newLang);
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch {
        // storage fallback
      }
      document.documentElement.lang = newLang;
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const currentLanguageOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const t = useCallback((
    keyPath: string,
    fallbackOrParams?: string | Record<string, string | number>,
    paramsObj?: Record<string, string | number>
  ): string => {
    let fallbackText: string | undefined = undefined;
    let params: Record<string, string | number> | undefined = undefined;

    if (typeof fallbackOrParams === 'string') {
      fallbackText = fallbackOrParams;
      params = paramsObj;
    } else if (typeof fallbackOrParams === 'object' && fallbackOrParams !== null) {
      params = fallbackOrParams;
    }

    // 1. Try current language
    let text = getNestedValue(translations[language], keyPath);

    // 2. Fallback to English if not found in current language
    if (!text && language !== 'en') {
      text = getNestedValue(translations.en, keyPath);
    }

    // 3. Fallback to provided fallbackText or keyPath
    if (!text) {
      text = fallbackText || keyPath;
    }

    // 4. Interpolate params {name}, {count}, etc.
    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text!.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return text;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    supportedLanguages: SUPPORTED_LANGUAGES,
    currentLanguageOption
  }), [language, setLanguage, t, currentLanguageOption]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
