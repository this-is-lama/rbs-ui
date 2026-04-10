import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/shared/ui/input/input.tsx';
import { Button } from '@/shared/ui/button/button.tsx';
import {useRestaurantFilters} from "@/features/restaurants/filter-restaurants/model/use-restaurant-filters.ts";

type RestaurantFiltersFormValues = {
    name: string;
    address: string;
};

export const RestaurantsFilterForm = () => {
    const { filters, setFilters } = useRestaurantFilters();

    const form = useForm<RestaurantFiltersFormValues>({
        defaultValues: {
            name: filters.name,
            address: filters.address,
        },
    });

    useEffect(() => {
        form.reset({
            name: filters.name,
            address: filters.address,
        });
    }, [filters, form]);

    const onSubmit = form.handleSubmit((values) => {
        setFilters({
            name: values.name,
            address: values.address,
            category: filters.category,
        });
    });

    const handleReset = () => {
        form.reset({
            name: '',
            address: '',
        });

        setFilters({
            name: '',
            address: '',
            category: '',
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
                label="Адрес"
                placeholder="Введите адрес"
                {...form.register('address')}
            />

            <Button type="submit">Применить фильтры</Button>
            <Button type="button" onClick={handleReset}>
                Сбросить
            </Button>
        </form>
    );
};