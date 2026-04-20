import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import type { RestaurantTable, WorkingHours } from '@/entities/restaurant/model/types.ts';
import { getTableAvailability } from '@/entities/booking/api/get-table-availability.ts';
import type { TableAvailabilityResponse } from '@/entities/booking/model/types.ts';
import { resolveIntlLocale } from '@/shared/config/language.ts';
import { bookingCartStorage } from '@/shared/lib/booking-cart/booking-cart.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import type { NormalizedRestaurant } from '../../model/types.ts';
import {
    addHours,
    buildLocalDate,
    createBookingCartItem,
    formatTimeLabel,
    getTimeSlots,
    getTodayDateInputValue,
    getWorkingHoursForDate,
} from '../../lib/restaurant-details.ts';
import styles from '../restaurant-details-widget/restaurant-details-widget.module.scss';

type RestaurantBookingModalProps = {
    restaurant: NormalizedRestaurant;
    table: RestaurantTable;
    schemePhotoUrl: string | null;
    onClose: () => void;
    onAdded: () => void;
    onRequestAddToOrder: (onAccept: () => void) => void;
};

type CalendarCell = {
    key: string;
    dateValue: string | null;
    dayNumber: number | null;
    isDisabled: boolean;
    isSelected: boolean;
    isToday: boolean;
};

const capitalize = (value: string) => {
    if (!value) {
        return value;
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
};

const parseDateValue = (dateValue: string) => new Date(`${dateValue}T00:00:00`);

const formatDateValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const shiftMonth = (date: Date, amount: number) => {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1);
};

const isSameMonth = (left: Date, right: Date) => {
    return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
};

const hasBookableWorkingHours = (workingHoursItem: WorkingHours | null) => {
    return Boolean(
        workingHoursItem
        && !workingHoursItem.closed
        && workingHoursItem.openTime
        && workingHoursItem.closeTime,
    );
};

const isDateBookable = (
    workingHours: WorkingHours[],
    dateValue: string,
    minDateValue: string,
) => {
    if (dateValue < minDateValue) {
        return false;
    }

    return hasBookableWorkingHours(getWorkingHoursForDate(workingHours, dateValue));
};

const findFirstBookableDate = (
    workingHours: WorkingHours[],
    minDateValue: string,
) => {
    const startDate = parseDateValue(minDateValue);

    for (let dayOffset = 0; dayOffset < 366; dayOffset += 1) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayOffset);

        const dateValue = formatDateValue(currentDate);

        if (isDateBookable(workingHours, dateValue, minDateValue)) {
            return dateValue;
        }
    }

    return minDateValue;
};

const buildCalendarCells = ({
    visibleMonth,
    selectedDate,
    workingHours,
    minDateValue,
}: {
    visibleMonth: Date;
    selectedDate: string;
    workingHours: WorkingHours[];
    minDateValue: string;
}): CalendarCell[] => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingEmptyCells = (firstDay.getDay() + 6) % 7;
    const cells: CalendarCell[] = [];
    const todayDateValue = getTodayDateInputValue();

    for (let index = 0; index < leadingEmptyCells; index += 1) {
        cells.push({
            key: `empty-start-${index}`,
            dateValue: null,
            dayNumber: null,
            isDisabled: true,
            isSelected: false,
            isToday: false,
        });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        const dateValue = formatDateValue(date);

        cells.push({
            key: dateValue,
            dateValue,
            dayNumber: day,
            isDisabled: !isDateBookable(workingHours, dateValue, minDateValue),
            isSelected: dateValue === selectedDate,
            isToday: dateValue === todayDateValue,
        });
    }

    const trailingEmptyCells = (7 - (cells.length % 7 || 7)) % 7;

    for (let index = 0; index < trailingEmptyCells; index += 1) {
        cells.push({
            key: `empty-end-${index}`,
            dateValue: null,
            dayNumber: null,
            isDisabled: true,
            isSelected: false,
            isToday: false,
        });
    }

    return cells;
};

const getSlotEndTimeValue = (dateValue: string, timeValue: string) => {
    const next = addHours(buildLocalDate(dateValue, timeValue), 1);

    return `${String(next.getHours()).padStart(2, '0')}:${String(next.getMinutes()).padStart(2, '0')}`;
};

const formatTimeInterval = (startTime: string, endTime: string) => {
    return `${formatTimeLabel(startTime)} - ${formatTimeLabel(endTime)}`;
};

export const RestaurantBookingModal = ({
    restaurant,
    table,
    schemePhotoUrl,
    onClose,
    onAdded,
    onRequestAddToOrder,
}: RestaurantBookingModalProps) => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const todayDateValue = useMemo(() => getTodayDateInputValue(), []);
    const locale = resolveIntlLocale(language);
    const monthTitleFormatter = useMemo(() => {
        return new Intl.DateTimeFormat(locale, { month: 'long' });
    }, [locale]);
    const selectedDateFormatter = useMemo(() => {
        return new Intl.DateTimeFormat(locale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    }, [locale]);
    const copy = language === 'en'
        ? {
            addToBooking: 'Add to booking',
            availabilityLoadError: 'Failed to load table availability for the selected date',
            availableTime: 'Available time',
            bookingAria: `Booking for table #${table.tableNumber}`,
            calendar: 'Calendar',
            capacity: `Capacity: ${table.capacity}`,
            chooseDate: (dayNumber: number) => `Choose date ${dayNumber}`,
            chooseTime: 'Select booking time',
            close: 'Close',
            closeAria: 'Close booking dialog',
            closedDay: 'This restaurant does not accept bookings on the selected day.',
            emptySlots: 'There are no available time slots for this day.',
            guestLimitError: 'Guest count cannot exceed the table capacity',
            guests: 'Guests',
            loadingAvailability: 'Loading table availability...',
            nextMonth: 'Next month',
            plannerCalendarFootnote: 'Unavailable booking days are shown in gray.',
            plannerTimeFootnote: 'One click selects one hour. The second click extends the booking to the end of the chosen range.',
            previousMonth: 'Previous month',
            selectedRange: 'Selected range',
            success: 'The table was added to your booking cart',
            tableTitle: `Table #${table.tableNumber}`,
            viewBooking: 'Go to booking',
        }
        : {
            addToBooking: 'Добавить в бронирование',
            availabilityLoadError: 'Не удалось загрузить занятость стола на выбранную дату',
            availableTime: 'Доступное время',
            bookingAria: `Бронирование стола №${table.tableNumber}`,
            calendar: 'Календарь',
            capacity: `Вместимость: ${table.capacity}`,
            chooseDate: (dayNumber: number) => `Выбрать дату ${dayNumber}`,
            chooseTime: 'Выберите время бронирования',
            close: 'Закрыть',
            closeAria: 'Закрыть окно бронирования',
            closedDay: 'В выбранный день ресторан не принимает бронирования.',
            emptySlots: 'На этот день нет доступных интервалов.',
            guestLimitError: 'Количество гостей не может быть больше вместимости стола',
            guests: 'Гости',
            loadingAvailability: 'Загружаем занятость стола...',
            nextMonth: 'Следующий месяц',
            plannerCalendarFootnote: 'Серым отмечены недоступные для бронирования дни.',
            plannerTimeFootnote: 'Один клик выбирает один час. Второй клик расширяет бронь до конца диапазона.',
            previousMonth: 'Предыдущий месяц',
            selectedRange: 'Выбранный интервал',
            success: 'Стол добавлен в корзину бронирования',
            tableTitle: `Стол №${table.tableNumber}`,
            viewBooking: 'Перейти к бронированию',
        };
    const firstBookableDate = useMemo(() => {
        return findFirstBookableDate(restaurant.workingHours, todayDateValue);
    }, [restaurant.workingHours, todayDateValue]);

    const [selectedDate, setSelectedDate] = useState(firstBookableDate);
    const [visibleMonth, setVisibleMonth] = useState(() => {
        return getMonthStart(parseDateValue(firstBookableDate));
    });
    const [availability, setAvailability] = useState<TableAvailabilityResponse | null>(null);
    const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(true);
    const [availabilityError, setAvailabilityError] = useState('');
    const [selectedStartTime, setSelectedStartTime] = useState('');
    const [selectedEndTime, setSelectedEndTime] = useState('');
    const [selectionAnchorTime, setSelectionAnchorTime] = useState<string | null>(null);
    const [isAwaitingRangeEnd, setIsAwaitingRangeEnd] = useState(false);
    const [guests, setGuests] = useState(Math.min(table.capacity, 2));
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    useEffect(() => {
        if (isDateBookable(restaurant.workingHours, selectedDate, todayDateValue)) {
            return;
        }

        setSelectedDate(firstBookableDate);
        setVisibleMonth(getMonthStart(parseDateValue(firstBookableDate)));
    }, [firstBookableDate, restaurant.workingHours, selectedDate, todayDateValue]);

    useEffect(() => {
        const loadAvailability = async () => {
            try {
                setIsAvailabilityLoading(true);
                setAvailabilityError('');
                setSuccessMessage('');
                setSelectedStartTime('');
                setSelectedEndTime('');
                setSelectionAnchorTime(null);
                setIsAwaitingRangeEnd(false);

                const response = await getTableAvailability(restaurant.id, table.id, selectedDate);
                setAvailability(response);
            } catch (error) {
                setAvailability(null);
                setAvailabilityError(
                    getApiErrorMessage(error, copy.availabilityLoadError),
                );
            } finally {
                setIsAvailabilityLoading(false);
            }
        };

        void loadAvailability();
    }, [copy.availabilityLoadError, restaurant.id, selectedDate, table.id]);

    const workingHoursItem = useMemo(() => {
        return getWorkingHoursForDate(restaurant.workingHours, selectedDate);
    }, [restaurant.workingHours, selectedDate]);

    const reservedSlots = useMemo(() => {
        return availability?.reservedSlots ?? [];
    }, [availability]);

    const scheduleButtons = useMemo(() => {
        return getTimeSlots(selectedDate, workingHoursItem, reservedSlots);
    }, [reservedSlots, selectedDate, workingHoursItem]);

    const calendarCells = useMemo(() => {
        return buildCalendarCells({
            visibleMonth,
            selectedDate,
            workingHours: restaurant.workingHours,
            minDateValue: todayDateValue,
        });
    }, [restaurant.workingHours, selectedDate, todayDateValue, visibleMonth]);

    const selectedRange = useMemo(() => {
        if (!selectedStartTime || !selectedEndTime) {
            return null;
        }

        return {
            start: buildLocalDate(selectedDate, selectedStartTime),
            end: buildLocalDate(selectedDate, selectedEndTime),
        };
    }, [selectedDate, selectedEndTime, selectedStartTime]);

    const selectedDateLabel = useMemo(() => {
        return capitalize(selectedDateFormatter.format(parseDateValue(selectedDate)));
    }, [selectedDate, selectedDateFormatter]);

    const visibleMonthTitle = useMemo(() => {
        return capitalize(monthTitleFormatter.format(visibleMonth));
    }, [monthTitleFormatter, visibleMonth]);

    const selectedIntervalLabel = useMemo(() => {
        if (!selectedStartTime || !selectedEndTime) {
            return copy.chooseTime;
        }

        return formatTimeInterval(selectedStartTime, selectedEndTime);
    }, [copy.chooseTime, selectedEndTime, selectedStartTime]);

    const canGoToPreviousMonth = useMemo(() => {
        return !isSameMonth(visibleMonth, getMonthStart(parseDateValue(todayDateValue)));
    }, [todayDateValue, visibleMonth]);

    const canAddToCart = Boolean(
        selectedDate
        && selectedStartTime
        && selectedEndTime
        && guests > 0
        && guests <= table.capacity,
    );

    const isClosed = !hasBookableWorkingHours(workingHoursItem);

    const selectSingleHour = (timeValue: string) => {
        setSelectionAnchorTime(timeValue);
        setIsAwaitingRangeEnd(true);
        setSelectedStartTime(timeValue);
        setSelectedEndTime(getSlotEndTimeValue(selectedDate, timeValue));
    };

    const handleTimeSlotClick = (timeValue: string) => {
        const clickedIndex = scheduleButtons.findIndex((slot) => slot.time === timeValue);

        if (clickedIndex === -1) {
            return;
        }

        const clickedSlot = scheduleButtons[clickedIndex];

        if (clickedSlot.isReserved || clickedSlot.isPast) {
            return;
        }

        setSuccessMessage('');

        if (!selectionAnchorTime || !isAwaitingRangeEnd) {
            selectSingleHour(timeValue);
            return;
        }

        const anchorIndex = scheduleButtons.findIndex((slot) => slot.time === selectionAnchorTime);

        if (anchorIndex === -1) {
            selectSingleHour(timeValue);
            return;
        }

        const rangeStartIndex = Math.min(anchorIndex, clickedIndex);
        const rangeEndIndex = Math.max(anchorIndex, clickedIndex);
        const rangeIsAvailable = scheduleButtons
            .slice(rangeStartIndex, rangeEndIndex + 1)
            .every((slot) => !slot.isReserved && !slot.isPast);

        if (!rangeIsAvailable) {
            selectSingleHour(timeValue);
            return;
        }

        const startSlot = scheduleButtons[rangeStartIndex];
        const endSlot = scheduleButtons[rangeEndIndex];

        setSelectedStartTime(startSlot.time);
        setSelectedEndTime(getSlotEndTimeValue(selectedDate, endSlot.time));
        setSelectionAnchorTime(startSlot.time);
        setIsAwaitingRangeEnd(false);
    };

    const handleAddToCart = () => {
        if (!canAddToCart) {
            return;
        }

        onRequestAddToOrder(() => {
            bookingCartStorage.addItem(
                createBookingCartItem(
                    restaurant,
                    table,
                    schemePhotoUrl,
                    selectedDate,
                    selectedStartTime,
                    selectedEndTime,
                    guests,
                    '',
                ),
            );

            setSuccessMessage(copy.success);
            onAdded();
        });
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.modalCard}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={copy.bookingAria}
            >
                <div className={styles.modalHeader}>
                    <div className={styles.modalHeaderText}>
                        <h3 className={styles.modalTitle}>{copy.tableTitle}</h3>
                        <p className={styles.modalSubtitle}>
                            {copy.capacity}
                            {table.description ? ` • ${table.description}` : ''}
                        </p>
                    </div>

                    <button
                        type="button"
                        className={styles.modalCloseButton}
                        onClick={onClose}
                        aria-label={copy.closeAria}
                    >
                        X
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {successMessage ? (
                        <div className={styles.modalSuccessState}>
                            <div className={styles.modalSuccessBanner}>
                                <h4 className={styles.modalSuccessTitle}>{successMessage}</h4>
                            </div>

                            <button
                                type="button"
                                className={styles.modalPrimaryButton}
                                onClick={() => navigate(RoutePaths.BOOKING)}
                            >
                                {copy.viewBooking}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className={styles.bookingPlannerBoard}>
                                <div className={styles.bookingPlannerGrid}>
                                    <section className={styles.plannerPanel}>
                                        <div className={styles.plannerPanelHeader}>
                                            <h4 className={styles.plannerPanelTitle}>{copy.calendar}</h4>
                                            <p className={styles.plannerPanelMeta}>{selectedDateLabel}</p>
                                        </div>

                                        <div className={styles.calendarToolbar}>
                                            <button
                                                type="button"
                                                className={styles.calendarNavButton}
                                                onClick={() => setVisibleMonth((current) => shiftMonth(current, -1))}
                                                disabled={!canGoToPreviousMonth}
                                                aria-label={copy.previousMonth}
                                            >
                                                {'<'}
                                            </button>

                                            <div className={styles.calendarMonthLabel}>{visibleMonthTitle}</div>

                                            <button
                                                type="button"
                                                className={styles.calendarNavButton}
                                                onClick={() => setVisibleMonth((current) => shiftMonth(current, 1))}
                                                aria-label={copy.nextMonth}
                                            >
                                                {'>'}
                                            </button>
                                        </div>

                                        <div className={styles.calendarGrid}>
                                            {calendarCells.map((cell) => {
                                                if (!cell.dateValue || !cell.dayNumber) {
                                                    return (
                                                        <div
                                                            key={cell.key}
                                                            className={styles.calendarDayPlaceholder}
                                                            aria-hidden="true"
                                                        />
                                                    );
                                                }

                                                return (
                                                    <button
                                                        key={cell.key}
                                                        type="button"
                                                        className={[
                                                            styles.calendarDayButton,
                                                            cell.isDisabled ? styles.calendarDayButtonDisabled : '',
                                                            cell.isSelected ? styles.calendarDayButtonSelected : '',
                                                            cell.isToday ? styles.calendarDayButtonToday : '',
                                                        ].join(' ').trim()}
                                                        disabled={cell.isDisabled}
                                                        onClick={() => {
                                                            setSelectedDate(cell.dateValue ?? selectedDate);
                                                            setVisibleMonth(getMonthStart(parseDateValue(cell.dateValue ?? selectedDate)));
                                                            setSuccessMessage('');
                                                        }}
                                                        aria-label={copy.chooseDate(cell.dayNumber)}
                                                    >
                                                        {cell.dayNumber}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <p className={styles.plannerFootnote}>
                                            {copy.plannerCalendarFootnote}
                                        </p>
                                    </section>

                                    <section className={styles.plannerPanel}>
                                        <div className={styles.plannerPanelHeader}>
                                            <h4 className={styles.plannerPanelTitle}>{copy.availableTime}</h4>
                                            <p className={styles.plannerPanelMeta}>{selectedIntervalLabel}</p>
                                        </div>

                                        {isAvailabilityLoading ? (
                                            <div className={styles.plannerMessage}>
                                                {copy.loadingAvailability}
                                            </div>
                                        ) : availabilityError ? (
                                            <div className={styles.plannerMessage}>
                                                {availabilityError}
                                            </div>
                                        ) : isClosed ? (
                                            <div className={styles.plannerMessage}>
                                                {copy.closedDay}
                                            </div>
                                        ) : scheduleButtons.length === 0 ? (
                                            <div className={styles.plannerMessage}>
                                                {copy.emptySlots}
                                            </div>
                                        ) : (
                                            <div className={styles.timeSlotList}>
                                                {scheduleButtons.map((slot) => {
                                                    const slotStart = buildLocalDate(selectedDate, slot.time);
                                                    const slotEnd = addHours(slotStart, 1);
                                                    const isSelected = Boolean(
                                                        selectedRange
                                                        && slotStart >= selectedRange.start
                                                        && slotEnd <= selectedRange.end,
                                                    );
                                                    const slotEndTimeValue = getSlotEndTimeValue(selectedDate, slot.time);

                                                    return (
                                                        <button
                                                            key={slot.time}
                                                            type="button"
                                                            className={[
                                                                styles.timeSlotButton,
                                                                slot.isReserved || slot.isPast ? styles.timeSlotButtonDisabled : '',
                                                                isSelected ? styles.timeSlotButtonSelected : '',
                                                            ].join(' ').trim()}
                                                            disabled={slot.isReserved || slot.isPast}
                                                            onClick={() => handleTimeSlotClick(slot.time)}
                                                            aria-label={`Выбрать интервал ${formatTimeInterval(slot.time, slotEndTimeValue)}`}
                                                        >
                                                            {formatTimeInterval(slot.time, slotEndTimeValue)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <p className={styles.plannerFootnote}>
                                            {copy.plannerTimeFootnote}
                                        </p>
                                    </section>
                                </div>
                            </div>

                            <div className={styles.fieldGrid}>
                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>{copy.guests}</span>
                                    <input
                                        type="number"
                                        className={styles.fieldInput}
                                        min={1}
                                        max={table.capacity}
                                        value={guests}
                                        onChange={(event) => setGuests(Number(event.target.value))}
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>{copy.selectedRange}</span>
                                    <input
                                        type="text"
                                        className={styles.fieldInput}
                                        value={selectedIntervalLabel}
                                        readOnly
                                    />
                                </label>
                            </div>

                            {guests > table.capacity ? (
                                <div className={styles.errorMessage}>
                                    {copy.guestLimitError}
                                </div>
                            ) : null}
                        </>
                    )}
                </div>

                {!successMessage ? (
                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            className={styles.modalSecondaryButton}
                            onClick={onClose}
                        >
                            {copy.close}
                        </button>

                        <button
                            type="button"
                            className={styles.modalPrimaryButton}
                            onClick={handleAddToCart}
                            disabled={!canAddToCart}
                        >
                            {copy.addToBooking}
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

