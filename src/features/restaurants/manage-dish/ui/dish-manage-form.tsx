import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/app/providers/language';
import type {
    DishManageFormValues,
    DishManageRequest,
} from '@/entities/restaurant/model/types.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { useConfirmDialog } from '@/shared/ui/confirm-dialog/use-confirm-dialog.ts';
import { createDishManageSchema, toDishManageRequest } from '../model/dish-manage.schema.ts';
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
    const { language } = useLanguage();
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const confirmDialog = useConfirmDialog();
    const schema = useMemo(() => createDishManageSchema(language), [language]);
    const copy = language === 'en'
        ? {
            active: 'Active',
            category: 'Category',
            categoryPlaceholder: 'Dish category',
            confirmDelete: 'Delete dish',
            confirmDeleteDescription: 'This action cannot be undone. The dish will disappear from the restaurant menu.',
            confirmDeleteTitle: 'Delete dish?',
            delete: 'Delete dish',
            deleting: 'Deleting...',
            description: 'Description',
            descriptionPlaceholder: 'Describe the taste, ingredients, and presentation',
            inactive: 'Inactive',
            loadError: 'Failed to save dish',
            name: 'Dish name',
            namePlaceholder: 'Dish name',
            price: 'Price',
            save: 'Save',
            saved: mode === 'create' ? 'Dish created' : 'Changes saved',
            saving: 'Saving...',
            status: 'Dish status',
            statusHintActive: 'The dish is visible in the menu and available to order.',
            statusHintInactive: 'The dish is hidden from the menu and unavailable to order.',
            weight: 'Weight',
        }
        : {
            active: 'Активно',
            category: 'Категория',
            categoryPlaceholder: 'Категория блюда',
            confirmDelete: 'Удалить блюдо',
            confirmDeleteDescription: 'Это действие нельзя отменить. Блюдо исчезнет из меню ресторана.',
            confirmDeleteTitle: 'Удалить блюдо?',
            delete: 'Удалить блюдо',
            deleting: 'Удаление...',
            description: 'Описание',
            descriptionPlaceholder: 'Опишите вкус, состав и подачу блюда',
            inactive: 'Неактивно',
            loadError: 'Не удалось сохранить блюдо',
            name: 'Название блюда',
            namePlaceholder: 'Название блюда',
            price: 'Цена',
            save: 'Сохранить',
            saved: mode === 'create' ? 'Блюдо создано' : 'Изменения сохранены',
            saving: 'Сохранение...',
            status: 'Статус блюда',
            statusHintActive: 'Блюдо видно в меню и доступно для заказа.',
            statusHintInactive: 'Блюдо скрыто из меню и недоступно для заказа.',
            weight: 'Вес',
        };

    const form = useForm<DishManageFormValues>({
        resolver: zodResolver(schema),
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
            setSuccessMessage(copy.saved);
        } catch (error) {
            setServerError(getApiErrorMessage(error, copy.loadError));
        }
    });

    const handleDelete = async () => {
        if (!onDelete) {
            return;
        }

        const isConfirmed = await confirmDialog({
            title: copy.confirmDeleteTitle,
            description: copy.confirmDeleteDescription,
            confirmText: copy.confirmDelete,
        });

        if (!isConfirmed) {
            return;
        }

        try {
            setIsDeleting(true);
            setServerError('');
            setSuccessMessage('');
            await onDelete();
        } catch (error) {
            setServerError(getApiErrorMessage(
                error,
                language === 'en' ? 'Failed to delete dish' : 'Не удалось удалить блюдо',
            ));
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
                            <span className={styles.label}>{copy.name}</span>
                            <input
                                id="dish-name"
                                className={styles.headlineInput}
                                placeholder={copy.namePlaceholder}
                                {...register('name')}
                            />
                            {errors.name?.message ? (
                                <div className={styles.error}>{errors.name.message}</div>
                            ) : null}
                        </label>

                        <label htmlFor="dish-category" className={styles.headlineField}>
                            <span className={styles.label}>{copy.category}</span>
                            <input
                                id="dish-category"
                                className={styles.subheadlineInput}
                                placeholder={copy.categoryPlaceholder}
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
                        <span className={styles.statusCardLabel}>{copy.status}</span>
                        <span className={styles.statusCardValue}>
                            {isAvailable ? copy.active : copy.inactive}
                        </span>
                        <span className={styles.statusCardHint}>
                            {isAvailable
                                ? copy.statusHintActive
                                : copy.statusHintInactive}
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
                        <label htmlFor="dish-price" className={styles.label}>{copy.price}</label>
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
                        <label htmlFor="dish-weight" className={styles.label}>{copy.weight}</label>
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
                        <label htmlFor="dish-description" className={styles.label}>{copy.description}</label>
                        <textarea
                            id="dish-description"
                            className={styles.textarea}
                            placeholder={copy.descriptionPlaceholder}
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
                        {isDeleting ? copy.deleting : copy.delete}
                    </button>
                ) : null}

                <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={isSubmitting || isDeleting}
                >
                    {isSubmitting ? copy.saving : copy.save}
                </button>
            </div>
        </form>
    );
};
