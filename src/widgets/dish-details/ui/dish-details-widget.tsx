import { useEffect, useMemo, useState } from 'react';
import { Link, generatePath, useParams, useSearchParams } from 'react-router-dom';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
import type { Contact, Dish, Restaurant } from '@/entities/restaurant/model/types.ts';
import { Footer } from '@/widgets/footer/Footer.tsx';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { PhotoCarousel } from '@/shared/ui/photo-carousel/photo-carousel.tsx';
import styles from './DishDetailsWidget.module.scss';

type NormalizedRestaurant = Restaurant & {
    dishes: Dish[];
};

const formatPrice = (price: Dish['price']) => {
    const normalizedPrice = String(price).trim();

    return /₽|руб/u.test(normalizedPrice) ? normalizedPrice : `${normalizedPrice} ₽`;
};

const getContactLabel = (type: Contact['type']) => {
    switch (type) {
        case 'PHONE':
            return 'Телефон';
        case 'EMAIL':
            return 'Email';
        case 'WEBSITE':
            return 'Сайт';
        default:
            return 'Контакт';
    }
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
                const normalizedRestaurant: NormalizedRestaurant = {
                    ...response,
                    dishes: Array.isArray(response.dishes) ? response.dishes : [],
                };

                const foundDish = normalizedRestaurant.dishes.find(
                    (currentDish) => currentDish.id === id,
                );

                if (!foundDish) {
                    setError('Блюдо не найдено в выбранном ресторане');
                    setRestaurant(normalizedRestaurant);
                    setDish(null);
                    return;
                }

                setRestaurant(normalizedRestaurant);
                setDish(foundDish);
            } catch (loadError) {
                setError(getApiErrorMessage(loadError, 'Не удалось загрузить страницу блюда'));
            } finally {
                setIsLoading(false);
            }
        };

        void loadDish();
    }, [id, restaurantId]);

    const dishPhotos = useMemo(() => {
        const photos = Array.isArray(dish?.photos) ? dish.photos.filter(Boolean) : [];

        return [...photos].sort((left, right) => left.sortOrder - right.sortOrder);
    }, [dish]);

    const priceLabel = useMemo(() => (dish ? formatPrice(dish.price) : ''), [dish]);
    const contacts = useMemo(
        () => (Array.isArray(restaurant?.contacts) ? restaurant.contacts : []),
        [restaurant],
    );

    if (isLoading) {
        return (
            <>
                <div className={`container ${styles.page}`}>
                    <div className={styles.stateBlock}>Загрузка страницы блюда...</div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <section className={`container ${styles.page}`}>
                    <div className={styles.stateBlock}>{error}</div>

                    {restaurantId ? (
                        <div className={styles.actions}>
                            <Link
                                to={generatePath(RoutePaths.RESTAURANT, { id: restaurantId })}
                                className="secondary-button"
                            >
                                Вернуться к ресторану
                            </Link>
                        </div>
                    ) : null}
                </section>
                <Footer />
            </>
        );
    }

    if (!dish || !restaurant) {
        return (
            <>
                <div className={`container ${styles.page}`}>
                    <div className={styles.stateBlock}>Блюдо не найдено</div>
                </div>
                <Footer />
            </>
        );
    }

    const backToRestaurantPath = generatePath(RoutePaths.RESTAURANT, { id: restaurant.id });
    const bookingPath = `${RoutePaths.BOOKING}?restaurantId=${restaurant.id}`;

    return (
        <>
            <section className={`container ${styles.page}`}>
                <PhotoCarousel
                    photos={dishPhotos}
                    altText={dish.name}
                    placeholderText="Фотографии блюда отсутствуют"
                />

                <div className={styles.headingBlock}>
                    <Link to={backToRestaurantPath} className={styles.backLink}>
                        К ресторану
                    </Link>

                    <div className={styles.titleStack}>
                        <h1 className={styles.title}>{dish.name}</h1>
                        <p className={styles.subtitle}>Подается в ресторане {restaurant.name}</p>
                    </div>

                    <div className={styles.tags}>
                        <span className={`${styles.tag} ${styles.primaryTag}`}>
                            {dish.category}
                        </span>
                        <span className={styles.tag}>{dish.weight} г</span>
                        <span className={styles.tag}>{priceLabel}</span>
                        <span
                            className={`${styles.tag} ${
                                dish.available ? styles.availableTag : styles.unavailableTag
                            }`}
                        >
                            {dish.available ? 'Доступно для заказа' : 'Сейчас недоступно'}
                        </span>
                    </div>
                </div>

                <div className={styles.infoGrid}>
                    <article className={styles.card}>
                        <h2 className={styles.cardTitle}>О блюде</h2>

                        <p className={styles.description}>
                            {dish.description?.trim() || 'Описание блюда пока не добавлено.'}
                        </p>

                        <div className={styles.factGrid}>
                            <div className={styles.factItem}>
                                <span className={styles.factLabel}>Категория</span>
                                <span className={styles.factValue}>{dish.category}</span>
                            </div>

                            <div className={styles.factItem}>
                                <span className={styles.factLabel}>Цена</span>
                                <span className={styles.factValue}>{priceLabel}</span>
                            </div>

                            <div className={styles.factItem}>
                                <span className={styles.factLabel}>Вес</span>
                                <span className={styles.factValue}>{dish.weight} г</span>
                            </div>

                            <div className={styles.factItem}>
                                <span className={styles.factLabel}>Статус</span>
                                <span className={styles.factValue}>
                                    {dish.available ? 'Доступно' : 'Недоступно'}
                                </span>
                            </div>
                        </div>
                    </article>

                    <aside className={`${styles.card} ${styles.sidebarCard}`}>
                        <h2 className={styles.cardTitle}>Ресторан</h2>

                        <div className={styles.restaurantBlock}>
                            <div>
                                <div className={styles.restaurantName}>{restaurant.name}</div>
                                <div className={styles.restaurantMeta}>{restaurant.category}</div>
                            </div>

                            <div className={styles.restaurantAddress}>{restaurant.address}</div>

                            {contacts.length > 0 ? (
                                <div className={styles.contactList}>
                                    {contacts.map((contact) => (
                                        <div
                                            key={`${contact.type}-${contact.value}`}
                                            className={styles.contactItem}
                                        >
                                            <span className={styles.contactLabel}>
                                                {getContactLabel(contact.type)}
                                            </span>
                                            <span className={styles.contactValue}>
                                                {contact.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        <div className={styles.actions}>
                            <Link to={backToRestaurantPath} className="secondary-button">
                                Открыть ресторан
                            </Link>

                            <Link to={bookingPath} className="primary-button">
                                Перейти к бронированию
                            </Link>
                        </div>
                    </aside>
                </div>
            </section>

            <Footer />
        </>
    );
};
