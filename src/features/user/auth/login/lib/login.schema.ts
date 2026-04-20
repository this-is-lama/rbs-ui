import { z } from 'zod';
import type { AppLanguage } from '@/shared/config';

export const createLoginSchema = (language: AppLanguage) => {
    const copy = language === 'en'
        ? {
            email: 'Enter a valid email',
            password: 'Password is required',
        }
        : {
            email: 'Введите корректную почту',
            password: 'Пароль обязателен',
        };

    return z.object({
        email: z.email(copy.email),
        password: z.string().min(1, copy.password),
    });
};

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
