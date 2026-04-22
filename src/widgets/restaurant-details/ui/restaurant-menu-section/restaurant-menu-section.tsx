import { Link, generatePath, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import type { Dish } from '@/entities/restaurant/model/types.ts';
import { DishCard } from '@/entities/restaurant/ui';
import navbarStyles from '@/features/restaurants/filter-restaurants/ui/restaurant-categories-navbar/restaurant-categories-navbar.module.scss';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { EditIcon, PlusIcon } from '@/shared/ui/icons/action-icons.tsx';
import type { RestaurantDishCounters } from '../../model/types.ts';
import styles from '../restaurant-details-widget/restaurant-details-widget.module.scss';

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
    const { language } = useLanguage();
    const createDishPath = generatePath(RoutePaths.MY_RESTAURANT_DISH_NEW, { restaurantId });
    const copy = language === 'en'
        ? {
            addDish: 'Add dish',
            addDishDescription: 'Create a new dish for this restaurant.',
            cartAmount: 'Amount',
            cartDishes: 'Dishes',
            editDish: 'Edit dish',
            empty: 'There are no dishes in this category yet',
            menu: 'Menu',
        }
        : {
            addDish: 'Добавить блюдо',
            addDishDescription: 'Создайте новое блюдо для этого ресторана.',
            cartAmount: 'Сумма',
            cartDishes: 'Блюд',
            editDish: 'Редактировать блюдо',
            empty: 'В этой категории пока нет блюд',
            menu: 'Меню',
        };

    const openDish = (dishId: string) => {
        const path = generatePath(RoutePaths.DISH, { id: dishId });

        navigate(`${path}?restaurantId=${restaurantId}`);
    };

    const shouldRenderGrid = visibleDishes.length > 0 || canManageRestaurant;
    const dishAnimationKey = selectedCategory.trim() || 'all';

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{copy.menu}</h2>

                {totalCartCount > 0 ? (
                    <div className={styles.cartBadge}>
                        <span>{copy.cartDishes}: {totalCartCount}</span>
                        <span>{copy.cartAmount}: {totalCartAmount.toFixed(0)} ₽</span>
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
                <div
                    key={dishAnimationKey}
                    className={`${styles.dishesGrid} ${styles.dishesGridAnimated}`}
                >
                    {canManageRestaurant ? (
                        <Link
                            to={createDishPath}
                            className={styles.managerDishAddCard}
                            aria-label={copy.addDish}
                        >
                            <span className={styles.managerDishAddVisual}>
                                <span className={styles.managerDishAddIconBox}>
                                    <PlusIcon className={styles.managerDishAddIcon} />
                                </span>
                            </span>
                            <span className={styles.managerDishAddTitle}>{copy.addDish}</span>
                            <span className={styles.managerDishAddDescription}>
                                {copy.addDishDescription}
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
                                    aria-label={`${copy.editDish} ${dish.name}`}
                                    title={copy.editDish}
                                >
                                    <EditIcon className={styles.managerDishButtonIcon} />
                                </Link>
                            ) : undefined}
                        />
                    ))}
                </div>
            ) : (
                <div
                    key={`empty-${dishAnimationKey}`}
                    className={`${styles.emptyBlock} ${styles.emptyBlockAnimated}`}
                >
                    {copy.empty}
                </div>
            )}
        </section>
    );
};
