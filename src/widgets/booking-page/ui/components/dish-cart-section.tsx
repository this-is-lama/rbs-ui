import { generatePath, useNavigate } from 'react-router-dom';
import type { DishCartItem } from '@/shared/dish-cart/dish-cart.ts';
import { DishCard } from '@/entities/restaurant/ui/dish-card.tsx';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import type { BookingPageDishCardItem } from '../booking-page.types.ts';
import styles from '../BookingPageWidget.module.scss';

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
                <h2 className="section-title">Блюда</h2>

                {items.length > 0 ? (
                    <button
                        type="button"
                        className={styles.iconDangerButton}
                        onClick={onClear}
                        aria-label="Очистить блюда"
                    >
                        X
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
                    Добавленных блюд пока нет
                </div>
            )}
        </section>
    );
};
