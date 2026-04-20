export type AppLanguage = 'ru' | 'en';

export const DEFAULT_APP_LANGUAGE: AppLanguage = 'ru';
export const APP_LANGUAGE_STORAGE_KEY = 'rbs-app-language';

export const isAppLanguage = (value: string | null | undefined): value is AppLanguage => {
    return value === 'ru' || value === 'en';
};

export const resolveIntlLocale = (language: AppLanguage) => {
    return language === 'en' ? 'en-US' : 'ru-RU';
};

