import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
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
            } catch {
                setError('Не удалось загрузить ресторан');
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
        return <div>Загрузка ресторана...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!restaurant) {
        return <div>Ресторан не найден</div>;
    }

    return (
        <section>
            <h1>{restaurant.name}</h1>

            <div><strong>Категория:</strong> {restaurant.category}</div>
            <div><strong>Адрес:</strong> {restaurant.address}</div>
            <div><strong>Статус:</strong> {restaurant.active ? 'Активен' : 'Неактивен'}</div>
            <div><strong>Описание:</strong> {restaurant.description || 'Не указано'}</div>

            {bannerPhoto?.publicUrl ? (
                <div>
                    <h2>Баннер</h2>
                    <img src={bannerPhoto.publicUrl} alt={restaurant.name} width={480} />
                </div>
            ) : null}

            {schemePhoto?.publicUrl ? (
                <div>
                    <h2>Схема зала</h2>
                    <img src={schemePhoto.publicUrl} alt={`Схема ${restaurant.name}`} width={480} />
                </div>
            ) : null}

            <div>
                <h2>Часы работы</h2>
                <RestaurantWorkingHours workingHours={restaurant.workingHours} />
            </div>

            <div>
                <h2>Контакты</h2>
                {restaurant.contacts.length === 0 ? (
                    <div>Контакты не указаны</div>
                ) : (
                    <ul>
                        {restaurant.contacts.map((contact, index) => (
                            <li key={`${contact.type}-${contact.value}-${index}`}>
                                <strong>{contactTypeLabels[contact.type] ?? contact.type}:</strong> {contact.value}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <h2>Блюда</h2>
                {restaurant.dishes.length === 0 ? (
                    <div>Блюда отсутствуют</div>
                ) : (
                    restaurant.dishes.map((dish) => (
                        <div key={dish.id}>
                            <DishCard dish={dish} />
                            <hr />
                        </div>
                    ))
                )}
            </div>

            <div>
                <h2>Столы</h2>
                {restaurant.tables.length === 0 ? (
                    <div>Столы отсутствуют</div>
                ) : (
                    restaurant.tables.map((table) => (
                        <div key={table.id}>
                            <TableCard table={table} />
                            <hr />
                        </div>
                    ))
                )}
            </div>

            <div>
                <h2>Галерея</h2>
                {restaurant.photos.filter((photo) => photo.category === 'GALLERY').length === 0 ? (
                    <div>Фотографии галереи отсутствуют</div>
                ) : (
                    restaurant.photos
                        .filter((photo) => photo.category === 'GALLERY')
                        .map((photo) => (
                            <img
                                key={photo.id}
                                src={photo.publicUrl}
                                alt={restaurant.name}
                                width={240}
                            />
                        ))
                )}
            </div>
        </section>
    );
};