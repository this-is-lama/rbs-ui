import { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button/button.tsx';
import { getRestaurantCategories } from '@/entities/restaurant/api/get-restaurant-categories.ts';
import {useRestaurantFilters} from "@/features/restaurants/filter-restaurants/model/use-restaurant-filters.ts";

export const RestaurantCategoriesNavbar = () => {
    const { filters, setCategory } = useRestaurantFilters();

    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setIsLoading(true);
                setError('');

                const response = await getRestaurantCategories();
                setCategories(response);
            } catch {
                setError('Не удалось загрузить категории');
            } finally {
                setIsLoading(false);
            }
        };

        void loadCategories();
    }, []);

    if (isLoading) {
        return <div>Загрузка категорий...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <nav>
            <Button
                type="button"
                onClick={() => setCategory('')}
                aria-pressed={filters.category === ''}
            >
                Все
            </Button>

            {categories.map((category) => (
                <Button
                    key={category}
                    type="button"
                    onClick={() => setCategory(category)}
                    aria-pressed={filters.category === category}
                >
                    {category}
                </Button>
            ))}
        </nav>
    );
};