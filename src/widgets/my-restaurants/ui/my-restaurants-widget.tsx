import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '@/widgets/footer/Footer.tsx';
import { ManagerRestaurantCard } from '@/entities/restaurant/ui/manager-restaurant-card.tsx';
import { getMyRestaurants } from '@/entities/restaurant/api/management.ts';
import type { ManagerRestaurantCard as ManagerRestaurantCardType } from '@/entities/restaurant/model/types.ts';
import { RestaurantCategoriesNavbar } from '@/features/restaurants/filter-restaurants/ui/restaurant-categories-navbar.tsx';
import { PlusIcon } from '@/shared/ui/icons/action-icons.tsx';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import cardStyles from '@/entities/restaurant/ui/RestaurantCard.module.scss';
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
    const [restaurants, setRestaurants] = useState<ManagerRestaurantCardType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

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
                setError(getApiErrorMessage(requestError, 'Не удалось загрузить список ресторанов'));
                setRestaurants([]);
            } finally {
                setIsLoading(false);
            }
        };

        void loadRestaurants();
    }, []);

    return (
        <div className={styles.page}>
            <section className={`container ${styles.section}`}>
                <div className={styles.header}>
                    <div className={styles.titleBlock}>
                        <h1 className={styles.title}>Мои рестораны</h1>
                        <p className={styles.subtitle}>
                            Активные рестораны показаны первыми, а неактивные собраны в конце списка.
                        </p>
                    </div>
                </div>

                <RestaurantCategoriesNavbar />

                {isLoading ? <div className={styles.state}>Загрузка ресторанов...</div> : null}
                {error ? <div className={styles.state}>{error}</div> : null}

                {!isLoading && !error ? (
                    <>
                        <div className={styles.list}>
                            <Link
                                to={RoutePaths.MY_RESTAURANT_NEW}
                                className={cardStyles.actionCardLink}
                                aria-label="Добавить ресторан"
                            >
                                <article className={`${cardStyles.actionCard} ${cardStyles.cardInteractive}`}>
                                    <div className={cardStyles.actionVisual}>
                                        <span className={cardStyles.actionIconBox}>
                                            <PlusIcon className={cardStyles.actionIcon} />
                                        </span>
                                    </div>

                                    <div className={cardStyles.actionContent}>
                                        <span className={cardStyles.actionEyebrow}>Новый ресторан</span>
                                        <h2 className={cardStyles.actionTitle}>Добавить ресторан</h2>
                                        <p className={cardStyles.actionDescription}>
                                            Создайте карточку ресторана и заполните основные данные.
                                        </p>
                                    </div>
                                </article>
                            </Link>

                            {restaurants.map((restaurant) => (
                                <ManagerRestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))}
                        </div>

                        {restaurants.length === 0 ? (
                            <div className={styles.state}>У вас пока нет ресторанов</div>
                        ) : null}
                    </>
                ) : null}
            </section>

            <Footer />
        </div>
    );
};
