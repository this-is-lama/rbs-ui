import { Link, generatePath } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import { RoutePaths } from '@/shared/config/routes';
import styles from './restaurant-manager-actions.module.scss';

type RestaurantManagerActionsProps = {
    restaurantId: string;
    onAddPhoto: () => void;
};

export const RestaurantManagerActions = ({
    restaurantId,
    onAddPhoto,
}: RestaurantManagerActionsProps) => {
    const { language } = useLanguage();
    const copy = language === 'en'
        ? {
            addDish: 'Add dish',
            addPhoto: 'Add photo',
            bookings: 'Restaurant bookings',
            description: 'Quick actions for editing the card, floor plan, photos, and menu.',
            editRestaurant: 'Edit restaurant',
            layoutEditor: 'Floor plan editor',
            title: 'Restaurant management',
        }
        : {
            addDish: 'Добавить блюдо',
            addPhoto: 'Добавить фото',
            bookings: 'Бронирования ресторана',
            description: 'Быстрые действия для редактирования карточки, схемы, фотографий и меню.',
            editRestaurant: 'Редактировать ресторан',
            layoutEditor: 'Редактор схемы',
            title: 'Управление рестораном',
        };

    return (
        <section className={styles.wrapper}>
            <div>
                <h2 className={styles.title}>{copy.title}</h2>
                <p className={styles.description}>
                    {copy.description}
                </p>
            </div>

            <div className={styles.actions}>
                <Link
                    to={generatePath(RoutePaths.MY_RESTAURANT_EDIT, { id: restaurantId })}
                    className={styles.button}
                >
                    {copy.editRestaurant}
                </Link>

                <Link
                    to={generatePath(RoutePaths.MY_RESTAURANT_BOOKINGS, { id: restaurantId })}
                    className={styles.button}
                >
                    {copy.bookings}
                </Link>

                <Link
                    to={generatePath(RoutePaths.MY_RESTAURANT_DISH_NEW, { restaurantId })}
                    className={styles.button}
                >
                    {copy.addDish}
                </Link>

                <button
                    type="button"
                    className={styles.button}
                    onClick={onAddPhoto}
                >
                    {copy.addPhoto}
                </button>

                <Link
                    to={generatePath(RoutePaths.MY_RESTAURANT_LAYOUT, { id: restaurantId })}
                    className={styles.primaryButton}
                >
                    {copy.layoutEditor}
                </Link>
            </div>
        </section>
    );
};
