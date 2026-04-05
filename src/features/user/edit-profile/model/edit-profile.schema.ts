import { z } from 'zod';

export const editProfileSchema = z.object({
    name: z
        .string()
        .min(1, 'Имя обязательно')
        .min(2, 'Имя должно содержать минимум 2 символа')
        .max(100, 'Имя слишком длинное'),

    surname: z
        .string()
        .min(1, 'Фамилия обязательна')
        .min(2, 'Фамилия должна содержать минимум 2 символа')
        .max(100, 'Фамилия слишком длинная'),

    dateOfBirth: z
        .string()
        .nullable()
        .or(z.literal('')),

    phone: z
        .string()
        .max(12, 'Телефон слишком длинный')
        .nullable()
        .or(z.literal('')),

    email: z
        .email('Введите корректную почту'),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;