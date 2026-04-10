import { useEffect, useMemo, useState } from 'react';
import { Link, generatePath, useParams, useSearchParams } from 'react-router-dom';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
import type { Dish, Restaurant } from '@/entities/restaurant/model/types.ts';
import { getPhotoByCategory } from '@/entities/restaurant/lib/get-photo-by-category.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';

type NormalizedRestaurant = Restaurant & {
    dishes: Dish[];
};

export const DishDetailsWidget = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const restaurantId = searchParams.get('restaurantId') ?? '';

    const [restaurant, setRestaurant] = useState<NormalizedRestaurant | null>(null);
    const [dish, setDish] = useState<Dish | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDish = async () => {
            if (!restaurantId) {
                setError('Для этой страницы нужен restaurantId в query параметрах');
                setIsLoading(false);
                return;
            }

            if (!id) {
                setError('Не найден идентификатор блюда');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError('');

                const response = await getRestaurantById(restaurantId);
                const normalized: NormalizedRestaurant = {
                    ...response,
                    dishes: Array.isArray(response.dishes) ? response.dishes : [],
                };

                const foundDish = normalized.dishes.find((currentDish) => currentDish.id === id);

                if (!foundDish) {
                    setError('Блюдо не найдено в выбранном ресторане');
                    setRestaurant(normalized);
                    setDish(null);
                    return;
                }

                setRestaurant(normalized);
                setDish(foundDish);
            } catch (loadError) {
                setError(getApiErrorMessage(loadError, 'Не удалось загрузить страницу блюда'));
            } finally {
                setIsLoading(false);
            }
        };

        void loadDish();
    }, [id, restaurantId]);

    const previewPhoto = useMemo(() => {
        return getPhotoByCategory(dish?.photos, 'BANNER')
            ?? (Array.isArray(dish?.photos) ? dish?.photos[0] : null);
    }, [dish]);

    if (isLoading) {
        return <div className="container">Загрузка блюда...</div>;
    }

    if (error) {
        return (
            <div className="container" style={{ display: 'grid', gap: '16px', paddingBottom: '48px' }}>
                <div>{error}</div>

                {restaurantId ? (
                    <Link to={generatePath(RoutePaths.RESTAURANT, { id: restaurantId })}>
                        <button className="secondary-button">Вернуться к ресторану</button>
                    </Link>
                ) : null}
            </div>
        );
    }

    if (!dish || !restaurant) {
        return <div className="container">Блюдо не найдено</div>;
    }

    const backToRestaurantPath = generatePath(RoutePaths.RESTAURANT, { id: restaurant.id });
    const bookingPath = `${RoutePaths.BOOKING}?restaurantId=${restaurant.id}`;

    return (
        <section className="container" style={{ display: 'grid', gap: '24px', paddingBottom: '48px' }}>
            <div className="surface-block" style={{ padding: '24px', display: 'grid', gap: '18px' }}>
                <div style={{ display: 'grid', gap: '8px' }}>
                    <h1 className="page-title">{dish.name}</h1>
                    <div><strong>Ресторан:</strong> {restaurant.name}</div>
                    <div><strong>Категория:</strong> {dish.category}</div>
                    <div><strong>Цена:</strong> {dish.price}</div>
                    <div><strong>Вес:</strong> {dish.weight} г</div>
                    <div><strong>Доступность:</strong> {dish.available ? 'Доступно' : 'Недоступно'}</div>
                    <div><strong>Описание:</strong> {dish.description || 'Не указано'}</div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Link to={backToRestaurantPath}>
                        <button className="secondary-button">Вернуться к ресторану</button>
                    </Link>

                    <Link to={bookingPath}>
                        <button className="primary-button">Перейти к бронированию</button>
                    </Link>
                </div>

                {previewPhoto?.publicUrl ? (
                    <div>
                        <img src={previewPhoto.publicUrl} alt={dish.name} width={420} />
                    </div>
                ) : null}
            </div>

            {Array.isArray(dish.photos) && dish.photos.length > 1 ? (
                <div className="surface-block" style={{ padding: '24px', display: 'grid', gap: '16px' }}>
                    <h2 className="section-title">Фотографии блюда</h2>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {dish.photos.map((photo) => (
                            <img key={photo.id} src={photo.publicUrl} alt={dish.name} width={220} />
                        ))}
                    </div>
                </div>
            ) : null}
        </section>
    );
};