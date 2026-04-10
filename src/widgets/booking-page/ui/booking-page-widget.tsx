import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRestaurants } from '@/entities/restaurant/api/get-restaurants.ts';
import type { RestaurantCard } from '@/entities/restaurant/model/types.ts';
import type { PageResponse } from '@/shared/api';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { CreateBookingForm } from '@/features/booking/create-booking/ui/create-booking-form.tsx';
import { MyBookingsList } from './my-bookings-list.tsx';

export const BookingPageWidget = () => {
    const [searchParams] = useSearchParams();
    const [restaurants, setRestaurants] = useState<RestaurantCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const initialRestaurantId = useMemo(() => searchParams.get('restaurantId') ?? '', [searchParams]);
    const initialTableId = useMemo(() => searchParams.get('tableId') ?? '', [searchParams]);

    useEffect(() => {
        const loadRestaurants = async () => {
            try {
                setIsLoading(true);
                setError('');

                const response = await getRestaurants({
                    page: 0,
                    size: 100,
                });

                const page = response as PageResponse<RestaurantCard>;
                setRestaurants(Array.isArray(page.content) ? page.content : []);
            } catch (loadError) {
                setError(getApiErrorMessage(loadError, 'Не удалось загрузить рестораны для формы бронирования'));
            } finally {
                setIsLoading(false);
            }
        };

        void loadRestaurants();
    }, []);

    return (
        <section className="container" style={{ display: 'grid', gap: '24px', paddingBottom: '48px' }}>
            <div style={{ display: 'grid', gap: '8px' }}>
                <h1 className="page-title">Бронирование</h1>
                <div style={{ color: '#777' }}>
                    Здесь можно создать новую бронь и посмотреть все свои текущие бронирования.
                </div>
            </div>

            {isLoading ? <div>Загрузка формы бронирования...</div> : null}
            {error ? <div>{error}</div> : null}

            {!isLoading && !error ? (
                <div style={{ display: 'grid', gap: '24px' }}>
                    <CreateBookingForm
                        restaurants={restaurants}
                        initialRestaurantId={initialRestaurantId}
                        initialTableId={initialTableId}
                        onCreated={() => setRefreshKey((current) => current + 1)}
                    />

                    <div style={{ display: 'grid', gap: '16px' }}>
                        <h2 className="section-title">Мои бронирования</h2>
                        <MyBookingsList refreshKey={refreshKey} />
                    </div>
                </div>
            ) : null}
        </section>
    );
};