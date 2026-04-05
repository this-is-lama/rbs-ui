import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/shared/ui/input/input.tsx';
import { Button } from '@/shared/ui/button/button.tsx';
import { useRestaurantFilters } from '../model/use-restaurant-filters';

type RestaurantFiltersFormValues = {
    name: string;
    category: string;
    address: string;
};

export const RestaurantsFilterForm = () => {
    const { filters, setFilters } = useRestaurantFilters();

    const form = useForm<RestaurantFiltersFormValues>({
        defaultValues: {
            name: filters.name,
            category: filters.category,
            address: filters.address,
        },
    });

    useEffect(() => {
        form.reset({
            name: filters.name,
            category: filters.category,
            address: filters.address,
        });
    }, [filters, form]);

    const onSubmit = form.handleSubmit((values) => {
        setFilters(values);
    });

    const handleReset = () => {
        form.reset({
            name: '',
            category: '',
            address: '',
        });

        setFilters({
            name: '',
            category: '',
            address: '',
        });
    };

    return (
        <form onSubmit={onSubmit}>
            <Input
                label="Название"
                placeholder="Введите название ресторана"
                {...form.register('name')}
            />

            <Input
                label="Категория"
                placeholder="Введите категорию"
                {...form.register('category')}
            />

            <Input
                label="Адрес"
                placeholder="Введите адрес"
                {...form.register('address')}
            />

            <Button type="submit">Применить фильтры</Button>
            <Button type="button" onClick={handleReset}>Сбросить</Button>
        </form>
    );
};