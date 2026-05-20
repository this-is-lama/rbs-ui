import { useEffect, useMemo, useState } from 'react';
import { Link, generatePath, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import { getRestaurantById } from '@/entities/restaurant/api';
import {
    createRestaurant,
    updateRestaurant,
} from '@/entities/restaurant/api/management.ts';
import type { Restaurant, RestaurantManageRequest } from '@/entities/restaurant/model';
import {
    createDefaultRestaurantManageFormValues,
    mapRestaurantToManageFormValues,
} from '@/features/restaurants/manage-restaurant/model/restaurant-manage.schema.ts';
import { RestaurantManageForm } from '@/features/restaurants/manage-restaurant';
import { RoutePaths } from '@/shared/config/routes';
import { getApiErrorMessage } from '@/shared/lib/api';
import { Footer } from '@/widgets/footer';
import pageStyles from '@/widgets/restaurant-management/shared/ManagerPage.module.scss';

type LocationState = {
    message?: string;
};

export const RestaurantManageWidget = () => {
    const { language } = useLanguage();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isLoading, setIsLoading] = useState(Boolean(id));
    const [error, setError] = useState('');

    const copy = language === 'en'
        ? {
            createSuccess: 'Restaurant created',
            editTitle: 'Edit restaurant',
            loadError: 'Failed to load restaurant',
            loading: 'Loading restaurant...',
            newTitle: 'New restaurant',
            openRestaurant: 'Back to restaurant page',
        }
        : {
            createSuccess: 'Ресторан создан',
            editTitle: 'Редактирование ресторана',
            loadError: 'Не удалось загрузить ресторан',
            loading: 'Загрузка ресторана...',
            newTitle: 'Новый ресторан',
            openRestaurant: 'Вернуться на страницу ресторана',
        };

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
                setError(getApiErrorMessage(requestError, copy.loadError));
                setRestaurant(null);
            } finally {
                setIsLoading(false);
            }
        };

        void loadRestaurant();
    }, [copy.loadError, id]);

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
                    message: copy.createSuccess,
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
                <div className={pageStyles.state}>{copy.loading}</div>
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
                            {id ? copy.editTitle : copy.newTitle}
                        </h1>
                    </div>

                    {id ? (
                        <div className={pageStyles.actions}>
                            <Link
                                to={generatePath(RoutePaths.RESTAURANT, { id })}
                                className={pageStyles.primaryLink}
                            >
                                {copy.openRestaurant}
                            </Link>
                        </div>
                    ) : null}
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
