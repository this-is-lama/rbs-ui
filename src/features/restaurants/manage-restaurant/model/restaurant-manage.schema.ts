import { z } from 'zod';
import type {
    Restaurant,
    RestaurantManageFormValues,
    RestaurantManageRequest,
    WeekDay,
    WorkingHours,
} from '@/entities/restaurant/model/types.ts';

export const restaurantWeekDays: WeekDay[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
];

const weekDayValues = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
] as const;

const contactTypeValues = ['PHONE', 'EMAIL', 'WEBSITE'] as const;

const workingHoursSchema = z.object({
    dayOfWeek: z.enum(weekDayValues),
    openTime: z.string().nullable(),
    closeTime: z.string().nullable(),
    closed: z.boolean(),
}).superRefine((value, ctx) => {
    if (value.closed) {
        return;
    }

    if (!value.openTime || !value.closeTime) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['openTime'],
            message: 'Укажите время открытия и закрытия',
        });
        return;
    }

    if (value.openTime >= value.closeTime) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['closeTime'],
            message: 'Время закрытия должно быть позже открытия',
        });
    }
});

const contactSchema = z.object({
    type: z.enum(contactTypeValues),
    value: z.string().trim().min(1, 'Укажите значение контакта').max(255, 'Максимум 255 символов'),
});

const pricingChargeSchema = z.string()
    .trim()
    .min(1, 'Укажите сумму')
    .refine((value) => Number.isFinite(Number(value.replace(',', '.'))), 'Укажите число')
    .refine((value) => Number(value.replace(',', '.')) >= 0, 'Сумма не может быть отрицательной')
    .refine((value) => Number(value.replace(',', '.')) <= 10000, 'Максимум 10000');

export const restaurantManageSchema = z.object({
    name: z.string().trim().min(2, 'Минимум 2 символа').max(255, 'Максимум 255 символов'),
    category: z.string().trim().min(2, 'Минимум 2 символа').max(100, 'Максимум 100 символов'),
    description: z.string().max(2000, 'Максимум 2000 символов'),
    address: z.string().trim().min(3, 'Минимум 3 символа').max(255, 'Максимум 255 символов'),
    active: z.boolean(),
    minPricingCharge: pricingChargeSchema,
    maxPricingCharge: pricingChargeSchema,
    workingHours: z.array(workingHoursSchema).length(restaurantWeekDays.length),
    contacts: z.array(contactSchema).min(1, 'Добавьте хотя бы один контакт'),
}).superRefine((value, ctx) => {
    const minPricingCharge = Number(value.minPricingCharge.replace(',', '.'));
    const maxPricingCharge = Number(value.maxPricingCharge.replace(',', '.'));

    if (Number.isFinite(minPricingCharge)
        && Number.isFinite(maxPricingCharge)
        && minPricingCharge > maxPricingCharge) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['maxPricingCharge'],
            message: 'Максимальный сбор должен быть не меньше минимального',
        });
    }
});

const normalizeTime = (value: string | null | undefined) => {
    return value ? value.slice(0, 5) : null;
};

const normalizeMoneyInput = (value: string | number | null | undefined, fallback: number) => {
    if (value === null || value === undefined || value === '') {
        return String(fallback);
    }

    return String(value);
};

const toMoneyNumber = (value: string) => {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
};

const createDefaultWorkingHours = (): WorkingHours[] => {
    return restaurantWeekDays.map((dayOfWeek) => ({
        dayOfWeek,
        openTime: '10:00',
        closeTime: '22:00',
        closed: false,
    }));
};

export const createDefaultRestaurantManageFormValues = (): RestaurantManageFormValues => {
    return {
        name: '',
        category: '',
        description: '',
        address: '',
        active: true,
        minPricingCharge: '100',
        maxPricingCharge: '1000',
        workingHours: createDefaultWorkingHours(),
        contacts: [
            {
                type: 'PHONE',
                value: '',
            },
        ],
    };
};

export const mapRestaurantToManageFormValues = (
    restaurant: Restaurant,
): RestaurantManageFormValues => {
    const workingHours = Array.isArray(restaurant.workingHours) ? restaurant.workingHours : [];
    const contacts = Array.isArray(restaurant.contacts) ? restaurant.contacts : [];

    return {
        name: restaurant.name ?? '',
        category: restaurant.category ?? '',
        description: restaurant.description ?? '',
        address: restaurant.address ?? '',
        active: Boolean(restaurant.active),
        minPricingCharge: normalizeMoneyInput(restaurant.minPricingCharge, 100),
        maxPricingCharge: normalizeMoneyInput(restaurant.maxPricingCharge, 1000),
        workingHours: restaurantWeekDays.map((dayOfWeek) => {
            const item = workingHours.find((current) => current.dayOfWeek === dayOfWeek);

            if (!item) {
                return {
                    dayOfWeek,
                    openTime: '10:00',
                    closeTime: '22:00',
                    closed: false,
                };
            }

            return {
                dayOfWeek,
                openTime: normalizeTime(item.openTime),
                closeTime: normalizeTime(item.closeTime),
                closed: Boolean(item.closed),
            };
        }),
        contacts: contacts.length > 0
            ? contacts.map((contact) => ({
                type: contact.type,
                value: contact.value ?? '',
            }))
            : [
                {
                    type: 'PHONE',
                    value: '',
                },
            ],
    };
};

export const toRestaurantManageRequest = (
    values: RestaurantManageFormValues,
): RestaurantManageRequest => {
    return {
        name: values.name.trim(),
        category: values.category.trim(),
        description: values.description.trim() || null,
        address: values.address.trim(),
        active: values.active,
        minPricingCharge: toMoneyNumber(values.minPricingCharge),
        maxPricingCharge: toMoneyNumber(values.maxPricingCharge),
        workingHours: values.workingHours.map((item) => ({
            dayOfWeek: item.dayOfWeek,
            openTime: item.closed ? null : normalizeTime(item.openTime),
            closeTime: item.closed ? null : normalizeTime(item.closeTime),
            closed: item.closed,
        })),
        contacts: values.contacts.map((contact) => ({
            type: contact.type,
            value: contact.value.trim(),
        })),
    };
};
