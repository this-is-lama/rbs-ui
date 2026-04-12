import { useEffect, useMemo, useState } from 'react';
import type { RestaurantTable } from '@/entities/restaurant/model/types.ts';
import { getTableAvailability } from '@/entities/booking/api/get-table-availability.ts';
import type { TableAvailabilityResponse } from '@/entities/booking/model/types.ts';
import { bookingCartStorage } from '@/shared/lib/booking-cart/booking-cart.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import type { NormalizedRestaurant } from '../../model/types.ts';
import {
    addHours,
    buildLocalDate,
    createBookingCartItem,
    formatSlotInterval,
    formatTimeLabel,
    getTimeSlots,
    getTodayDateInputValue,
    getWorkingHoursForDate,
} from '../../lib/restaurant-details.ts';
import styles from '../restaurant-details-widget.module.scss';

type RestaurantBookingModalProps = {
    restaurant: NormalizedRestaurant;
    table: RestaurantTable;
    schemePhotoUrl: string | null;
    onClose: () => void;
    onAdded: () => void;
};

export const RestaurantBookingModal = ({
    restaurant,
    table,
    schemePhotoUrl,
    onClose,
    onAdded,
}: RestaurantBookingModalProps) => {
    const [selectedDate, setSelectedDate] = useState(getTodayDateInputValue());
    const [availability, setAvailability] = useState<TableAvailabilityResponse | null>(null);
    const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(true);
    const [availabilityError, setAvailabilityError] = useState('');
    const [selectedStartTime, setSelectedStartTime] = useState('');
    const [selectedEndTime, setSelectedEndTime] = useState('');
    const [guests, setGuests] = useState(Math.min(table.capacity, 2));
    const [comment, setComment] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    useEffect(() => {
        const loadAvailability = async () => {
            try {
                setIsAvailabilityLoading(true);
                setAvailabilityError('');
                setSuccessMessage('');
                setSelectedStartTime('');
                setSelectedEndTime('');

                const response = await getTableAvailability(restaurant.id, table.id, selectedDate);
                setAvailability(response);
            } catch (error) {
                setAvailability(null);
                setAvailabilityError(
                    getApiErrorMessage(error, 'Не удалось загрузить занятость стола на выбранную дату'),
                );
            } finally {
                setIsAvailabilityLoading(false);
            }
        };

        void loadAvailability();
    }, [restaurant.id, table.id, selectedDate]);

    const workingHoursItem = useMemo(() => {
        return getWorkingHoursForDate(restaurant.workingHours, selectedDate);
    }, [restaurant.workingHours, selectedDate]);

    const reservedSlots = useMemo(() => {
        return availability?.reservedSlots ?? [];
    }, [availability]);

    const scheduleButtons = useMemo(() => {
        return getTimeSlots(selectedDate, workingHoursItem, reservedSlots);
    }, [selectedDate, workingHoursItem, reservedSlots]);

    const selectedScheduleButton = useMemo(() => {
        return scheduleButtons.find((item) => item.time === selectedStartTime) ?? null;
    }, [scheduleButtons, selectedStartTime]);

    const endOptions = useMemo(() => {
        if (!selectedScheduleButton) {
            return [];
        }

        return Array.from({ length: selectedScheduleButton.maxDuration }, (_, index) => {
            const start = buildLocalDate(selectedDate, selectedScheduleButton.time);
            const end = addHours(start, index + 1);

            return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
        });
    }, [selectedDate, selectedScheduleButton]);

    useEffect(() => {
        if (!endOptions.includes(selectedEndTime)) {
            setSelectedEndTime(endOptions[0] ?? '');
        }
    }, [endOptions, selectedEndTime]);

    const canAddToCart = Boolean(
        selectedDate
        && selectedStartTime
        && selectedEndTime
        && guests > 0
        && guests <= table.capacity,
    );

    const handleAddToCart = () => {
        if (!canAddToCart) {
            return;
        }

        bookingCartStorage.addItem(
            createBookingCartItem(
                restaurant,
                table,
                schemePhotoUrl,
                selectedDate,
                selectedStartTime,
                selectedEndTime,
                guests,
                comment,
            ),
        );

        setSuccessMessage('Стол добавлен в корзину бронирований');
        onAdded();
    };

    const isClosed = Boolean(
        !workingHoursItem
        || workingHoursItem.closed
        || !workingHoursItem.openTime
        || !workingHoursItem.closeTime,
    );

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.modalCard}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={`Бронирование стола №${table.tableNumber}`}
            >
                <div className={styles.modalHeader}>
                    <div className={styles.modalHeaderText}>
                        <h3 className={styles.modalTitle}>Стол №{table.tableNumber}</h3>
                        <p className={styles.modalSubtitle}>
                            Вместимость: {table.capacity}
                            {table.description ? ` • ${table.description}` : ''}
                        </p>
                    </div>

                    <button
                        type="button"
                        className={styles.modalCloseButton}
                        onClick={onClose}
                        aria-label="Закрыть окно бронирования"
                    >
                        ×
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.fieldGrid}>
                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>Дата</span>
                            <input
                                type="date"
                                className={styles.fieldInput}
                                min={getTodayDateInputValue()}
                                value={selectedDate}
                                onChange={(event) => setSelectedDate(event.target.value)}
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>Гости</span>
                            <input
                                type="number"
                                className={styles.fieldInput}
                                min={1}
                                max={table.capacity}
                                value={guests}
                                onChange={(event) => setGuests(Number(event.target.value))}
                            />
                        </label>
                    </div>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Комментарий</span>
                        <textarea
                            className={styles.fieldTextarea}
                            rows={3}
                            maxLength={500}
                            placeholder="Например: нужен стол ближе к окну"
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                        />
                    </label>

                    <div className={styles.scheduleBlock}>
                        <div className={styles.scheduleHeader}>
                            <span className={styles.fieldLabel}>{'\u0420\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0434\u043d\u044f'}</span>
                            {!isClosed && workingHoursItem?.openTime && workingHoursItem?.closeTime ? (
                                <span className={styles.scheduleMeta}>
                                    Часы работы: {formatTimeLabel(workingHoursItem.openTime)} — {formatTimeLabel(workingHoursItem.closeTime)}
                                </span>
                            ) : null}
                        </div>

                        {isAvailabilityLoading ? (
                            <div className={styles.infoMessage}>Загружаем занятость стола...</div>
                        ) : availabilityError ? (
                            <div className={styles.errorMessage}>{availabilityError}</div>
                        ) : isClosed ? (
                            <div className={styles.infoMessage}>В выбранный день ресторан закрыт</div>
                        ) : scheduleButtons.length === 0 ? (
                            <div className={styles.infoMessage}>Нет доступных часовых интервалов</div>
                        ) : (
                            <>
                                <div className={styles.scheduleGrid}>
                                    {scheduleButtons.map((slot) => {
                                        const isSelected = selectedStartTime === slot.time;

                                        return (
                                            <button
                                                key={slot.time}
                                                type="button"
                                                className={[
                                                    styles.scheduleButton,
                                                    slot.isReserved || slot.isPast ? styles.scheduleButtonDisabled : '',
                                                    isSelected ? styles.scheduleButtonSelected : '',
                                                ].join(' ').trim()}
                                                disabled={slot.isReserved || slot.isPast}
                                                onClick={() => {
                                                    setSelectedStartTime(slot.time);
                                                    setSuccessMessage('');
                                                }}
                                            >
                                                {slot.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {reservedSlots.length > 0 ? (
                                    <div className={styles.busyBlock}>
                                        <span className={styles.busyTitle}>Уже занято:</span>
                                        <ul className={styles.busyList}>
                                            {reservedSlots.map((slot) => (
                                                <li key={`${slot.startAt}-${slot.endAt}`} className={styles.busyItem}>
                                                    {formatSlotInterval(slot)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                            </>
                        )}
                    </div>

                    <div className={styles.fieldGrid}>
                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>С</span>
                            <input
                                type="text"
                                className={styles.fieldInput}
                                value={selectedStartTime ? formatTimeLabel(selectedStartTime) : 'Не выбрано'}
                                readOnly
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>До</span>
                            <select
                                className={styles.fieldInput}
                                value={selectedEndTime}
                                onChange={(event) => setSelectedEndTime(event.target.value)}
                                disabled={!selectedStartTime || endOptions.length === 0}
                            >
                                {endOptions.length === 0 ? (
                                    <option value="">Сначала выбери старт</option>
                                ) : (
                                    endOptions.map((value) => (
                                        <option key={value} value={value}>
                                            {formatTimeLabel(value)}
                                        </option>
                                    ))
                                )}
                            </select>
                        </label>
                    </div>

                    {successMessage ? (
                        <div className={styles.successMessage}>{successMessage}</div>
                    ) : null}

                    {guests > table.capacity ? (
                        <div className={styles.errorMessage}>
                            Количество гостей не может быть больше вместимости стола
                        </div>
                    ) : null}
                </div>

                <div className={styles.modalActions}>
                    <button
                        type="button"
                        className={styles.modalSecondaryButton}
                        onClick={onClose}
                    >
                        Закрыть
                    </button>

                    <button
                        type="button"
                        className={styles.modalPrimaryButton}
                        onClick={handleAddToCart}
                        disabled={!canAddToCart}
                    >
                        Забронировать
                    </button>
                </div>
            </div>
        </div>
    );
};
