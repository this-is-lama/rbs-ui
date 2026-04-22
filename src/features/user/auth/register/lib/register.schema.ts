import { z } from 'zod';
import type { AppLanguage } from '@/shared/config';

export const createRegisterSchema = (language: AppLanguage) => {
    const copy = language === 'en'
        ? {
            email: 'Enter a valid email',
            nameLong: 'Name is too long',
            nameMin: 'Name must contain at least 2 characters',
            nameRequired: 'Name is required',
            passwordLong: 'Password is too long',
            passwordMin: 'Password must contain at least 6 characters',
            passwordRequired: 'Password is required',
            surnameLong: 'Surname is too long',
            surnameMin: 'Surname must contain at least 2 characters',
            surnameRequired: 'Surname is required',
        }
        : {
            email: 'Введите корректную почту',
            nameLong: 'Имя слишком длинное',
            nameMin: 'Имя должно содержать минимум 2 символа',
            nameRequired: 'Имя обязательно',
            passwordLong: 'Пароль слишком длинный',
            passwordMin: 'Пароль должен содержать минимум 6 символов',
            passwordRequired: 'Пароль обязателен',
            surnameLong: 'Фамилия слишком длинная',
            surnameMin: 'Фамилия должна содержать минимум 2 символа',
            surnameRequired: 'Фамилия обязательна',
        };

    return z.object({
        name: z
            .string()
            .min(1, copy.nameRequired)
            .min(2, copy.nameMin)
            .max(50, copy.nameLong),
        surname: z
            .string()
            .min(1, copy.surnameRequired)
            .min(2, copy.surnameMin)
            .max(50, copy.surnameLong),
        email: z.email(copy.email),
        password: z
            .string()
            .min(1, copy.passwordRequired)
            .min(6, copy.passwordMin)
            .max(100, copy.passwordLong),
        role: z.enum(['ROLE_MANAGER', 'ROLE_USER']),
    });
};

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;
