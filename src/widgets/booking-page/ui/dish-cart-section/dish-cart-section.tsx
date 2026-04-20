import { generatePath, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import type { DishCartItem } from '@/shared/dish-cart';
import { DishCard } from '@/entities/restaurant/ui';
import { RoutePaths } from '@/shared/config/routes';
import { CloseIcon } from '@/shared/ui/icons';
import type { BookingPageDishCardItem } from '../../model/types.ts';
import styles from '../booking-page-widget/booking-page-widget.module.scss';

type DishCartSectionProps = {
    restaurantId: string | null;
    items: BookingPageDishCardItem[];
    onClear: () => void;
    onDecrement: (restaurantId: string, dishId: string) => void;
    onIncrement: (item: DishCartItem) => void;
};

export const DishCartSection = ({
    restaurantId,
    items,
    onClear,
    onDecrement,
    onIncrement,
}: DishCartSectionProps) => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const copy = language === 'en'
        ? {
            clear: 'Clear dishes',
            empty: 'No dishes have been added yet',
            title: 'Dishes',
        }
        : {
            clear: 'Очистить блюда',
            empty: 'Добавленных блюд пока нет',
            title: 'Блюда',
        };

    const openDish = (dishId: string) => {
        if (!restaurantId) {
            return;
        }

        const path = generatePath(RoutePaths.DISH, { id: dishId });
        navigate(`${path}?restaurantId=${restaurantId}`);
    };

    return (
        <section className={styles.section}>
            <div className={styles.headerRow}>
                <h2 className="section-title">{copy.title}</h2>

                {items.length > 0 ? (
                    <button
                        type="button"
                        className={styles.iconDangerButton}
                        onClick={onClear}
                        aria-label={copy.clear}
                    >
                        <CloseIcon className={styles.iconDangerButtonIcon} />
                    </button>
                ) : null}
            </div>

            {items.length > 0 ? (
                <div className={styles.dishCardsGrid}>
                    {items.map(({ cartItem, dish }) => (
                        <DishCard
                            key={`${cartItem.restaurantId}:${cartItem.dishId}`}
                            dish={dish}
                            count={cartItem.quantity}
                            onOpen={() => openDish(cartItem.dishId)}
                            onAddToCart={() => onIncrement(cartItem)}
                            onDecreaseFromCart={() => {
                                onDecrement(cartItem.restaurantId, cartItem.dishId);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className={`${styles.card} ${styles.emptyCard}`}>
                    {copy.empty}
                </div>
            )}
        </section>
    );
};
