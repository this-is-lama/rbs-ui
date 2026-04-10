import { useEffect, useState } from 'react';
import { getRestaurantCategories } from '@/entities/restaurant/api/get-restaurant-categories.ts';
import { useRestaurantFilters } from '@/features/restaurants/filter-restaurants/model/use-restaurant-filters.ts';
import styles from './RestaurantCategoriesNavbar.module.scss';

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
        <div className={styles.wrapper}>
            <nav className={styles.navbar}>
                <button
                    type="button"
                    onClick={() => setCategory('')}
                    className={`${styles.button} ${filters.category === '' ? styles.buttonActive : ''}`}
                    aria-pressed={filters.category === ''}
                >
                    Все
                </button>

                {categories.map((category) => (
                    <button
                        key={category}
                        type="button"
                        onClick={() => setCategory(category)}
                        className={`${styles.button} ${filters.category === category ? styles.buttonActive : ''}`}
                        aria-pressed={filters.category === category}
                    >
                        {category}
                    </button>
                ))}
            </nav>
        </div>
    );
};