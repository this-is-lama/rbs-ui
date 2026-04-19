import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/app/providers/language';
import { getRestaurants } from '@/entities/restaurant/api/get-restaurants.ts';
import type { RestaurantCard as RestaurantCardType } from '@/entities/restaurant/model/types.ts';
import { useRestaurantFilters } from '@/features/restaurants/filter-restaurants/model/use-restaurant-filters.ts';
import { RestaurantCard } from '@/entities/restaurant/ui';
import {
    RestaurantCategoriesNavbar,
    RestaurantsFilterForm,
} from '@/features/restaurants/filter-restaurants/ui';
import type { PageResponse } from '@/shared/api';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { Footer } from '@/widgets/footer/Footer';
import styles from './RestaurantCatalogWidget.module.scss';

type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right';

const buildPagination = (currentPage: number, totalPages: number): PaginationItem[] => {
    if (totalPages <= 1) {
        return [];
    }

    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index);
    }

    if (currentPage <= 2) {
        return [0, 1, 2, 'ellipsis-right', totalPages - 1];
    }

    if (currentPage >= totalPages - 3) {
        return [0, 'ellipsis-left', totalPages - 3, totalPages - 2, totalPages - 1];
    }

    return [0, 'ellipsis-left', currentPage, currentPage + 1, 'ellipsis-right', totalPages - 1];
};

export const RestaurantCatalogWidget = () => {
    const { language } = useLanguage();
    const { filters, setPage } = useRestaurantFilters();
    const [data, setData] = useState<PageResponse<RestaurantCardType> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const copy = language === 'en'
        ? {
            filtersAria: 'Open filters',
            loading: 'Loading restaurants...',
            nextPage: 'Next page',
            notFound: 'No restaurants found',
            prevPage: 'Previous page',
            title: 'Restaurants',
            loadError: 'Failed to load restaurants',
        }
        : {
            filtersAria: 'Открыть фильтры',
            loading: 'Загрузка ресторанов...',
            nextPage: 'Следующая страница',
            notFound: 'Рестораны не найдены',
            prevPage: 'Предыдущая страница',
            title: 'Рестораны',
            loadError: 'Не удалось загрузить список ресторанов',
        };

    useEffect(() => {
        const loadRestaurants = async () => {
            try {
                setIsLoading(true);
                setError('');

                const response = await getRestaurants({
                    name: filters.name,
                    category: filters.category,
                    address: filters.address,
                    page: filters.page,
                    size: filters.size,
                });

                setData(response);
            } catch (loadError) {
                setError(getApiErrorMessage(loadError, copy.loadError));
            } finally {
                setIsLoading(false);
            }
        };

        void loadRestaurants();
    }, [copy.loadError, filters]);

    const handlePrevPage = () => {
        if (!data || data.first) {
            return;
        }

        setPage(Math.max(filters.page - 1, 0));
    };

    const handleNextPage = () => {
        if (!data || data.last) {
            return;
        }

        setPage(filters.page + 1);
    };

    const restaurants = Array.isArray(data?.content) ? data.content : [];

    const paginationItems = useMemo(() => {
        return buildPagination(filters.page, data?.totalPages ?? 0);
    }, [filters.page, data?.totalPages]);

    return (
        <div className={styles.page}>
            <section className={`container ${styles.section}`}>
                <div className={styles.header}>
                    <div className={styles.headerSpacer} />

                    <h1 className={styles.title}>{copy.title}</h1>

                    <div className={styles.filterBox}>
                        <button
                            type="button"
                            className={`${styles.filterButton} ${isFiltersOpen ? styles.filterButtonActive : ''}`}
                            onClick={() => setIsFiltersOpen((current) => !current)}
                            aria-label={copy.filtersAria}
                            aria-expanded={isFiltersOpen}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path
                                    d="M4 7H20M7 12H17M10 17H14"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>

                        {isFiltersOpen ? (
                            <div className={styles.filterDropdown}>
                                <RestaurantsFilterForm onClose={() => setIsFiltersOpen(false)} />
                            </div>
                        ) : null}
                    </div>
                </div>

                <RestaurantCategoriesNavbar />

                {isLoading ? <div className={styles.state}>{copy.loading}</div> : null}
                {error ? <div className={styles.state}>{error}</div> : null}

                {!isLoading && !error && restaurants.length === 0 ? (
                    <div className={styles.state}>{copy.notFound}</div>
                ) : null}

                {!isLoading && !error && restaurants.length > 0 ? (
                    <>
                        <div className={styles.list}>
                            {restaurants.map((restaurant, index) => (
                                <RestaurantCard
                                    key={restaurant.id || `${restaurant.name}-${index}`}
                                    restaurant={restaurant}
                                />
                            ))}
                        </div>

                        {data && data.totalPages > 1 ? (
                            <div className={styles.pagination}>
                                <button
                                    type="button"
                                    className={styles.paginationButton}
                                    onClick={handlePrevPage}
                                    disabled={data.first}
                                    aria-label={copy.prevPage}
                                >
                                    {'<'}
                                </button>

                                {paginationItems.map((item, index) => {
                                    if (typeof item !== 'number') {
                                        return (
                                            <span
                                                key={`${item}-${index}`}
                                                className={styles.paginationDots}
                                            >
                                                ...
                                            </span>
                                        );
                                    }

                                    const isActive = item === filters.page;

                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            className={`${styles.paginationButton} ${isActive ? styles.paginationButtonActive : ''}`}
                                            onClick={() => setPage(item)}
                                            aria-current={isActive ? 'page' : undefined}
                                        >
                                            {item + 1}
                                        </button>
                                    );
                                })}

                                <button
                                    type="button"
                                    className={styles.paginationButton}
                                    onClick={handleNextPage}
                                    disabled={data.last}
                                    aria-label={copy.nextPage}
                                >
                                    {'>'}
                                </button>
                            </div>
                        ) : null}
                    </>
                ) : null}
            </section>

            <Footer />
        </div>
    );
};
