import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
    APP_LANGUAGE_STORAGE_KEY,
    DEFAULT_APP_LANGUAGE,
    isAppLanguage,
    resolveIntlLocale,
    type AppLanguage,
} from '@/shared/config';
import { LanguageContext } from './language-context.ts';

const getInitialLanguage = (): AppLanguage => {
    if (typeof window === 'undefined') {
        return DEFAULT_APP_LANGUAGE;
    }

    const storedLanguage = window.localStorage.getItem(APP_LANGUAGE_STORAGE_KEY);

    if (isAppLanguage(storedLanguage)) {
        return storedLanguage;
    }

    return DEFAULT_APP_LANGUAGE;
};

export const LanguageProvider = ({ children }: PropsWithChildren) => {
    const [language, setLanguage] = useState<AppLanguage>(getInitialLanguage);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language);
        }

        if (typeof document !== 'undefined') {
            document.documentElement.lang = language;
        }
    }, [language]);

    const value = useMemo(() => {
        return {
            language,
            locale: resolveIntlLocale(language),
            setLanguage,
            toggleLanguage: () => {
                setLanguage((currentLanguage) => currentLanguage === 'ru' ? 'en' : 'ru');
            },
        };
    }, [language]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
