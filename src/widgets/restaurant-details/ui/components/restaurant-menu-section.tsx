import { Link, generatePath, useNavigate } from 'react-router-dom';
import type { Dish } from '@/entities/restaurant/model/types.ts';
import { DishCard } from '@/entities/restaurant/ui/dish-card.tsx';
import navbarStyles from '@/features/restaurants/filter-restaurants/ui/RestaurantCategoriesNavbar.module.scss';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { EditIcon, PlusIcon } from '@/shared/ui/icons/action-icons.tsx';
import type { RestaurantDishCounters } from '../../model/types.ts';
import styles from '../restaurant-details-widget.module.scss';

type RestaurantMenuSectionProps = {
    restaurantId: string;
    dishCategories: string[];
    selectedCategory: string;
    totalCartCount: number;
    totalCartAmount: number;
    visibleDishes: Dish[];
    cartCounts: RestaurantDishCounters;
    onSelectCategory: (category: string) => void;
    onAddDish: (dish: Dish) => void;
    onDecreaseDish: (dishId: string) => void;
    canManageRestaurant?: boolean;
};

export const RestaurantMenuSection = ({
    restaurantId,
    dishCategories,
    selectedCategory,
    totalCartCount,
    totalCartAmount,
    visibleDishes,
    cartCounts,
    onSelectCategory,
    onAddDish,
    onDecreaseDish,
    canManageRestaurant,
}: RestaurantMenuSectionProps) => {
    const navigate = useNavigate();
    const createDishPath = generatePath(RoutePaths.MY_RESTAURANT_DISH_NEW, { restaurantId });

    const openDish = (dishId: string) => {
        const path = generatePath(RoutePaths.DISH, { id: dishId });

        navigate(`${path}?restaurantId=${restaurantId}`);
    };

    const shouldRenderGrid = visibleDishes.length > 0 || canManageRestaurant;

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

            <div className={navbarStyles.wrapper}>
                <div className={navbarStyles.navbar}>
                    {dishCategories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            className={`${navbarStyles.button} ${
                                selectedCategory === category ? navbarStyles.buttonActive : ''
                            }`}
                            onClick={() => onSelectCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {shouldRenderGrid ? (
                <div className={styles.dishesGrid}>
                    {canManageRestaurant ? (
                        <Link
                            to={createDishPath}
                            className={styles.managerDishAddCard}
                            aria-label="Добавить блюдо"
                        >
                            <span className={styles.managerDishAddVisual}>
                                <span className={styles.managerDishAddIconBox}>
                                    <PlusIcon className={styles.managerDishAddIcon} />
                                </span>
                            </span>
                            <span className={styles.managerDishAddTitle}>Добавить блюдо</span>
                            <span className={styles.managerDishAddDescription}>
                                Создайте новое блюдо для этого ресторана.
                            </span>
                        </Link>
                    ) : null}

                    {visibleDishes.map((dish) => (
                        <DishCard
                            key={dish.id}
                            dish={dish}
                            count={cartCounts[dish.id] ?? 0}
                            onOpen={() => openDish(dish.id)}
                            onAddToCart={() => onAddDish(dish)}
                            onDecreaseFromCart={() => onDecreaseDish(dish.id)}
                            action={canManageRestaurant ? (
                                <Link
                                    to={generatePath(RoutePaths.MY_RESTAURANT_DISH_EDIT, {
                                        restaurantId,
                                        dishId: dish.id,
                                    })}
                                    className={styles.managerDishButton}
                                    aria-label={`Редактировать блюдо ${dish.name}`}
                                    title="Редактировать"
                                >
                                    <EditIcon className={styles.managerDishButtonIcon} />
                                </Link>
                            ) : undefined}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.emptyBlock}>В этой категории пока нет блюд</div>
            )}
        </section>
    );
};
