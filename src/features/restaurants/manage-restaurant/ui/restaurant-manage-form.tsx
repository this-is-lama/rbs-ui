import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatWeekDay } from '@/entities/restaurant/lib';
import type {
    ContactType,
    RestaurantManageFormValues,
    RestaurantManageRequest,
} from '@/entities/restaurant/model/types.ts';
import { getApiErrorMessage } from '@/shared/lib/api';
import { ChevronDownIcon, ClockIcon, CloseIcon, PlusIcon } from '@/shared/ui/icons';
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

type WorkingHoursTimeFieldKey = 'openTime' | 'closeTime';

type TimeDraft = {
    hour: string;
    minute: string;
};

const timeHourOptions = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const timeMinuteOptions = ['00', '15', '30', '45'] as const;
const defaultTimeDraft: TimeDraft = {
    hour: '10',
    minute: '00',
};

const parseTimeDraft = (value: string | null | undefined): TimeDraft => {
    if (!value) {
        return defaultTimeDraft;
    }

    const [rawHour = defaultTimeDraft.hour, rawMinute = defaultTimeDraft.minute] = value.split(':');
    const hour = timeHourOptions.includes(rawHour) ? rawHour : defaultTimeDraft.hour;
    const minute = timeMinuteOptions.includes(rawMinute as (typeof timeMinuteOptions)[number])
        ? rawMinute
        : defaultTimeDraft.minute;

    return {
        hour,
        minute,
    };
};

const formatTimeDraft = (draft: TimeDraft) => {
    return `${draft.hour}:${draft.minute}`;
};

export const RestaurantManageForm = ({
    initialValues,
    mode,
    onSubmitValues,
}: RestaurantManageFormProps) => {
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [openContactMenuId, setOpenContactMenuId] = useState<string | null>(null);
    const [openTimeMenuId, setOpenTimeMenuId] = useState<string | null>(null);
    const [timeDraft, setTimeDraft] = useState<TimeDraft>(defaultTimeDraft);
    const contactMenuRef = useRef<HTMLDivElement | null>(null);
    const contactButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const timeMenuRef = useRef<HTMLDivElement | null>(null);
    const timeButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const form = useForm<RestaurantManageFormValues>({
        resolver: zodResolver(restaurantManageSchema),
        mode: 'onBlur',
        defaultValues: initialValues,
    });

    const {
        register,
        control,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'contacts',
    });

    const workingHours = watch('workingHours');
    const isActive = watch('active');

    useEffect(() => {
        reset(initialValues);
    }, [initialValues, reset]);

    useEffect(() => {
        if (!openContactMenuId) {
            return;
        }

        if (fields.some((field) => field.id === openContactMenuId)) {
            return;
        }

        setOpenContactMenuId(null);
    }, [fields, openContactMenuId]);

    useEffect(() => {
        if (!openContactMenuId) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            if (contactMenuRef.current?.contains(event.target as Node)) {
                return;
            }

            setOpenContactMenuId(null);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') {
                return;
            }

            setOpenContactMenuId(null);
            contactButtonRefs.current[openContactMenuId]?.focus();
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [openContactMenuId]);

    useEffect(() => {
        if (!openTimeMenuId) {
            return;
        }

        const [rowIndexToken] = openTimeMenuId.split(':');
        const rowIndex = Number.parseInt(rowIndexToken, 10);

        if (Number.isNaN(rowIndex) || !workingHours[rowIndex]?.closed) {
            return;
        }

        setOpenTimeMenuId(null);
    }, [openTimeMenuId, workingHours]);

    useEffect(() => {
        if (!openTimeMenuId) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            if (timeMenuRef.current?.contains(event.target as Node)) {
                return;
            }

            setOpenTimeMenuId(null);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') {
                return;
            }

            setOpenTimeMenuId(null);
            timeButtonRefs.current[openTimeMenuId]?.focus();
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [openTimeMenuId]);

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

    const setContactButtonRef = (fieldId: string, node: HTMLButtonElement | null) => {
        if (node) {
            contactButtonRefs.current[fieldId] = node;
            return;
        }

        delete contactButtonRefs.current[fieldId];
    };

    const handleContactTypeButtonKeyDown = (
        event: ReactKeyboardEvent<HTMLButtonElement>,
        fieldId: string,
    ) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
            return;
        }

        event.preventDefault();
        setOpenTimeMenuId(null);
        setOpenContactMenuId(fieldId);
    };

    const handleContactTypeSelect = (
        fieldId: string,
        nextValue: ContactType,
        onChange: (value: ContactType) => void,
        onBlur: () => void,
    ) => {
        onChange(nextValue);
        onBlur();
        setOpenContactMenuId(null);
        contactButtonRefs.current[fieldId]?.focus();
    };

    const setTimeButtonRef = (fieldId: string, node: HTMLButtonElement | null) => {
        if (node) {
            timeButtonRefs.current[fieldId] = node;
            return;
        }

        delete timeButtonRefs.current[fieldId];
    };

    const handleTimeMenuToggle = (menuId: string, value: string | null | undefined) => {
        if (openTimeMenuId === menuId) {
            setOpenTimeMenuId(null);
            return;
        }

        setOpenContactMenuId(null);
        setTimeDraft(parseTimeDraft(value));
        setOpenTimeMenuId(menuId);
    };

    const handleTimeMenuButtonKeyDown = (
        event: ReactKeyboardEvent<HTMLButtonElement>,
        menuId: string,
        value: string | null | undefined,
    ) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
            return;
        }

        event.preventDefault();
        handleTimeMenuToggle(menuId, value);
    };

    const handleTimeApply = (
        menuId: string,
        fieldName: `workingHours.${number}.${WorkingHoursTimeFieldKey}`,
    ) => {
        setValue(fieldName, formatTimeDraft(timeDraft), {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
        setOpenTimeMenuId(null);
        timeButtonRefs.current[menuId]?.focus();
    };

    const renderWorkingHoursTimeSelect = (
        index: number,
        fieldKey: WorkingHoursTimeFieldKey,
        value: string | null,
        label: string,
        dayLabel: string,
        disabled: boolean,
    ) => {
        const menuId = `${index}:${fieldKey}`;
        const isMenuOpen = openTimeMenuId === menuId;
        const displayedValue = value || '--:--';

        return (
            <div
                ref={isMenuOpen ? timeMenuRef : null}
                className={styles.timeSelectMenu}
            >
                            <button
                                type="button"
                                ref={(node) => setTimeButtonRef(menuId, node)}
                                className={`${styles.timeSelectButton} ${
                                    isMenuOpen ? styles.timeSelectButtonOpen : ''
                                }`}
                                onClick={() => handleTimeMenuToggle(menuId, value)}
                                onKeyDown={(event) => handleTimeMenuButtonKeyDown(event, menuId, value)}
                                disabled={disabled}
                                aria-haspopup="dialog"
                                aria-expanded={isMenuOpen}
                                aria-controls={`working-hours-time-menu-${menuId}`}
                                aria-label={`${label}: ${dayLabel}`}
                            >
                                <span className={styles.timeSelectButtonValue}>{displayedValue}</span>
                                <span className={styles.timeSelectButtonMeta}>
                                    <ClockIcon className={styles.timeSelectClockIcon} />
                                    <ChevronDownIcon
                                        className={`${styles.timeSelectButtonIcon} ${
                                            isMenuOpen ? styles.timeSelectButtonIconOpen : ''
                                        }`}
                                    />
                                </span>
                            </button>

                            {isMenuOpen && !disabled ? (
                                <div
                                    id={`working-hours-time-menu-${menuId}`}
                                    className={styles.timeSelectPopover}
                                    role="dialog"
                                    aria-label={`${label}: ${dayLabel}`}
                                >
                                    <div className={styles.timeSelectPopoverHeader}>
                                        <span className={styles.timeSelectPopoverLabel}>{label}</span>
                                        <span className={styles.timeSelectPopoverValue}>
                                            {formatTimeDraft(timeDraft)}
                                        </span>
                                    </div>

                                    <div className={styles.timeSelectPanel}>
                                        <div className={styles.timeSelectSection}>
                                            <span className={styles.timeSelectSectionLabel}>Часы</span>
                                            <div className={styles.timeSelectHourGrid}>
                                                {timeHourOptions.map((hour) => (
                                                    <button
                                                        key={hour}
                                                        type="button"
                                                        className={`${styles.timeSelectOption} ${
                                                            timeDraft.hour === hour ? styles.timeSelectOptionSelected : ''
                                                        }`}
                                                        onClick={() => setTimeDraft((currentValue) => ({
                                                            ...currentValue,
                                                            hour,
                                                        }))}
                                                    >
                                                        {hour}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.timeSelectSection}>
                                            <span className={styles.timeSelectSectionLabel}>Минуты</span>
                                            <div className={styles.timeSelectMinuteGrid}>
                                                {timeMinuteOptions.map((minute) => (
                                                    <button
                                                        key={minute}
                                                        type="button"
                                                        className={`${styles.timeSelectOption} ${
                                                            timeDraft.minute === minute ? styles.timeSelectOptionSelected : ''
                                                        }`}
                                                        onClick={() => setTimeDraft((currentValue) => ({
                                                            ...currentValue,
                                                            minute,
                                                        }))}
                                                    >
                                                        {minute}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className={styles.timeSelectApplyButton}
                                        onClick={() => handleTimeApply(
                                            menuId,
                                            `workingHours.${index}.${fieldKey}`,
                                        )}
                                    >
                                        Готово
                                    </button>
                                </div>
                            ) : null}
            </div>
        );
    };

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

                        {workingHours.map((item, index) => {
                            const dayLabel = formatWeekDay(item.dayOfWeek);
                            const isRowMenuOpen = openTimeMenuId?.startsWith(`${index}:`);

                            return (
                                <div
                                    key={item.dayOfWeek}
                                    className={`${styles.dayRow} ${
                                        isRowMenuOpen ? styles.dayRowMenuOpen : ''
                                    }`}
                                >
                                    <div className={styles.dayLabel}>{dayLabel}</div>

                                    {renderWorkingHoursTimeSelect(
                                        index,
                                        'openTime',
                                        item.openTime,
                                        'Открытие',
                                        dayLabel,
                                        item.closed,
                                    )}

                                    {renderWorkingHoursTimeSelect(
                                        index,
                                        'closeTime',
                                        item.closeTime,
                                        'Закрытие',
                                        dayLabel,
                                        item.closed,
                                    )}

                                <input
                                    type="hidden"
                                    className={`${styles.input} ${styles.compactInput}`}
                                    disabled={item.closed}
                                    aria-label={`Открытие ${formatWeekDay(item.dayOfWeek)}`}
                                    {...register(`workingHours.${index}.openTime`)}
                                />

                                <input
                                    type="hidden"
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
                        );
                        })}
                    </div>
                </article>

                <div className={styles.displayStack}>
                    <article className={styles.section}>
                        <div>
                            <h2 className={styles.sectionTitle}>Адрес</h2>
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
                                <div
                                    key={field.id}
                                    className={`${styles.contactRow} ${
                                        openContactMenuId === field.id ? styles.contactRowMenuOpen : ''
                                    }`}
                                >
                                    <div className={styles.field}>
                                        <span
                                            id={`contact-type-label-${field.id}`}
                                            className={styles.label}
                                        >
                                            Тип
                                        </span>
                                        <Controller
                                            control={control}
                                            name={`contacts.${index}.type`}
                                            render={({ field: contactTypeField }) => {
                                                const isMenuOpen = openContactMenuId === field.id;
                                                const selectedOption = contactTypeOptions.find(
                                                    (option) => option.value === contactTypeField.value,
                                                ) ?? contactTypeOptions[0];

                                                return (
                                                    <div
                                                        ref={isMenuOpen ? contactMenuRef : null}
                                                        className={styles.contactSelectMenu}
                                                    >
                                                        <button
                                                            id={`contact-type-trigger-${field.id}`}
                                                            ref={(node) => setContactButtonRef(field.id, node)}
                                                            type="button"
                                                            className={`${styles.contactSelectButton} ${
                                                                isMenuOpen ? styles.contactSelectButtonOpen : ''
                                                            }`}
                                                            onClick={() => {
                                                                setOpenTimeMenuId(null);
                                                                setOpenContactMenuId((currentValue) => (
                                                                    currentValue === field.id ? null : field.id
                                                                ));
                                                            }}
                                                            onKeyDown={(event) => handleContactTypeButtonKeyDown(event, field.id)}
                                                            aria-haspopup="listbox"
                                                            aria-expanded={isMenuOpen}
                                                            aria-controls={`contact-type-menu-${field.id}`}
                                                            aria-labelledby={`contact-type-label-${field.id} contact-type-trigger-${field.id}`}
                                                        >
                                                            <span className={styles.contactSelectButtonValue}>
                                                                {selectedOption.label}
                                                            </span>
                                                            <ChevronDownIcon
                                                                className={`${styles.contactSelectButtonIcon} ${
                                                                    isMenuOpen ? styles.contactSelectButtonIconOpen : ''
                                                                }`}
                                                            />
                                                        </button>

                                                        {isMenuOpen ? (
                                                            <div
                                                                id={`contact-type-menu-${field.id}`}
                                                                className={styles.contactSelectPopover}
                                                                role="listbox"
                                                                aria-labelledby={`contact-type-label-${field.id}`}
                                                            >
                                                                {contactTypeOptions.map((option) => (
                                                                    <button
                                                                        key={option.value}
                                                                        type="button"
                                                                        role="option"
                                                                        aria-selected={option.value === contactTypeField.value}
                                                                        className={`${styles.contactSelectOption} ${
                                                                            option.value === contactTypeField.value
                                                                                ? styles.contactSelectOptionSelected
                                                                                : ''
                                                                        }`}
                                                                        onClick={() => handleContactTypeSelect(
                                                                            field.id,
                                                                            option.value,
                                                                            contactTypeField.onChange,
                                                                            contactTypeField.onBlur,
                                                                        )}
                                                                    >
                                                                        <span className={styles.contactSelectOptionLabel}>
                                                                            {option.label}
                                                                        </span>
                                                                        {option.value === contactTypeField.value ? (
                                                                            <span className={styles.contactSelectOptionIndicator} />
                                                                        ) : null}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            }}
                                        />
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

            <article className={styles.section}>
                <div>
                    <h2 className={styles.sectionTitle}>Динамический сервисный сбор</h2>
                    <p className={styles.sectionDescription}>
                        Границы суммы, в которых система рассчитывает сбор для предзаказа.
                    </p>
                </div>

                <div className={styles.compactGrid}>
                    <div className={styles.field}>
                        <label htmlFor="restaurant-min-pricing-charge" className={styles.label}>
                            Минимальный сбор
                        </label>
                        <input
                            id="restaurant-min-pricing-charge"
                            type="number"
                            min="0"
                            max="10000"
                            step="0.01"
                            inputMode="decimal"
                            className={styles.input}
                            {...register('minPricingCharge')}
                        />
                        {errors.minPricingCharge?.message ? (
                            <div className={styles.error}>{errors.minPricingCharge.message}</div>
                        ) : null}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="restaurant-max-pricing-charge" className={styles.label}>
                            Максимальный сбор
                        </label>
                        <input
                            id="restaurant-max-pricing-charge"
                            type="number"
                            min="0"
                            max="10000"
                            step="0.01"
                            inputMode="decimal"
                            className={styles.input}
                            {...register('maxPricingCharge')}
                        />
                        {errors.maxPricingCharge?.message ? (
                            <div className={styles.error}>{errors.maxPricingCharge.message}</div>
                        ) : null}
                    </div>
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
