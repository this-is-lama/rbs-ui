import { z } from 'zod';
import type {
    Dish,
    DishManageFormValues,
    DishManageRequest,
} from '@/entities/restaurant/model/types.ts';
import type { AppLanguage } from '@/shared/config';

export const createDishManageSchema = (language: AppLanguage) => {
    const copy = language === 'en'
        ? {
            max2000: 'Maximum 2000 characters',
            max255: 'Maximum 255 characters',
            max100: 'Maximum 100 characters',
            min2: 'Minimum 2 characters',
            priceRequired: 'Enter a price',
            pricePositive: 'Price must be greater than zero',
            weightRequired: 'Enter the weight',
            weightPositive: 'Weight must be greater than zero',
        }
        : {
            max2000: 'Максимум 2000 символов',
            max255: 'Максимум 255 символов',
            max100: 'Максимум 100 символов',
            min2: 'Минимум 2 символа',
            priceRequired: 'Укажите цену',
            pricePositive: 'Цена должна быть больше нуля',
            weightRequired: 'Укажите вес',
            weightPositive: 'Вес должен быть больше нуля',
        };

    return z.object({
        name: z.string().trim().min(2, copy.min2).max(255, copy.max255),
        category: z.string().trim().min(2, copy.min2).max(100, copy.max100),
        description: z.string().max(2000, copy.max2000),
        price: z.string().trim().min(1, copy.priceRequired).refine((value) => {
            const numeric = Number.parseFloat(value.replace(',', '.'));
            return Number.isFinite(numeric) && numeric > 0;
        }, copy.pricePositive),
        weight: z.string().trim().min(1, copy.weightRequired).refine((value) => {
            const numeric = Number.parseInt(value, 10);
            return Number.isFinite(numeric) && numeric > 0;
        }, copy.weightPositive),
        available: z.boolean(),
    });
};

export const createDefaultDishManageFormValues = (): DishManageFormValues => {
    return {
        name: '',
        category: '',
        description: '',
        price: '',
        weight: '',
        available: true,
    };
};

export const mapDishToManageFormValues = (dish: Dish): DishManageFormValues => {
    return {
        name: dish.name ?? '',
        category: dish.category ?? '',
        description: dish.description ?? '',
        price: String(dish.price ?? ''),
        weight: String(dish.weight ?? ''),
        available: Boolean(dish.available),
    };
};

export const toDishManageRequest = (values: DishManageFormValues): DishManageRequest => {
    return {
        name: values.name.trim(),
        category: values.category.trim(),
        description: values.description.trim() || null,
        price: Number.parseFloat(values.price.replace(',', '.')),
        weight: Number.parseInt(values.weight, 10),
        available: values.available,
    };
};
