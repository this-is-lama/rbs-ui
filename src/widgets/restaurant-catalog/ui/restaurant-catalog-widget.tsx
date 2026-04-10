import { useEffect, useState } from 'react';
import { getRestaurants } from '@/entities/restaurant/api/get-restaurants.ts';
import type { RestaurantCard as RestaurantCardType } from '@/entities/restaurant/model/types.ts';
import type { PageResponse } from '@/shared/api';
import { RestaurantCard } from '@/entities/restaurant/ui/restaurant-card.tsx';
import { RestaurantsFilterForm } from '@/features/restaurants/filter-restaurants/ui/restaurants-filter-form.tsx';
import { useRestaurantFilters } from '@/features/restaurants/filter-restaurants/model/use-restaurant-filters.ts';
import { RestaurantCategoriesNavbar } from '@/features/restaurants/filter-restaurants/ui/restaurant-categories-navbar.tsx';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';

export const RestaurantCatalogWidget = () => {
    const { filters, setPage } = useRestaurantFilters();
    const [data, setData] = useState<PageResponse<RestaurantCardType> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

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
                setError(getApiErrorMessage(loadError, 'Не удалось загрузить список ресторанов'));
            } finally {
                setIsLoading(false);
            }
        };

        void loadRestaurants();
    }, [filters]);

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

    return (
        <section className="container" style={{ display: 'grid', gap: '24px', paddingBottom: '48px' }}>
            <div style={{ display: 'grid', gap: '8px' }}>
                <h2 className="section-title">Фильтрация ресторанов</h2>
                <div style={{ color: '#777' }}>
                    Выбирай ресторан по категории, названию и адресу.
                </div>
            </div>

            <RestaurantCategoriesNavbar />
            <RestaurantsFilterForm />

            {isLoading ? <div>Загрузка ресторанов...</div> : null}
            {error ? <div>{error}</div> : null}

            {!isLoading && !error && restaurants.length === 0 ? (
                <div>Рестораны не найдены</div>
            ) : null}

            {!isLoading && !error && data ? (
                <div style={{ display: 'grid', gap: '18px' }}>
                    <div>
                        <strong>Всего найдено:</strong> {data.totalElements}
                    </div>

                    {restaurants.map((restaurant, index) => (
                        <div key={restaurant.id || `${restaurant.name}-${index}`}>
                            <RestaurantCard restaurant={restaurant} />
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                            Страница {data.number + 1} из {data.totalPages || 1}
                        </div>

                        <button className="secondary-button" type="button" onClick={handlePrevPage} disabled={data.first}>
                            Назад
                        </button>

                        <button className="secondary-button" type="button" onClick={handleNextPage} disabled={data.last}>
                            Вперед
                        </button>
                    </div>
                </div>
            ) : null}
        </section>
    );
};