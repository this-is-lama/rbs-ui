import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatWeekDay } from '@/entities/restaurant/lib/format-working-hours.ts';
import type {
    RestaurantManageFormValues,
    RestaurantManageRequest,
} from '@/entities/restaurant/model/types.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { CloseIcon, PlusIcon } from '@/shared/ui/icons/action-icons.tsx';
import {
    restaurantManageSchema,
    toRestaurantManageRequest,
} from '../model/restaurant-manage.schema.ts';
import styles from '@/features/restaurants/shared/ManageForm.module.scss';

type RestaurantManageFormProps = {
    initialValues: RestaurantManageFormValues;
    mode: 'create' | 'edit';
    onSubmitValues: (values: RestaurantManageRequest) => Promise<void>;
};

const contactTypeOptions = [
    { value: 'PHONE', label: 'Телефон' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'WEBSITE', label: 'Сайт' },
] as const;

export const RestaurantManageForm = ({
    initialValues,
    mode,
    onSubmitValues,
}: RestaurantManageFormProps) => {
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const form = useForm<RestaurantManageFormValues>({
        resolver: zodResolver(restaurantManageSchema),
        mode: 'onBlur',
        defaultValues: initialValues,
    });

    const {
        register,
        control,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'contacts',
    });

    useEffect(() => {
        reset(initialValues);
    }, [initialValues, reset]);

    const workingHours = watch('workingHours');
    const isActive = watch('active');

    const handleSubmit = form.handleSubmit(async (values) => {
        try {
            setServerError('');
            setSuccessMessage('');
            await onSubmitValues(toRestaurantManageRequest(values));
            setSuccessMessage(mode === 'create' ? 'Ресторан создан' : 'Изменения сохранены');
        } catch (error) {
            setServerError(getApiErrorMessage(error, 'Не удалось сохранить ресторан'));
        }
    });

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <section className={styles.heroCard}>
                <div className={styles.heroHeader}>
                    <div className={styles.heroFields}>
                        <label htmlFor="restaurant-name" className={styles.headlineField}>
                            <span className={styles.label}>Название ресторана</span>
                            <input
                                id="restaurant-name"
                                className={styles.headlineInput}
                                placeholder="Название ресторана"
                                {...register('name')}
                            />
                            {errors.name?.message ? (
                                <div className={styles.error}>{errors.name.message}</div>
                            ) : null}
                        </label>

                        <label htmlFor="restaurant-category" className={styles.headlineField}>
                            <span className={styles.label}>Категория</span>
                            <input
                                id="restaurant-category"
                                className={styles.subheadlineInput}
                                placeholder="Категория ресторана"
                                {...register('category')}
                            />
                            {errors.category?.message ? (
                                <div className={styles.error}>{errors.category.message}</div>
                            ) : null}
                        </label>
                    </div>

                    <label
                        className={`${styles.statusCard} ${
                            isActive ? styles.statusCardActive : styles.statusCardInactive
                        }`}
                    >
                        <span className={styles.statusCardLabel}>Статус ресторана</span>
                        <span className={styles.statusCardValue}>
                            {isActive ? 'Активен' : 'Неактивен'}
                        </span>
                        <span className={styles.statusCardHint}>
                            {isActive
                                ? 'Ресторан доступен посетителям.'
                                : 'Ресторан скрыт от посетителей.'}
                        </span>

                        <span className={styles.statusSwitchControl}>
                            <input
                                type="checkbox"
                                className={styles.statusSwitchInput}
                                {...register('active')}
                            />
                            <span className={styles.statusSwitchTrack}>
                                <span className={styles.statusSwitchThumb} />
                            </span>
                        </span>
                    </label>
                </div>
            </section>

            <section className={styles.displayGrid}>
                <article className={styles.section}>
                    <div>
                        <h2 className={styles.sectionTitle}>Время работы</h2>
                        <p className={styles.sectionDescription}>
                            Если день закрыт, поля времени можно оставить пустыми.
                        </p>
                    </div>

                    <div className={styles.hoursTable}>
                        <div className={styles.hoursHeader}>
                            <span className={styles.hoursHeaderSpacer} />
                            <span className={styles.hoursHeaderLabel}>Открытие</span>
                            <span className={styles.hoursHeaderLabel}>Закрытие</span>
                            <span className={`${styles.hoursHeaderLabel} ${styles.hoursHeaderLabelCentered}`}>
                                Выходной
                            </span>
                        </div>

                        {workingHours.map((item, index) => (
                            <div key={item.dayOfWeek} className={styles.dayRow}>
                                <div className={styles.dayLabel}>{formatWeekDay(item.dayOfWeek)}</div>

                                <input
                                    type="time"
                                    className={`${styles.input} ${styles.compactInput}`}
                                    disabled={item.closed}
                                    aria-label={`Открытие ${formatWeekDay(item.dayOfWeek)}`}
                                    {...register(`workingHours.${index}.openTime`)}
                                />

                                <input
                                    type="time"
                                    className={`${styles.input} ${styles.compactInput}`}
                                    disabled={item.closed}
                                    aria-label={`Закрытие ${formatWeekDay(item.dayOfWeek)}`}
                                    {...register(`workingHours.${index}.closeTime`)}
                                />

                                <label className={styles.daySwitch}>
                                    <span className={styles.srOnly}>
                                        Выходной: {formatWeekDay(item.dayOfWeek)}
                                    </span>
                                    <input
                                        type="checkbox"
                                        className={styles.daySwitchInput}
                                        aria-label={`Выходной: ${formatWeekDay(item.dayOfWeek)}`}
                                        {...register(`workingHours.${index}.closed`)}
                                    />
                                    <span className={styles.daySwitchTrack}>
                                        <span className={styles.daySwitchThumb} />
                                    </span>
                                </label>

                                {errors.workingHours?.[index]?.openTime?.message ? (
                                    <div className={`${styles.error} ${styles.fullWidth}`}>
                                        {errors.workingHours[index]?.openTime?.message}
                                    </div>
                                ) : null}

                                {errors.workingHours?.[index]?.closeTime?.message ? (
                                    <div className={`${styles.error} ${styles.fullWidth}`}>
                                        {errors.workingHours[index]?.closeTime?.message}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </article>

                <div className={styles.displayStack}>
                    <article className={styles.section}>
                        <div>
                            <h2 className={styles.sectionTitle}>Адрес</h2>
                            <p className={styles.sectionDescription}>
                                Укажите точный адрес, который будут видеть посетители.
                            </p>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="restaurant-address" className={styles.label}>Адрес</label>
                            <input
                                id="restaurant-address"
                                className={styles.input}
                                placeholder="Улица, дом, этаж"
                                {...register('address')}
                            />
                            {errors.address?.message ? (
                                <div className={styles.error}>{errors.address.message}</div>
                            ) : null}
                        </div>
                    </article>

                    <article className={styles.section}>
                        <div className={styles.sectionHeaderCompact}>
                            <div>
                                <h2 className={styles.sectionTitle}>Контакты</h2>
                                <p className={styles.sectionDescription}>
                                    Добавьте телефон, email или сайт ресторана.
                                </p>
                            </div>

                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => append({ type: 'PHONE', value: '' })}
                                aria-label="Добавить контакт"
                                title="Добавить контакт"
                            >
                                <PlusIcon className={styles.iconButtonIcon} />
                            </button>
                        </div>

                        <div className={styles.form}>
                            {fields.map((field, index) => (
                                <div key={field.id} className={styles.contactRow}>
                                    <div className={styles.field}>
                                        <label htmlFor={`contact-type-${field.id}`} className={styles.label}>
                                            Тип
                                        </label>
                                        <select
                                            id={`contact-type-${field.id}`}
                                            className={`${styles.select} ${styles.compactInput} ${styles.contactTypeSelect}`}
                                            {...register(`contacts.${index}.type`)}
                                        >
                                            {contactTypeOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.field}>
                                        <label htmlFor={`contact-value-${field.id}`} className={styles.label}>
                                            Значение
                                        </label>
                                        <input
                                            id={`contact-value-${field.id}`}
                                            className={`${styles.input} ${styles.compactInput}`}
                                            placeholder="Введите контакт"
                                            {...register(`contacts.${index}.value`)}
                                        />
                                        {errors.contacts?.[index]?.value?.message ? (
                                            <div className={styles.error}>
                                                {errors.contacts[index]?.value?.message}
                                            </div>
                                        ) : null}
                                    </div>

                                    <button
                                        type="button"
                                        className={styles.contactRemoveButton}
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                        aria-label="Удалить контакт"
                                        title="Удалить контакт"
                                    >
                                        <CloseIcon className={styles.contactRemoveIcon} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </article>
                </div>
            </section>

            <article className={styles.section}>
                <div>
                    <h2 className={styles.sectionTitle}>Описание</h2>
                    <p className={styles.sectionDescription}>
                        Расскажите о концепции ресторана, атмосфере и особенностях.
                    </p>
                </div>

                <div className={styles.field}>
                    <label htmlFor="restaurant-description" className={styles.label}>Описание</label>
                    <textarea
                        id="restaurant-description"
                        className={styles.textarea}
                        placeholder="Коротко расскажите о ресторане"
                        {...register('description')}
                    />
                    {errors.description?.message ? (
                        <div className={styles.error}>{errors.description.message}</div>
                    ) : null}
                </div>
            </article>

            {serverError ? <div className={styles.serverError}>{serverError}</div> : null}
            {successMessage ? <div className={styles.successMessage}>{successMessage}</div> : null}

            <div className={styles.actions}>
                <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </form>
    );
};
