import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth/use-auth.ts';
import { useLanguage } from '@/app/providers/language';
import { getRestaurantCategories } from '@/entities/restaurant/api/get-restaurant-categories.ts';
import { useRestaurantFilters } from '@/features/restaurants/filter-restaurants/model/use-restaurant-filters.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { canManageRestaurants } from '@/shared/lib/auth/roles.ts';
import styles from './restaurant-categories-navbar.module.scss';

const buildCategoryPath = (category: string) => {
    const searchParams = new URLSearchParams();

    if (category.trim()) {
        searchParams.set('category', category.trim());
    }

    const query = searchParams.toString();

    return query ? `${RoutePaths.RESTAURANTS}?${query}` : RoutePaths.RESTAURANTS;
};

export const RestaurantCategoriesNavbar = () => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const { filters, setCategory } = useRestaurantFilters();
    const location = useLocation();
    const isMySection = location.pathname === RoutePaths.MY_RESTAURANTS;
    const canOpenMySection = canManageRestaurants(user?.role);

    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const copy = language === 'en'
        ? {
            all: 'All',
            categoriesAria: 'Restaurant categories',
            categoriesError: 'Failed to load categories',
            categoriesLoading: 'Loading categories...',
            mine: 'Mine',
        }
        : {
            all: 'Все',
            categoriesAria: 'Категории ресторанов',
            categoriesError: 'Не удалось загрузить категории',
            categoriesLoading: 'Загрузка категорий...',
            mine: 'Мои',
        };

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setIsLoading(true);
                setError('');
                const response = await getRestaurantCategories();
                setCategories(response);
            } catch {
                setError(copy.categoriesError);
            } finally {
                setIsLoading(false);
            }
        };

        void loadCategories();
    }, [copy.categoriesError]);

    if (isLoading) {
        return <div>{copy.categoriesLoading}</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className={styles.wrapper}>
            <nav className={styles.navbar} aria-label={copy.categoriesAria}>
                {canOpenMySection ? (
                    <Link
                        to={RoutePaths.MY_RESTAURANTS}
                        className={`${styles.button} ${isMySection ? styles.buttonActive : ''}`}
                        aria-current={isMySection ? 'page' : undefined}
                    >
                        {copy.mine}
                    </Link>
                ) : null}

                {isMySection ? (
                    <Link to={RoutePaths.RESTAURANTS} className={styles.button}>
                        {copy.all}
                    </Link>
                ) : (
                    <button
                        type="button"
                        onClick={() => setCategory('')}
                        className={`${styles.button} ${filters.category === '' ? styles.buttonActive : ''}`}
                        aria-pressed={filters.category === ''}
                    >
                        {copy.all}
                    </button>
                )}

                {categories.map((category) => {
                    if (isMySection) {
                        return (
                            <Link
                                key={category}
                                to={buildCategoryPath(category)}
                                className={styles.button}
                            >
                                {category}
                            </Link>
                        );
                    }

                    return (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setCategory(category)}
                            className={`${styles.button} ${
                                filters.category === category ? styles.buttonActive : ''
                            }`}
                            aria-pressed={filters.category === category}
                        >
                            {category}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};
