import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import type { ManagerRestaurantCard as ManagerRestaurantCardType } from '@/entities/restaurant/model/types.ts';
import { getMyRestaurants } from '@/entities/restaurant/api/management.ts';
import { ManagerRestaurantCard } from '@/entities/restaurant/ui';
import cardStyles from '@/entities/restaurant/ui/restaurant-card/restaurant-card.module.scss';
import { RestaurantCategoriesNavbar } from '@/features/restaurants/filter-restaurants/ui';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { PlusIcon } from '@/shared/ui/icons/action-icons.tsx';
import { Footer } from '@/widgets/footer/Footer.tsx';
import styles from './MyRestaurantsWidget.module.scss';

const MY_RESTAURANTS_PAGE_SIZE = 50;
const MAX_MY_RESTAURANTS_PAGES = 100;

const loadRestaurantsByStatus = async (active: boolean) => {
    const result: ManagerRestaurantCardType[] = [];

    for (let page = 0; page < MAX_MY_RESTAURANTS_PAGES; page += 1) {
        const response = await getMyRestaurants({
            active,
            page,
            size: MY_RESTAURANTS_PAGE_SIZE,
        });
        const totalPages = Number.isFinite(response.totalPages) ? response.totalPages : 1;

        result.push(...(Array.isArray(response.content) ? response.content : []));

        if (response.last || response.content.length === 0 || page >= totalPages - 1) {
            break;
        }
    }

    return result;
};

export const MyRestaurantsWidget = () => {
    const { language } = useLanguage();
    const [restaurants, setRestaurants] = useState<ManagerRestaurantCardType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const copy = language === 'en'
        ? {
            addRestaurant: 'Add restaurant',
            addRestaurantAria: 'Add restaurant',
            addRestaurantDescription: 'Create a restaurant card and fill in the basic details.',
            addRestaurantEyebrow: 'New restaurant',
            empty: 'You do not have any restaurants yet',
            loadError: 'Failed to load restaurants',
            loading: 'Loading restaurants...',
            subtitle: 'Active restaurants are shown first, while inactive ones are placed at the end of the list.',
            title: 'My restaurants',
        }
        : {
            addRestaurant: 'Добавить ресторан',
            addRestaurantAria: 'Добавить ресторан',
            addRestaurantDescription: 'Создайте карточку ресторана и заполните основные данные.',
            addRestaurantEyebrow: 'Новый ресторан',
            empty: 'У вас пока нет ресторанов',
            loadError: 'Не удалось загрузить список ресторанов',
            loading: 'Загрузка ресторанов...',
            subtitle: 'Активные рестораны показаны первыми, а неактивные собраны в конце списка.',
            title: 'Мои рестораны',
        };

    useEffect(() => {
        const loadRestaurants = async () => {
            try {
                setIsLoading(true);
                setError('');

                const [activeRestaurants, inactiveRestaurants] = await Promise.all([
                    loadRestaurantsByStatus(true),
                    loadRestaurantsByStatus(false),
                ]);

                setRestaurants([...activeRestaurants, ...inactiveRestaurants]);
            } catch (requestError) {
                setError(getApiErrorMessage(requestError, copy.loadError));
                setRestaurants([]);
            } finally {
                setIsLoading(false);
            }
        };

        void loadRestaurants();
    }, [copy.loadError]);

    return (
        <div className={styles.page}>
            <section className={`container ${styles.section}`}>
                <div className={styles.header}>
                    <div className={styles.titleBlock}>
                        <h1 className={styles.title}>{copy.title}</h1>
                        <p className={styles.subtitle}>
                            {copy.subtitle}
                        </p>
                    </div>
                </div>

                <RestaurantCategoriesNavbar />

                {isLoading ? <div className={styles.state}>{copy.loading}</div> : null}
                {error ? <div className={styles.state}>{error}</div> : null}

                {!isLoading && !error ? (
                    <>
                        <div className={styles.list}>
                            <Link
                                to={RoutePaths.MY_RESTAURANT_NEW}
                                className={cardStyles.actionCardLink}
                                aria-label={copy.addRestaurantAria}
                            >
                                <article className={`${cardStyles.actionCard} ${cardStyles.cardInteractive}`}>
                                    <div className={cardStyles.actionVisual}>
                                        <span className={cardStyles.actionIconBox}>
                                            <PlusIcon className={cardStyles.actionIcon} />
                                        </span>
                                    </div>

                                    <div className={cardStyles.actionContent}>
                                        <span className={cardStyles.actionEyebrow}>
                                            {copy.addRestaurantEyebrow}
                                        </span>
                                        <h2 className={cardStyles.actionTitle}>{copy.addRestaurant}</h2>
                                        <p className={cardStyles.actionDescription}>
                                            {copy.addRestaurantDescription}
                                        </p>
                                    </div>
                                </article>
                            </Link>

                            {restaurants.map((restaurant) => (
                                <ManagerRestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))}
                        </div>

                        {restaurants.length === 0 ? (
                            <div className={styles.state}>{copy.empty}</div>
                        ) : null}
                    </>
                ) : null}
            </section>

            <Footer />
        </div>
    );
};
