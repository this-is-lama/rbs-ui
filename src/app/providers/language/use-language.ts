import { useContext } from 'react';
import { LanguageContext } from './language-context.ts';

export const useLanguage = () => {
    return useContext(LanguageContext);
};
