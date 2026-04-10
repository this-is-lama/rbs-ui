import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
import type {
    Contact,
    Dish,
    Photo,
    Restaurant,
    RestaurantTable,
    WorkingHours,
} from '@/entities/restaurant/model/types.ts';
import { RestaurantWorkingHours } from '@/entities/restaurant/ui/restaurant-working-hours.tsx';
import { DishCard } from '@/entities/restaurant/ui/dish-card.tsx';
import { TableCard } from '@/entities/restaurant/ui/table-card.tsx';
import { getPhotoByCategory } from '@/entities/restaurant/lib/get-photo-by-category.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';

const contactTypeLabels: Record<string, string> = {
    PHONE: 'Телефон',
    EMAIL: 'Email',
    WEBSITE: 'Сайт',
};

type NormalizedRestaurant = Omit<
    Restaurant,
    'workingHours' | 'contacts' | 'dishes' | 'tables' | 'photos'
> & {
    workingHours: WorkingHours[];
    contacts: Contact[];
    dishes: Dish[];
    tables: RestaurantTable[];
    photos: Photo[];
};

const normalizeRestaurant = (restaurant: Restaurant): NormalizedRestaurant => {
    return {
        ...restaurant,
        workingHours: Array.isArray(restaurant.workingHours) ? restaurant.workingHours : [],
        contacts: Array.isArray(restaurant.contacts) ? restaurant.contacts : [],
        dishes: Array.isArray(restaurant.dishes) ? restaurant.dishes : [],
        tables: Array.isArray(restaurant.tables) ? restaurant.tables : [],
        photos: Array.isArray(restaurant.photos) ? restaurant.photos : [],
    };
};

export const RestaurantDetailsWidget = () => {
    const { id } = useParams<{ id: string }>();
    const [restaurant, setRestaurant] = useState<NormalizedRestaurant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadRestaurant = async () => {
            if (!id) {
                setError('Не найден идентификатор ресторана');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError('');

                const response = await getRestaurantById(id);
                setRestaurant(normalizeRestaurant(response));
            } catch (loadError) {
                setError(getApiErrorMessage(loadError, 'Не удалось загрузить ресторан'));
            } finally {
                setIsLoading(false);
            }
        };

        void loadRestaurant();
    }, [id]);

    const bannerPhoto = useMemo(() => {
        return getPhotoByCategory(restaurant?.photos, 'BANNER');
    }, [restaurant]);

    const schemePhoto = useMemo(() => {
        return getPhotoByCategory(restaurant?.photos, 'SCHEME');
    }, [restaurant]);

    if (isLoading) {
        return <div className="container">Загрузка ресторана...</div>;
    }

    if (error) {
        return <div className="container">{error}</div>;
    }

    if (!restaurant) {
        return <div className="container">Ресторан не найден</div>;
    }

    const bookingHref = `${RoutePaths.BOOKING}?restaurantId=${restaurant.id}`;

    return (
        <section className="container" style={{ display: 'grid', gap: '24px', paddingBottom: '48px' }}>
            <div className="surface-block" style={{ padding: '24px', display: 'grid', gap: '18px' }}>
                <div style={{ display: 'grid', gap: '8px' }}>
                    <h1 className="page-title">{restaurant.name}</h1>
                    <div><strong>Категория:</strong> {restaurant.category}</div>
                    <div><strong>Адрес:</strong> {restaurant.address}</div>
                    <div><strong>Статус:</strong> {restaurant.active ? 'Активен' : 'Неактивен'}</div>
                    <div><strong>Описание:</strong> {restaurant.description || 'Не указано'}</div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Link to={bookingHref}>
                        <button className="primary-button">Забронировать стол</button>
                    </Link>

                    <Link to={RoutePaths.RESTAURANTS}>
                        <button className="secondary-button">К списку ресторанов</button>
                    </Link>
                </div>

                {bannerPhoto?.publicUrl ? (
                    <div>
                        <img
                            src={bannerPhoto.publicUrl}
                            alt={restaurant.name}
                            width={640}
                        />
                    </div>
                ) : null}
            </div>

            <div className="surface-block" style={{ padding: '24px', display: 'grid', gap: '12px' }}>
                <h2 className="section-title">Часы работы</h2>
                <RestaurantWorkingHours workingHours={restaurant.workingHours} />
            </div>

            <div className="surface-block" style={{ padding: '24px', display: 'grid', gap: '12px' }}>
                <h2 className="section-title">Контакты</h2>
                {restaurant.contacts.length === 0 ? (
                    <div>Контакты отсутствуют</div>
                ) : (
                    <ul style={{ display: 'grid', gap: '10px' }}>
                        {restaurant.contacts.map((contact, index) => (
                            <li key={`${contact.type}-${contact.value}-${index}`}>
                                <strong>{contactTypeLabels[contact.type] || contact.type}:</strong> {contact.value}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {schemePhoto?.publicUrl ? (
                <div className="surface-block" style={{ padding: '24px', display: 'grid', gap: '12px' }}>
                    <h2 className="section-title">Схема зала</h2>
                    <img
                        src={schemePhoto.publicUrl}
                        alt={`Схема зала ${restaurant.name}`}
                        width={480}
                    />
                </div>
            ) : null}

            <div style={{ display: 'grid', gap: '16px' }}>
                <h2 className="section-title">Блюда</h2>
                {restaurant.dishes.length === 0 ? (
                    <div>Блюда отсутствуют</div>
                ) : (
                    restaurant.dishes.map((dish) => (
                        <div key={dish.id}>
                            <DishCard dish={dish} restaurantId={restaurant.id} />
                        </div>
                    ))
                )}
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
                <h2 className="section-title">Столы</h2>
                {restaurant.tables.length === 0 ? (
                    <div>Столы отсутствуют</div>
                ) : (
                    restaurant.tables.map((table) => {
                        const tableBookingHref = `${RoutePaths.BOOKING}?restaurantId=${restaurant.id}&tableId=${table.id}`;

                        return (
                            <div key={table.id}>
                                <TableCard
                                    table={table}
                                    actions={
                                        <Link to={tableBookingHref}>
                                            <button className="primary-button" disabled={!table.active}>
                                                {table.active ? 'Забронировать этот стол' : 'Стол недоступен'}
                                            </button>
                                        </Link>
                                    }
                                />
                            </div>
                        );
                    })
                )}
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
                <h2 className="section-title">Галерея</h2>
                {restaurant.photos.filter((photo) => photo.category === 'GALLERY').length === 0 ? (
                    <div>Фотографии галереи отсутствуют</div>
                ) : (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {restaurant.photos
                            .filter((photo) => photo.category === 'GALLERY')
                            .map((photo) => (
                                <img
                                    key={photo.id}
                                    src={photo.publicUrl}
                                    alt={restaurant.name}
                                    width={240}
                                />
                            ))}
                    </div>
                )}
            </div>
        </section>
    );
};