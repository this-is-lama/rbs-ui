import { useEffect, useMemo, useState } from 'react';
import { generatePath, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Footer } from '@/widgets/footer/Footer.tsx';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
import {
    createRestaurant,
    updateRestaurant,
} from '@/entities/restaurant/api/management.ts';
import type { Restaurant, RestaurantManageRequest } from '@/entities/restaurant/model/types.ts';
import { RestaurantManageForm } from '@/features/restaurants/manage-restaurant/ui/restaurant-manage-form.tsx';
import {
    createDefaultRestaurantManageFormValues,
    mapRestaurantToManageFormValues,
} from '@/features/restaurants/manage-restaurant/model/restaurant-manage.schema.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import pageStyles from '@/widgets/restaurant-management/shared/ManagerPage.module.scss';

type LocationState = {
    message?: string;
};

export const RestaurantManageWidget = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isLoading, setIsLoading] = useState(Boolean(id));
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) {
            setIsLoading(false);
            return;
        }

        const loadRestaurant = async () => {
            try {
                setIsLoading(true);
                setError('');
                const response = await getRestaurantById(id);
                setRestaurant(response);
            } catch (requestError) {
                setError(getApiErrorMessage(requestError, 'Не удалось загрузить ресторан'));
                setRestaurant(null);
            } finally {
                setIsLoading(false);
            }
        };

        void loadRestaurant();
    }, [id]);

    const flashMessage = ((location.state as LocationState | null)?.message) ?? '';

    const initialValues = useMemo(() => {
        return restaurant
            ? mapRestaurantToManageFormValues(restaurant)
            : createDefaultRestaurantManageFormValues();
    }, [restaurant]);

    const handleSubmitValues = async (values: RestaurantManageRequest) => {
        if (!id) {
            const createdId = await createRestaurant(values);
            navigate(generatePath(RoutePaths.MY_RESTAURANT_EDIT, { id: createdId }), {
                replace: true,
                state: {
                    message: 'Ресторан создан',
                },
            });
            return;
        }

        const updatedRestaurant = await updateRestaurant(id, values);
        setRestaurant(updatedRestaurant);
    };

    if (isLoading) {
        return (
            <div className={`container ${pageStyles.page}`}>
                <div className={pageStyles.state}>Загрузка ресторана...</div>
            </div>
        );
    }

    if (id && error) {
        return (
            <div className={`container ${pageStyles.page}`}>
                <div className={pageStyles.state}>{error}</div>
            </div>
        );
    }

    return (
        <div className={pageStyles.page}>
            <section className={`container ${pageStyles.section}`}>
                <div className={pageStyles.header}>
                    <div className={pageStyles.titleBlock}>
                        <h1 className={pageStyles.title}>
                            {id ? 'Редактирование ресторана' : 'Новый ресторан'}
                        </h1>
                        <p className={pageStyles.subtitle}>
                            Форма повторяет структуру обычной страницы ресторана, но здесь все поля можно менять.
                        </p>
                    </div>
                </div>

                {flashMessage ? <div className={pageStyles.note}>{flashMessage}</div> : null}

                <RestaurantManageForm
                    initialValues={initialValues}
                    mode={id ? 'edit' : 'create'}
                    onSubmitValues={handleSubmitValues}
                />
            </section>

            <Footer />
        </div>
    );
};
