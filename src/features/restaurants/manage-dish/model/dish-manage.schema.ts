import { z } from 'zod';
import type {
    Dish,
    DishManageFormValues,
    DishManageRequest,
} from '@/entities/restaurant/model/types.ts';

export const dishManageSchema = z.object({
    name: z.string().trim().min(2, 'Минимум 2 символа').max(255, 'Максимум 255 символов'),
    category: z.string().trim().min(2, 'Минимум 2 символа').max(100, 'Максимум 100 символов'),
    description: z.string().max(2000, 'Максимум 2000 символов'),
    price: z.string().trim().min(1, 'Укажите цену').refine((value) => {
        const numeric = Number.parseFloat(value.replace(',', '.'));
        return Number.isFinite(numeric) && numeric > 0;
    }, 'Цена должна быть больше нуля'),
    weight: z.string().trim().min(1, 'Укажите вес').refine((value) => {
        const numeric = Number.parseInt(value, 10);
        return Number.isFinite(numeric) && numeric > 0;
    }, 'Вес должен быть больше нуля'),
    available: z.boolean(),
});

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
