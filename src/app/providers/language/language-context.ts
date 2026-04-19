import { createContext } from 'react';
import { DEFAULT_APP_LANGUAGE, resolveIntlLocale, type AppLanguage } from '@/shared/config/language.ts';

export type LanguageContextValue = {
    language: AppLanguage;
    locale: string;
    setLanguage: (language: AppLanguage) => void;
    toggleLanguage: () => void;
};

export const LanguageContext = createContext<LanguageContextValue>({
    language: DEFAULT_APP_LANGUAGE,
    locale: resolveIntlLocale(DEFAULT_APP_LANGUAGE),
    setLanguage: () => undefined,
    toggleLanguage: () => undefined,
});
