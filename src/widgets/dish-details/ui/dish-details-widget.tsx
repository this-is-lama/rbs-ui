import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, generatePath, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth';
import { useLanguage } from '@/app/providers/language';
import { getRestaurantById } from '@/entities/restaurant/api';
import { checkRestaurantManagerAccess } from '@/entities/restaurant/api';
import { getPhotoByCategory } from '@/entities/restaurant/lib';
import type { Dish, Restaurant } from '@/entities/restaurant/model';
import { RoutePaths } from '@/shared/config/routes';
import { dishCartStorage } from '@/shared/dish-cart';
import { canManageRestaurants, isAdminRole } from '@/shared/lib/auth';
import { useRestaurantOrderGuard } from '@/shared/lib/restaurant-order';
import { getApiErrorMessage } from '@/shared/lib/api';
import { CartActionIcon } from '@/shared/ui/cart-action-icon';
import { EditIcon } from '@/shared/ui/icons';
import { PhotoCarousel } from '@/shared/ui/photo-carousel';
import { RestaurantOrderConflictModal } from '@/shared/ui/restaurant-order-conflict-modal';
import { Footer } from '@/widgets/footer';
import { DishPhotoGalleryManager } from '@/widgets/dish-manage/ui/dish-photo-gallery-manager';
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
    const { language } = useLanguage();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const restaurantId = searchParams.get('restaurantId') ?? '';
    const copy = language === 'en'
        ? {
            addDish: (dishName: string) => `Add dish ${dishName} to cart`,
            availabilityActive: 'Available to order',
            availabilityInactive: 'Currently unavailable',
            countDecrement: (dishName: string) => `Decrease ${dishName} quantity`,
            countIncrement: (dishName: string) => `Increase ${dishName} quantity`,
            descriptionFallback: 'Dish description has not been added yet.',
            dishLoadError: 'Failed to load dish page',
            dishNotFound: 'Dish not found',
            dishNotFoundInRestaurant: 'Dish was not found in the selected restaurant',
            editDish: 'Edit dish',
            loading: 'Loading dish page...',
            openRestaurant: 'Open restaurant page',
            photoPlaceholder: 'Dish photos are not available',
            restaurantIdRequired: 'This page requires the restaurantId query parameter',
            weightUnit: 'g',
        }
        : {
            addDish: (dishName: string) => `Добавить блюдо ${dishName} в корзину`,
            availabilityActive: 'Доступно для заказа',
            availabilityInactive: 'Сейчас недоступно',
            countDecrement: (dishName: string) => `Уменьшить количество блюда ${dishName}`,
            countIncrement: (dishName: string) => `Увеличить количество блюда ${dishName}`,
            descriptionFallback: 'Описание блюда пока не добавлено.',
            dishLoadError: 'Не удалось загрузить страницу блюда',
            dishNotFound: 'Блюдо не найдено',
            dishNotFoundInRestaurant: 'Блюдо не найдено в выбранном ресторане',
            editDish: 'Редактировать блюдо',
            loading: 'Загрузка страницы блюда...',
            openRestaurant: 'Открыть страницу ресторана',
            photoPlaceholder: 'Фотографии блюда отсутствуют',
            restaurantIdRequired: 'Для этой страницы нужен restaurantId в query параметрах',
            weightUnit: 'г',
        };

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

    const loadDish = useCallback(async () => {
        if (!restaurantId) {
            setError(copy.restaurantIdRequired);
            setIsLoading(false);
            return;
        }

        if (!id) {
            setError(language === 'en' ? 'Dish id was not found' : 'Не найден идентификатор блюда');
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
                setError(copy.dishNotFoundInRestaurant);
                setRestaurant(normalizedRestaurant);
                setDish(null);
                return;
            }

            setRestaurant(normalizedRestaurant);
            setDish(foundDish);
        } catch (loadError) {
            setError(getApiErrorMessage(loadError, copy.dishLoadError));
        } finally {
            setIsLoading(false);
        }
    }, [copy.dishLoadError, copy.dishNotFoundInRestaurant, copy.restaurantIdRequired, id, language, restaurantId]);

    useEffect(() => {
        void loadDish();
    }, [loadDish]);

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
                    <div className={styles.stateBlock}>{copy.loading}</div>
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
                    <div className={styles.stateBlock}>{copy.dishNotFound}</div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <section className={`container ${styles.page}`}>
                {canManageDish ? (
                    <DishPhotoGalleryManager
                        dishId={dish.id}
                        dishName={dish.name}
                        photos={dish.photos}
                        canManagePhotos
                        onPhotosChanged={loadDish}
                    />
                ) : (
                    <PhotoCarousel
                        photos={dishPhotos}
                        altText={dish.name}
                        placeholderText={copy.photoPlaceholder}
                    />
                )}

                <div className={styles.headingBlock}>
                    <div className={styles.headingMain}>
                        <h1 className={styles.title}>{dish.name}</h1>
                    </div>

                    {restaurantId ? (
                        <div className={styles.headingActions}>
                            <Link
                                to={generatePath(RoutePaths.RESTAURANT, { id: restaurantId })}
                                className={styles.restaurantPageLink}
                            >
                                {copy.openRestaurant}
                            </Link>
                        </div>
                    ) : null}
                </div>

                <article className={`${styles.card} ${styles.detailsCard}`}>
                    <div className={styles.tags}>
                        <span className={`${styles.tag} ${styles.primaryTag}`}>
                            {dish.category}
                        </span>
                        <span className={styles.tag}>{dish.weight} {copy.weightUnit}</span>

                        {showAvailabilityTag ? (
                            <span
                                className={`${styles.tag} ${
                                    dish.available
                                        ? styles.availableTag
                                        : styles.unavailableTag
                                }`}
                            >
                                {dish.available ? copy.availabilityActive : copy.availabilityInactive}
                            </span>
                        ) : null}
                    </div>

                    {canManageDish || dishCount > 0 ? (
                        <div className={styles.topSide}>
                            {canManageDish && editDishPath ? (
                                <Link
                                    to={editDishPath}
                                    className={styles.managerEditButton}
                                    aria-label={`${copy.editDish} ${dish.name}`}
                                    title={copy.editDish}
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
                        {dish.description?.trim() || copy.descriptionFallback}
                    </p>

                    <div className={styles.controlsSlot}>
                        {dishCount > 0 ? (
                            <div className={styles.cartControls}>
                                <button
                                    type="button"
                                    className={styles.stepButton}
                                    onClick={handleDecreaseFromCart}
                                    aria-label={copy.countDecrement(dish.name)}
                                >
                                    <CartActionIcon type="minus" className={styles.stepIcon} />
                                </button>

                                <span className={styles.cartControlPrice}>{priceLabel}</span>

                                <button
                                    type="button"
                                    className={styles.stepButton}
                                    onClick={handleAddToCart}
                                    disabled={!dish.available}
                                    aria-label={copy.countIncrement(dish.name)}
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
                                aria-label={copy.addDish(dish.name)}
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
