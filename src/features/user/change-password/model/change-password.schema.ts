import { z } from 'zod';

export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, 'Текущий пароль обязателен'),

        newPassword: z
            .string()
            .min(6, 'Новый пароль должен содержать минимум 6 символов')
            .max(100, 'Пароль слишком длинный'),

        confirmPassword: z
            .string()
            .min(1, 'Подтверждение пароля обязательно'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Пароли не совпадают',
        path: ['confirmPassword'],
    });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;