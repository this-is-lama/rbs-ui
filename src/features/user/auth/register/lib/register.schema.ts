import { z } from 'zod';

export const registerSchema = z.object({
    name: z
        .string()
        .min(1, 'Имя обязательно')
        .min(2, 'Имя должно содержать минимум 2 символа')
        .max(50, 'Имя слишком длинное'),

    surname: z
        .string()
        .min(1, 'Фамилия обязательна')
        .min(2, 'Фамилия должна содержать минимум 2 символа')
        .max(50, 'Фамилия слишком длинная'),

    email: z
        .email('Введите корректную почту'),

    password: z
        .string()
        .min(1, 'Пароль обязателен')
        .min(6, 'Пароль должен содержать минимум 6 символов')
        .max(100, 'Пароль слишком длинный'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;