import { z } from 'zod';

export const createBookingSchema = z.object({
    restaurantId: z
        .string()
        .min(1, 'Выберите ресторан'),

    tableId: z
        .string()
        .min(1, 'Выберите стол'),

    startAt: z
        .string()
        .min(1, 'Укажите дату и время начала'),

    endAt: z
        .string()
        .min(1, 'Укажите дату и время окончания'),

    guests: z
        .number()
        .min(1, 'Минимум 1 гость')
        .max(50, 'Максимум 50 гостей'),

    comment: z
        .string()
        .max(500, 'Комментарий слишком длинный')
        .optional()
        .or(z.literal('')),
}).superRefine((data, ctx) => {
    if (!data.startAt || !data.endAt) {
        return;
    }

    const start = new Date(data.startAt);
    const end = new Date(data.endAt);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return;
    }

    if (start >= end) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Время окончания должно быть позже времени начала',
            path: ['endAt'],
        });
    }

    const diff = end.getTime() - start.getTime();

    if (diff < 60 * 60 * 1000) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Минимальная длительность бронирования — 1 час',
            path: ['endAt'],
        });
    }
});

export type CreateBookingFormValues = z.infer<typeof createBookingSchema>;