import { Link, generatePath } from 'react-router-dom';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import styles from './restaurant-manager-actions.module.scss';

type RestaurantManagerActionsProps = {
    restaurantId: string;
    onAddPhoto: () => void;
};

export const RestaurantManagerActions = ({
    restaurantId,
    onAddPhoto,
}: RestaurantManagerActionsProps) => {
    return (
        <section className={styles.wrapper}>
            <div>
                <h2 className={styles.title}>Управление рестораном</h2>
                <p className={styles.description}>
                    Быстрые действия для редактирования карточки, схемы, фотографий и меню.
                </p>
            </div>

            <div className={styles.actions}>
                <Link
                    to={generatePath(RoutePaths.MY_RESTAURANT_EDIT, { id: restaurantId })}
                    className={styles.button}
                >
                    Редактировать ресторан
                </Link>

                <Link
                    to={generatePath(RoutePaths.MY_RESTAURANT_BOOKINGS, { id: restaurantId })}
                    className={styles.button}
                >
                    Бронирования ресторана
                </Link>

                <Link
                    to={generatePath(RoutePaths.MY_RESTAURANT_DISH_NEW, { restaurantId })}
                    className={styles.button}
                >
                    Добавить блюдо
                </Link>

                <button
                    type="button"
                    className={styles.button}
                    onClick={onAddPhoto}
                >
                    Добавить фото
                </button>

                <Link
                    to={generatePath(RoutePaths.MY_RESTAURANT_LAYOUT, { id: restaurantId })}
                    className={styles.primaryButton}
                >
                    Редактор схемы
                </Link>
            </div>
        </section>
    );
};
