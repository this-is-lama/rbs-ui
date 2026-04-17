import { useEffect, useMemo, useState } from 'react';
import { Link, generatePath, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth/use-auth.ts';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
import { checkRestaurantManagerAccess } from '@/entities/restaurant/api/management.ts';
import { getPhotoByCategory } from '@/entities/restaurant/lib/get-photo-by-category.ts';
import type { Dish, Restaurant } from '@/entities/restaurant/model/types.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { dishCartStorage } from '@/shared/dish-cart/dish-cart.ts';
import { canManageRestaurants, isAdminRole } from '@/shared/lib/auth/roles.ts';
import { useRestaurantOrderGuard } from '@/shared/lib/restaurant-order/use-restaurant-order-guard.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { CartActionIcon } from '@/shared/ui/cart-action-icon/cart-action-icon.tsx';
import { EditIcon } from '@/shared/ui/icons/action-icons.tsx';
import { PhotoCarousel } from '@/shared/ui/photo-carousel/photo-carousel.tsx';
import { RestaurantOrderConflictModal } from '@/shared/ui/restaurant-order-conflict-modal/RestaurantOrderConflictModal.tsx';
import { Footer } from '@/widgets/footer/Footer.tsx';
import styles from './DishDetailsWidget.module.scss';

type NormalizedRestaurant = Restaurant & {
    dishes: Dish[];
};

const formatPrice = (price: Dish['price']) => {
    const normalizedPrice = String(price).trim();

    return /₽|руб/u.test(normalizedPrice) ? normalizedPrice : `${normalizedPrice} ₽`;
};

const parsePriceValue = (price: Dish['price']) => {
    const normalizedPrice = String(price).replace(',', '.').trim();
    const parsed = Number.parseFloat(normalizedPrice);

    return Number.isFinite(parsed) ? parsed : 0;
};

const canSeeAvailability = (role?: string | null) => {
    return role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER';
};

export const DishDetailsWidget = () => {
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const restaurantId = searchParams.get('restaurantId') ?? '';

    const [restaurant, setRestaurant] = useState<NormalizedRestaurant | null>(null);
    const [dish, setDish] = useState<Dish | null>(null);
    const [dishCount, setDishCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [canManageDish, setCanManageDish] = useState(false);
    const {
        conflict,
        guardRestaurantOrder,
        cancelRestaurantSwitch,
        confirmRestaurantSwitch,
    } = useRestaurantOrderGuard();

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

    useEffect(() => {
        if (!restaurantId || !canManageRestaurants(user?.role)) {
            setCanManageDish(false);
            return;
        }

        if (isAdminRole(user?.role)) {
            setCanManageDish(true);
            return;
        }

        let isDisposed = false;

        const checkAccess = async () => {
            try {
                const response = await checkRestaurantManagerAccess(restaurantId);

                if (!isDisposed) {
                    setCanManageDish(response);
                }
            } catch {
                if (!isDisposed) {
                    setCanManageDish(false);
                }
            }
        };

        void checkAccess();

        return () => {
            isDisposed = true;
        };
    }, [restaurantId, user?.role]);

    useEffect(() => {
        if (!restaurantId || !id) {
            setDishCount(0);
            return;
        }

        const syncDishCount = () => {
            const item = dishCartStorage
                .getItemsByRestaurantId(restaurantId)
                .find((cartItem) => cartItem.dishId === id);

            setDishCount(item?.quantity ?? 0);
        };

        syncDishCount();
        window.addEventListener('dish-cart:changed', syncDishCount);

        return () => {
            window.removeEventListener('dish-cart:changed', syncDishCount);
        };
    }, [id, restaurantId]);

    const dishPhotos = useMemo(() => {
        const photos = Array.isArray(dish?.photos) ? dish.photos.filter(Boolean) : [];

        return [...photos].sort((left, right) => left.sortOrder - right.sortOrder);
    }, [dish]);

    const priceLabel = useMemo(() => (dish ? formatPrice(dish.price) : ''), [dish]);
    const showAvailabilityTag = canSeeAvailability(user?.role);
    const editDishPath = useMemo(() => {
        if (!restaurantId || !id) {
            return '';
        }

        return generatePath(RoutePaths.MY_RESTAURANT_DISH_EDIT, {
            restaurantId,
            dishId: id,
        });
    }, [id, restaurantId]);

    const handleAddToCart = () => {
        if (!restaurant || !dish || !dish.available) {
            return;
        }

        const photos = Array.isArray(dish.photos) ? dish.photos : [];
        const banner = getPhotoByCategory(photos, 'BANNER') ?? photos[0] ?? null;

        guardRestaurantOrder({
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            onAccept: () => dishCartStorage.addItem({
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                dishId: dish.id,
                dishName: dish.name,
                price: parsePriceValue(dish.price),
                weight: dish.weight,
                photoUrl: banner?.publicUrl ?? null,
            }),
        });
    };

    const handleDecreaseFromCart = () => {
        if (!restaurant || !dish) {
            return;
        }

        dishCartStorage.decrementItem(restaurant.id, dish.id);
    };

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

    return (
        <>
            <section className={`container ${styles.page}`}>
                <PhotoCarousel
                    photos={dishPhotos}
                    altText={dish.name}
                    placeholderText="Фотографии блюда отсутствуют"
                />

                <div className={styles.headingBlock}>
                    <h1 className={styles.title}>{dish.name}</h1>
                </div>

                <article className={`${styles.card} ${styles.detailsCard}`}>
                    <div className={styles.tags}>
                        <span className={`${styles.tag} ${styles.primaryTag}`}>
                            {dish.category}
                        </span>
                        <span className={styles.tag}>{dish.weight} г</span>

                        {showAvailabilityTag ? (
                            <span
                                className={`${styles.tag} ${
                                    dish.available
                                        ? styles.availableTag
                                        : styles.unavailableTag
                                }`}
                            >
                                {dish.available ? 'Доступно для заказа' : 'Сейчас недоступно'}
                            </span>
                        ) : null}
                    </div>

                    {canManageDish || dishCount > 0 ? (
                        <div className={styles.topSide}>
                            {canManageDish && editDishPath ? (
                                <Link
                                    to={editDishPath}
                                    className={styles.managerEditButton}
                                    aria-label={`Редактировать блюдо ${dish.name}`}
                                    title="Редактировать"
                                >
                                    <EditIcon className={styles.managerEditIcon} />
                                </Link>
                            ) : null}

                            {dishCount > 0 ? (
                                <span className={styles.countBadge}>{dishCount}</span>
                            ) : null}
                        </div>
                    ) : null}

                    <p className={styles.description}>
                        {dish.description?.trim() || 'Описание блюда пока не добавлено.'}
                    </p>

                    <div className={styles.controlsSlot}>
                        {dishCount > 0 ? (
                            <div className={styles.cartControls}>
                                <button
                                    type="button"
                                    className={styles.stepButton}
                                    onClick={handleDecreaseFromCart}
                                    aria-label={`Уменьшить количество блюда ${dish.name}`}
                                >
                                    <CartActionIcon type="minus" className={styles.stepIcon} />
                                </button>

                                <span className={styles.cartControlPrice}>{priceLabel}</span>

                                <button
                                    type="button"
                                    className={styles.stepButton}
                                    onClick={handleAddToCart}
                                    disabled={!dish.available}
                                    aria-label={`Увеличить количество блюда ${dish.name}`}
                                >
                                    <CartActionIcon type="plus" className={styles.stepIcon} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className={styles.singleActionButton}
                                onClick={handleAddToCart}
                                disabled={!dish.available}
                                aria-label={`Добавить блюдо ${dish.name} в корзину`}
                            >
                                <CartActionIcon type="plus" className={styles.singleActionPrefix} />
                                <span>{priceLabel}</span>
                            </button>
                        )}
                    </div>
                </article>
            </section>

            <Footer />

            {conflict ? (
                <RestaurantOrderConflictModal
                    currentRestaurantName={conflict.currentRestaurantName}
                    nextRestaurantName={conflict.nextRestaurantName}
                    onCancel={cancelRestaurantSwitch}
                    onConfirm={confirmRestaurantSwitch}
                />
            ) : null}
        </>
    );
};
