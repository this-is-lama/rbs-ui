import { useEffect, useMemo, useState } from 'react';
import { generatePath, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Footer } from '@/widgets/footer/Footer.tsx';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
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
import { DishManageForm } from '@/features/restaurants/manage-dish/ui/dish-manage-form.tsx';
import {
    createDefaultDishManageFormValues,
    mapDishToManageFormValues,
} from '@/features/restaurants/manage-dish/model/dish-manage.schema.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import pageStyles from '@/widgets/restaurant-management/shared/ManagerPage.module.scss';

type LocationState = {
    message?: string;
};

export const DishManageWidget = () => {
    const { restaurantId, dishId } = useParams<{
        restaurantId: string;
        dishId?: string;
    }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [dish, setDish] = useState<Dish | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!restaurantId) {
            setError('Не найден идентификатор ресторана');
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
                setError(getApiErrorMessage(requestError, 'Не удалось загрузить блюдо'));
                setRestaurant(null);
                setDish(null);
            } finally {
                setIsLoading(false);
            }
        };

        void loadData();
    }, [dishId, restaurantId]);

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
        navigate(generatePath(RoutePaths.MY_RESTAURANT_EDIT, { id: restaurantId }), {
            replace: true,
        });
    };

    if (isLoading) {
        return (
            <div className={`container ${pageStyles.page}`}>
                <div className={pageStyles.state}>Загрузка блюда...</div>
            </div>
        );
    }

    if (error || !restaurantId) {
        return (
            <div className={`container ${pageStyles.page}`}>
                <div className={pageStyles.state}>{error || 'Не найден ресторан'}</div>
            </div>
        );
    }

    return (
        <div className={pageStyles.page}>
            <section className={`container ${pageStyles.section}`}>
                <div className={pageStyles.header}>
                    <div className={pageStyles.titleBlock}>
                        <h1 className={pageStyles.title}>
                            {dishId ? 'Редактирование блюда' : 'Новое блюдо'}
                        </h1>
                        <p className={pageStyles.subtitle}>
                            Ресторан: {restaurant?.name || 'Ресторан'}
                        </p>
                    </div>
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
