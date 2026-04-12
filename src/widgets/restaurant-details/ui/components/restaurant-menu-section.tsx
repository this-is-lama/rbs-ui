import type { Dish } from '@/entities/restaurant/model/types.ts';
import { DishCard } from '@/entities/restaurant/ui/dish-card.tsx';
import type { RestaurantDishCounters } from '../../model/types.ts';
import styles from '../restaurant-details-widget.module.scss';

type RestaurantMenuSectionProps = {
    dishCategories: string[];
    selectedCategory: string;
    totalCartCount: number;
    totalCartAmount: number;
    visibleDishes: Dish[];
    cartCounts: RestaurantDishCounters;
    onSelectCategory: (category: string) => void;
    onAddDish: (dish: Dish) => void;
    onDecreaseDish: (dishId: string) => void;
};

export const RestaurantMenuSection = ({
    dishCategories,
    selectedCategory,
    totalCartCount,
    totalCartAmount,
    visibleDishes,
    cartCounts,
    onSelectCategory,
    onAddDish,
    onDecreaseDish,
}: RestaurantMenuSectionProps) => {
    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Меню</h2>

                {totalCartCount > 0 ? (
                    <div className={styles.cartBadge}>
                        <span>Блюд: {totalCartCount}</span>
                        <span>Сумма: {totalCartAmount.toFixed(0)} ₽</span>
                    </div>
                ) : null}
            </div>

            <div className={styles.categoryNavWrapper}>
                <div className={styles.categoryNav}>
                    {dishCategories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            className={`${styles.categoryButton} ${
                                selectedCategory === category ? styles.categoryButtonActive : ''
                            }`}
                            onClick={() => onSelectCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {visibleDishes.length > 0 ? (
                <div className={styles.dishesGrid}>
                    {visibleDishes.map((dish) => (
                        <DishCard
                            key={dish.id}
                            dish={dish}
                            count={cartCounts[dish.id] ?? 0}
                            onAddToCart={() => onAddDish(dish)}
                            onDecreaseFromCart={() => onDecreaseDish(dish.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.emptyBlock}>В этой категории пока нет блюд</div>
            )}
        </section>
    );
};
