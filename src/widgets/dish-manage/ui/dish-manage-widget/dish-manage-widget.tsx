import { useEffect, useMemo, useState } from 'react';
import { Link, generatePath, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import { Footer } from '@/widgets/footer';
import { getRestaurantById } from '@/entities/restaurant/api';
import {
    createDish,
    deleteDish,
    getRestaurantDishById,
    updateDish,
} from '@/entities/restaurant/api/management.ts';
import type {
    Dish,
    DishManageRequest,
    Restaurant,
} from '@/entities/restaurant/model/types.ts';
import { DishManageForm } from '@/features/restaurants/manage-dish';
import {
    createDefaultDishManageFormValues,
    mapDishToManageFormValues,
} from '@/features/restaurants/manage-dish/model/dish-manage.schema.ts';
import { getApiErrorMessage } from '@/shared/lib/api';
import { RoutePaths } from '@/shared/config/routes';
import { dishCartStorage } from '@/shared/dish-cart';
import pageStyles from '@/widgets/restaurant-management/shared/ManagerPage.module.scss';

type LocationState = {
    message?: string;
};

export const DishManageWidget = () => {
    const { language } = useLanguage();
    const { restaurantId, dishId } = useParams<{
        restaurantId: string;
        dishId?: string;
    }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [, setRestaurant] = useState<Restaurant | null>(null);
    const [dish, setDish] = useState<Dish | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const copy = language === 'en'
        ? {
            editTitle: 'Edit dish',
            loadDishError: 'Failed to load dish',
            loading: 'Loading dish...',
            missingRestaurantId: 'Restaurant id was not found',
            openDish: 'Open dish page',
            restaurantFallback: 'Restaurant',
            restaurantLabel: 'Restaurant',
            restaurantNotFound: 'Restaurant not found',
            subtitle: (restaurantName: string) => `Restaurant: ${restaurantName}`,
            newTitle: 'New dish',
        }
        : {
            editTitle: 'Редактирование блюда',
            loadDishError: 'Не удалось загрузить блюдо',
            loading: 'Загрузка блюда...',
            missingRestaurantId: 'Не найден идентификатор ресторана',
            openDish: 'Открыть страницу блюда',
            restaurantFallback: 'Ресторан',
            restaurantLabel: 'Ресторан',
            restaurantNotFound: 'Не найден ресторан',
            subtitle: (restaurantName: string) => `Ресторан: ${restaurantName}`,
            newTitle: 'Новое блюдо',
        };

    useEffect(() => {
        if (!restaurantId) {
            setError(copy.missingRestaurantId);
            setIsLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                setIsLoading(true);
                setError('');

                const [restaurantResponse, dishResponse] = await Promise.all([
                    getRestaurantById(restaurantId),
                    dishId ? getRestaurantDishById(restaurantId, dishId) : Promise.resolve(null),
                ]);

                setRestaurant(restaurantResponse);
                setDish(dishResponse);
            } catch (requestError) {
                setError(getApiErrorMessage(requestError, copy.loadDishError));
                setRestaurant(null);
                setDish(null);
            } finally {
                setIsLoading(false);
            }
        };

        void loadData();
    }, [copy.loadDishError, copy.missingRestaurantId, dishId, restaurantId]);

    const flashMessage = ((location.state as LocationState | null)?.message) ?? '';

    const initialValues = useMemo(() => {
        return dish
            ? mapDishToManageFormValues(dish)
            : createDefaultDishManageFormValues();
    }, [dish]);

    const handleSubmitValues = async (values: DishManageRequest) => {
        if (!restaurantId) {
            return;
        }

        if (!dishId) {
            const createdDishId = await createDish(restaurantId, values);
            navigate(`${generatePath(RoutePaths.DISH, { id: createdDishId })}?restaurantId=${restaurantId}`, {
                replace: true,
            });
            return;
        }

        const updatedDish = await updateDish(restaurantId, dishId, values);
        setDish(updatedDish);
        navigate(`${generatePath(RoutePaths.DISH, { id: updatedDish.id })}?restaurantId=${restaurantId}`, {
            replace: true,
        });
    };

    const handleDeleteDish = async () => {
        if (!restaurantId || !dishId) {
            return;
        }

        await deleteDish(restaurantId, dishId);
        dishCartStorage.removeItem(restaurantId, dishId);
        navigate(generatePath(RoutePaths.MY_RESTAURANT_EDIT, { id: restaurantId }), {
            replace: true,
        });
    };

    if (isLoading) {
        return (
            <div className={`container ${pageStyles.page}`}>
                <div className={pageStyles.state}>{copy.loading}</div>
            </div>
        );
    }

    if (error || !restaurantId) {
        return (
            <div className={`container ${pageStyles.page}`}>
                <div className={pageStyles.state}>{error || copy.restaurantNotFound}</div>
            </div>
        );
    }

    return (
        <div className={pageStyles.page}>
            <section className={`container ${pageStyles.section}`}>
                <div className={pageStyles.header}>
                    <div className={pageStyles.titleBlock}>
                        <h1 className={pageStyles.title}>
                            {dishId ? copy.editTitle : copy.newTitle}
                        </h1>
                    </div>

                    {dishId ? (
                        <div className={pageStyles.actions}>
                            <Link
                                to={`${generatePath(RoutePaths.DISH, { id: dishId })}?restaurantId=${restaurantId}`}
                                className={pageStyles.primaryLink}
                            >
                                {copy.openDish}
                            </Link>
                        </div>
                    ) : null}
                </div>

                {flashMessage ? <div className={pageStyles.note}>{flashMessage}</div> : null}

                <DishManageForm
                    initialValues={initialValues}
                    mode={dishId ? 'edit' : 'create'}
                    onSubmitValues={handleSubmitValues}
                    onDelete={dishId ? handleDeleteDish : undefined}
                />
            </section>

            <Footer />
        </div>
    );
};
