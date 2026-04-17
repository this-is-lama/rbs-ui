import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type {
    DishManageFormValues,
    DishManageRequest,
} from '@/entities/restaurant/model/types.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { dishManageSchema, toDishManageRequest } from '../model/dish-manage.schema.ts';
import styles from '@/features/restaurants/shared/ManageForm.module.scss';

type DishManageFormProps = {
    initialValues: DishManageFormValues;
    mode: 'create' | 'edit';
    onSubmitValues: (values: DishManageRequest) => Promise<void>;
    onDelete?: () => Promise<void>;
};

export const DishManageForm = ({
    initialValues,
    mode,
    onSubmitValues,
    onDelete,
}: DishManageFormProps) => {
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<DishManageFormValues>({
        resolver: zodResolver(dishManageSchema),
        mode: 'onBlur',
        defaultValues: initialValues,
    });

    const {
        register,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = form;

    useEffect(() => {
        reset(initialValues);
    }, [initialValues, reset]);

    const isAvailable = watch('available');

    const handleSubmit = form.handleSubmit(async (values) => {
        try {
            setServerError('');
            setSuccessMessage('');
            await onSubmitValues(toDishManageRequest(values));
            setSuccessMessage(mode === 'create' ? 'Блюдо создано' : 'Изменения сохранены');
        } catch (error) {
            setServerError(getApiErrorMessage(error, 'Не удалось сохранить блюдо'));
        }
    });

    const handleDelete = async () => {
        if (!onDelete) {
            return;
        }

        if (!window.confirm('Удалить блюдо? Это действие нельзя отменить.')) {
            return;
        }

        try {
            setIsDeleting(true);
            setServerError('');
            setSuccessMessage('');
            await onDelete();
        } catch (error) {
            setServerError(getApiErrorMessage(error, 'Не удалось удалить блюдо'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <section className={styles.heroCard}>
                <div className={styles.heroHeader}>
                    <div className={styles.heroFields}>
                        <label htmlFor="dish-name" className={styles.headlineField}>
                            <span className={styles.label}>Название блюда</span>
                            <input
                                id="dish-name"
                                className={styles.headlineInput}
                                placeholder="Название блюда"
                                {...register('name')}
                            />
                            {errors.name?.message ? (
                                <div className={styles.error}>{errors.name.message}</div>
                            ) : null}
                        </label>

                        <label htmlFor="dish-category" className={styles.headlineField}>
                            <span className={styles.label}>Категория</span>
                            <input
                                id="dish-category"
                                className={styles.subheadlineInput}
                                placeholder="Категория блюда"
                                {...register('category')}
                            />
                            {errors.category?.message ? (
                                <div className={styles.error}>{errors.category.message}</div>
                            ) : null}
                        </label>
                    </div>

                    <label
                        className={`${styles.statusCard} ${
                            isAvailable ? styles.statusCardActive : styles.statusCardInactive
                        }`}
                    >
                        <span className={styles.statusCardLabel}>Статус блюда</span>
                        <span className={styles.statusCardValue}>
                            {isAvailable ? 'Активно' : 'Неактивно'}
                        </span>
                        <span className={styles.statusCardHint}>
                            {isAvailable
                                ? 'Блюдо видно в меню и доступно для заказа.'
                                : 'Блюдо скрыто из меню и недоступно для заказа.'}
                        </span>

                        <span className={styles.statusSwitchControl}>
                            <input
                                type="checkbox"
                                className={styles.statusSwitchInput}
                                {...register('available')}
                            />
                            <span className={styles.statusSwitchTrack}>
                                <span className={styles.statusSwitchThumb} />
                            </span>
                        </span>
                    </label>
                </div>

                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label htmlFor="dish-price" className={styles.label}>Цена</label>
                        <input
                            id="dish-price"
                            className={styles.input}
                            inputMode="decimal"
                            placeholder="790"
                            {...register('price')}
                        />
                        {errors.price?.message ? (
                            <div className={styles.error}>{errors.price.message}</div>
                        ) : null}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="dish-weight" className={styles.label}>Вес</label>
                        <input
                            id="dish-weight"
                            className={styles.input}
                            inputMode="numeric"
                            placeholder="180"
                            {...register('weight')}
                        />
                        {errors.weight?.message ? (
                            <div className={styles.error}>{errors.weight.message}</div>
                        ) : null}
                    </div>

                    <div className={`${styles.field} ${styles.fullWidth}`}>
                        <label htmlFor="dish-description" className={styles.label}>Описание</label>
                        <textarea
                            id="dish-description"
                            className={styles.textarea}
                            placeholder="Опишите вкус, состав и подачу блюда"
                            {...register('description')}
                        />
                        {errors.description?.message ? (
                            <div className={styles.error}>{errors.description.message}</div>
                        ) : null}
                    </div>
                </div>
            </section>

            {serverError ? <div className={styles.serverError}>{serverError}</div> : null}
            {successMessage ? <div className={styles.successMessage}>{successMessage}</div> : null}

            <div className={styles.actions}>
                {mode === 'edit' && onDelete ? (
                    <button
                        type="button"
                        className={styles.dangerButton}
                        onClick={() => void handleDelete()}
                        disabled={isSubmitting || isDeleting}
                    >
                        {isDeleting ? 'Удаление...' : 'Удалить блюдо'}
                    </button>
                ) : null}

                <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={isSubmitting || isDeleting}
                >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </form>
    );
};
