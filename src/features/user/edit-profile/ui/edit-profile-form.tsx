import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/app/providers/language';
import {
    CalendarIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@/shared/ui/icons';
import { useEditProfileForm } from '../model/use-edit-profile-form.ts';
import styles from '@/features/user/profile-settings/ui/ProfileSettingsForm.module.scss';

const monthLabels = {
    en: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ],
    ru: [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь',
    ],
} as const;

const weekdayLabels = {
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
} as const;

type DateToolbarMenu = 'month' | 'year' | null;

const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1900 + 1 }, (_, index) => currentYear - index);
};

const normalizeDate = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const startOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

const shiftMonth = (date: Date, amount: number) => {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1);
};

const isSameCalendarDay = (left: Date | null, right: Date | null) => {
    if (!left || !right) {
        return false;
    }

    return left.getFullYear() === right.getFullYear()
        && left.getMonth() === right.getMonth()
        && left.getDate() === right.getDate();
};

const parseIsoDate = (value: string) => {
    if (!value) {
        return null;
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return null;
    }

    return new Date(year, month - 1, day);
};

const formatIsoDate = (date: Date) => {
    const normalized = normalizeDate(date);
    const year = normalized.getFullYear();
    const month = String(normalized.getMonth() + 1).padStart(2, '0');
    const day = String(normalized.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date: Date, locale: 'ru' | 'en') => {
    const formatter = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    return formatter.format(date);
};

const buildCalendarDays = (monthDate: Date, selectedDate: Date | null) => {
    const monthStart = startOfMonth(monthDate);
    const today = normalizeDate(new Date());
    const offset = (monthStart.getDay() + 6) % 7;
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - offset);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);

        const normalized = normalizeDate(date);

        return {
            date: normalized,
            label: normalized.getDate(),
            isCurrentMonth: normalized.getMonth() === monthDate.getMonth(),
            isFuture: normalized.getTime() > today.getTime(),
            isSelected: isSameCalendarDay(normalized, selectedDate),
            isToday: isSameCalendarDay(normalized, today),
        };
    });
};

export const EditProfileForm = () => {
    const { language } = useLanguage();
    const {
        register,
        setValue,
        watch,
        formState: { errors, isSubmitting },
        serverError,
        successMessage,
        onSubmit,
    } = useEditProfileForm();
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [activeDateMenu, setActiveDateMenu] = useState<DateToolbarMenu>(null);
    const datePickerRef = useRef<HTMLDivElement | null>(null);
    const dateTriggerRef = useRef<HTMLButtonElement | null>(null);
    const yearMenuRef = useRef<HTMLDivElement | null>(null);
    const locale = language === 'en' ? 'en' : 'ru';
    const yearOptions = useMemo(() => getYearOptions(), []);
    const dateOfBirthValue = watch('dateOfBirth') ?? '';
    const selectedDate = useMemo(() => parseIsoDate(dateOfBirthValue), [dateOfBirthValue]);
    const [visibleMonth, setVisibleMonth] = useState(() => {
        return startOfMonth(parseIsoDate(dateOfBirthValue) ?? new Date());
    });
    const calendarDays = useMemo(() => {
        return buildCalendarDays(visibleMonth, selectedDate);
    }, [visibleMonth, selectedDate]);
    const currentMonth = startOfMonth(new Date());
    const canGoToNextMonth = visibleMonth.getTime() < currentMonth.getTime();
    const { ref: dateOfBirthRef, ...dateOfBirthField } = register('dateOfBirth');
    const copy = language === 'en'
        ? {
            clearDate: 'Clear date',
            dateOfBirth: 'Date of birth',
            datePlaceholder: 'Select a date',
            month: 'Month',
            nextMonth: 'Next month',
            previousMonth: 'Previous month',
            year: 'Year',
        }
        : {
            clearDate: 'Очистить дату',
            dateOfBirth: 'Дата рождения',
            datePlaceholder: 'Выберите дату',
            month: 'Месяц',
            nextMonth: 'Следующий месяц',
            previousMonth: 'Предыдущий месяц',
            year: 'Год',
        };

    useEffect(() => {
        if (!isDatePickerOpen) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            if (datePickerRef.current?.contains(event.target as Node)) {
                return;
            }

            setActiveDateMenu(null);
            setIsDatePickerOpen(false);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') {
                return;
            }

            setActiveDateMenu(null);
            setIsDatePickerOpen(false);
            dateTriggerRef.current?.focus();
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isDatePickerOpen]);

    useEffect(() => {
        if (activeDateMenu !== 'year' || !yearMenuRef.current) {
            return;
        }

        const selectedOption = yearMenuRef.current.querySelector('[aria-selected="true"]');

        if (selectedOption instanceof HTMLElement) {
            selectedOption.scrollIntoView({
                block: 'nearest',
            });
        }
    }, [activeDateMenu]);

    const handleDateSelect = (date: Date) => {
        setActiveDateMenu(null);
        setVisibleMonth(startOfMonth(date));
        setValue('dateOfBirth', formatIsoDate(date), {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
        setIsDatePickerOpen(false);
        dateTriggerRef.current?.focus();
    };

    const handleDateClear = () => {
        setActiveDateMenu(null);
        setVisibleMonth(startOfMonth(new Date()));
        setValue('dateOfBirth', '', {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
        setIsDatePickerOpen(false);
        dateTriggerRef.current?.focus();
    };

    const handleDatePickerToggle = () => {
        if (!isDatePickerOpen) {
            setVisibleMonth(startOfMonth(selectedDate ?? new Date()));
        }

        setActiveDateMenu(null);
        setIsDatePickerOpen((currentValue) => !currentValue);
    };

    const handleMonthSelect = (month: number) => {
        setVisibleMonth((currentValue) => {
            return new Date(currentValue.getFullYear(), month, 1);
        });
        setActiveDateMenu(null);
    };

    const handleYearSelect = (year: number) => {
        setVisibleMonth((currentValue) => {
            return new Date(year, currentValue.getMonth(), 1);
        });
        setActiveDateMenu(null);
    };

    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.grid}>
                <div className={styles.field}>
                    <label htmlFor="name" className={styles.label}>Имя</label>
                    <input
                        id="name"
                        className={styles.input}
                        placeholder="Введите имя"
                        autoComplete="given-name"
                        {...register('name')}
                    />
                    {errors.name?.message ? (
                        <div className={styles.error}>{errors.name.message}</div>
                    ) : null}
                </div>

                <div className={styles.field}>
                    <label htmlFor="surname" className={styles.label}>Фамилия</label>
                    <input
                        id="surname"
                        className={styles.input}
                        placeholder="Введите фамилию"
                        autoComplete="family-name"
                        {...register('surname')}
                    />
                    {errors.surname?.message ? (
                        <div className={styles.error}>{errors.surname.message}</div>
                    ) : null}
                </div>

                <div className={styles.field}>
                    <label htmlFor="dateOfBirth" className={styles.label}>Дата рождения</label>
                    <div
                        ref={datePickerRef}
                        className={`${styles.datePicker} ${isDatePickerOpen ? styles.datePickerOpen : ''}`}
                    >
                        <input
                            id="dateOfBirth"
                            type="hidden"
                            {...dateOfBirthField}
                            ref={dateOfBirthRef}
                        />

                        <button
                            ref={dateTriggerRef}
                            type="button"
                            className={`${styles.dateTrigger} ${
                                isDatePickerOpen ? styles.dateTriggerOpen : ''
                            }`}
                            onClick={handleDatePickerToggle}
                            aria-haspopup="dialog"
                            aria-expanded={isDatePickerOpen}
                            aria-controls="profile-date-picker"
                        >
                            <span
                                className={`${styles.dateTriggerValue} ${
                                    selectedDate ? '' : styles.dateTriggerPlaceholder
                                }`}
                            >
                                {selectedDate
                                    ? formatDisplayDate(selectedDate, locale)
                                    : copy.datePlaceholder}
                            </span>

                            <span className={styles.dateTriggerIcons}>
                                <CalendarIcon className={styles.dateTriggerCalendarIcon} />
                                <ChevronDownIcon
                                    className={`${styles.dateTriggerChevron} ${
                                        isDatePickerOpen ? styles.dateTriggerChevronOpen : ''
                                    }`}
                                />
                            </span>
                        </button>

                        {isDatePickerOpen ? (
                            <div
                                id="profile-date-picker"
                                className={styles.datePopover}
                                role="dialog"
                                aria-label={copy.dateOfBirth}
                            >
                                <div className={styles.datePopoverHeader}>
                                    <span className={styles.datePopoverTitle}>{copy.dateOfBirth}</span>
                                </div>

                                <div className={styles.dateToolbar}>
                                    <button
                                        type="button"
                                        className={styles.dateNavButton}
                                        onClick={() => {
                                            setActiveDateMenu(null);
                                            setVisibleMonth((currentValue) => shiftMonth(currentValue, -1));
                                        }}
                                        aria-label={copy.previousMonth}
                                    >
                                        <ChevronLeftIcon className={styles.dateNavIcon} />
                                    </button>

                                    <div className={styles.dateSelectGroup}>
                                        <div className={styles.dateSelectControl}>
                                            <button
                                                type="button"
                                                className={`${styles.dateSelectButton} ${
                                                    activeDateMenu === 'month' ? styles.dateSelectButtonOpen : ''
                                                }`}
                                                onClick={() => {
                                                    setActiveDateMenu((currentValue) => {
                                                        return currentValue === 'month' ? null : 'month';
                                                    });
                                                }}
                                                aria-haspopup="listbox"
                                                aria-expanded={activeDateMenu === 'month'}
                                                aria-label={copy.month}
                                            >
                                                <span className={styles.dateSelectButtonValue}>
                                                    {monthLabels[locale][visibleMonth.getMonth()]}
                                                </span>
                                                <ChevronDownIcon
                                                    className={`${styles.dateSelectButtonIcon} ${
                                                        activeDateMenu === 'month' ? styles.dateSelectButtonIconOpen : ''
                                                    }`}
                                                />
                                            </button>

                                            {activeDateMenu === 'month' ? (
                                                <div
                                                    className={`${styles.dateSelectMenu} ${styles.dateSelectMenuMonths}`}
                                                    role="listbox"
                                                    aria-label={copy.month}
                                                >
                                                    {monthLabels[locale].map((monthLabel, index) => (
                                                        <button
                                                            key={monthLabel}
                                                            type="button"
                                                            role="option"
                                                            aria-selected={index === visibleMonth.getMonth()}
                                                            className={`${styles.dateSelectOption} ${
                                                                index === visibleMonth.getMonth()
                                                                    ? styles.dateSelectOptionSelected
                                                                    : ''
                                                            }`}
                                                            onClick={() => handleMonthSelect(index)}
                                                        >
                                                            {monthLabel}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className={styles.dateSelectControl}>
                                            <button
                                                type="button"
                                                className={`${styles.dateSelectButton} ${
                                                    activeDateMenu === 'year' ? styles.dateSelectButtonOpen : ''
                                                }`}
                                                onClick={() => {
                                                    setActiveDateMenu((currentValue) => {
                                                        return currentValue === 'year' ? null : 'year';
                                                    });
                                                }}
                                                aria-haspopup="listbox"
                                                aria-expanded={activeDateMenu === 'year'}
                                                aria-label={copy.year}
                                            >
                                                <span className={styles.dateSelectButtonValue}>
                                                    {visibleMonth.getFullYear()}
                                                </span>
                                                <ChevronDownIcon
                                                    className={`${styles.dateSelectButtonIcon} ${
                                                        activeDateMenu === 'year' ? styles.dateSelectButtonIconOpen : ''
                                                    }`}
                                                />
                                            </button>

                                            {activeDateMenu === 'year' ? (
                                                <div
                                                    ref={yearMenuRef}
                                                    className={`${styles.dateSelectMenu} ${styles.dateSelectMenuYears}`}
                                                    role="listbox"
                                                    aria-label={copy.year}
                                                >
                                                    {yearOptions.map((year) => (
                                                        <button
                                                            key={year}
                                                            type="button"
                                                            role="option"
                                                            aria-selected={year === visibleMonth.getFullYear()}
                                                            className={`${styles.dateSelectOption} ${
                                                                year === visibleMonth.getFullYear()
                                                                    ? styles.dateSelectOptionSelected
                                                                    : ''
                                                            }`}
                                                            onClick={() => handleYearSelect(year)}
                                                        >
                                                            {year}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className={styles.dateNavButton}
                                        onClick={() => {
                                            setActiveDateMenu(null);
                                            setVisibleMonth((currentValue) => shiftMonth(currentValue, 1));
                                        }}
                                        aria-label={copy.nextMonth}
                                        disabled={!canGoToNextMonth}
                                    >
                                        <ChevronRightIcon className={styles.dateNavIcon} />
                                    </button>
                                </div>

                                <div className={styles.calendarWeekdays}>
                                    {weekdayLabels[locale].map((dayLabel) => (
                                        <span key={dayLabel} className={styles.calendarWeekday}>
                                            {dayLabel}
                                        </span>
                                    ))}
                                </div>

                                <div className={styles.calendarGrid}>
                                    {calendarDays.map((day) => (
                                        <button
                                            key={formatIsoDate(day.date)}
                                            type="button"
                                            className={`${styles.calendarDay} ${
                                                day.isSelected ? styles.calendarDaySelected : ''
                                            } ${day.isToday ? styles.calendarDayToday : ''} ${
                                                day.isCurrentMonth ? '' : styles.calendarDayMuted
                                            }`}
                                            onClick={() => handleDateSelect(day.date)}
                                            disabled={day.isFuture}
                                            aria-pressed={day.isSelected}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>

                                <div className={styles.datePopoverFooter}>
                                    <span className={styles.datePopoverHint}>
                                        {selectedDate
                                            ? formatDisplayDate(selectedDate, locale)
                                            : copy.datePlaceholder}
                                    </span>

                                    {selectedDate ? (
                                        <button
                                            type="button"
                                            className={styles.clearDateButton}
                                            onClick={handleDateClear}
                                        >
                                            {copy.clearDate}
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                    </div>
                    {errors.dateOfBirth?.message ? (
                        <div className={styles.error}>{errors.dateOfBirth.message}</div>
                    ) : null}
                </div>

                <div className={styles.field}>
                    <label htmlFor="phone" className={styles.label}>Телефон</label>
                    <input
                        id="phone"
                        className={styles.input}
                        placeholder="Введите телефон"
                        autoComplete="tel"
                        {...register('phone')}
                    />
                    {errors.phone?.message ? (
                        <div className={styles.error}>{errors.phone.message}</div>
                    ) : null}
                </div>

                <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label htmlFor="email" className={styles.label}>Почта</label>
                    <input
                        id="email"
                        className={styles.input}
                        type="email"
                        placeholder="Введите почту"
                        autoComplete="email"
                        {...register('email')}
                    />
                    {errors.email?.message ? (
                        <div className={styles.error}>{errors.email.message}</div>
                    ) : null}
                </div>
            </div>

            {serverError ? <div className={styles.serverError}>{serverError}</div> : null}
            {successMessage ? <div className={styles.successMessage}>{successMessage}</div> : null}

            <div className={styles.actions}>
                <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </div>
        </form>
    );
};
