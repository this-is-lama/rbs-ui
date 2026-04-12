import type { Booking } from '@/entities/booking/model/types.ts';
import type { RestaurantCard } from '@/entities/restaurant/model/types.ts';
import { Input } from '@/shared/ui/input/input.tsx';
import { useCreateBookingForm } from '../model/use-create-booking-form.ts';
import styles from './CreateBookingForm.module.scss';

type CreateBookingFormProps = {
    restaurants: RestaurantCard[];
    initialRestaurantId?: string;
    initialTableId?: string;
    onCreated?: (booking: Booking) => void;
};

export const CreateBookingForm = ({
    restaurants,
    initialRestaurantId,
    initialTableId,
    onCreated,
}: CreateBookingFormProps) => {
    const {
        register,
        formState: { errors, isSubmitting },
        onSubmit,
        serverError,
        successMessage,
        isRestaurantLoading,
        restaurantOptions,
        selectedRestaurant,
        availableTables,
    } = useCreateBookingForm({
        restaurants,
        initialRestaurantId,
        initialTableId,
        onCreated,
    });

    return (
        <form onSubmit={onSubmit} className={`surface-block ${styles.form}`}>
            <div className={styles.intro}>
                <h2 className="section-title">Создать бронирование</h2>
                <div className={styles.mutedText}>
                    Выбери ресторан, стол и временной интервал. Бронирование должно быть минимум на 1 час.
                </div>
            </div>

            <div className={styles.field}>
                <label htmlFor="restaurantId">{'\u0420\u0435\u0441\u0442\u043e\u0440\u0430\u043d'}</label>
                <select id="restaurantId" className="base-input" {...register('restaurantId')}>
                    <option value="">Выберите ресторан</option>
                    {restaurantOptions.map((restaurant) => (
                        <option key={restaurant.value} value={restaurant.value}>
                            {restaurant.label}
                        </option>
                    ))}
                </select>
                {errors.restaurantId?.message ? <div>{errors.restaurantId.message}</div> : null}
            </div>

            {isRestaurantLoading ? <div>Загрузка столов ресторана...</div> : null}

            <div className={styles.field}>
                <label htmlFor="tableId">Стол</label>
                <select
                    id="tableId"
                    className="base-input"
                    {...register('tableId')}
                    disabled={!selectedRestaurant || isRestaurantLoading}
                >
                    <option value="">Выберите стол</option>
                    {availableTables.map((table) => (
                        <option key={table.id} value={table.id}>
                            Стол №{table.tableNumber} · мест: {table.capacity}
                        </option>
                    ))}
                </select>
                {errors.tableId?.message ? <div>{errors.tableId.message}</div> : null}
            </div>

            {!isRestaurantLoading && selectedRestaurant && availableTables.length === 0 ? (
                <div>В этом ресторане нет активных столов для выбора</div>
            ) : null}

            <div className={styles.fieldGrid}>
                <Input
                    label="Начало"
                    type="datetime-local"
                    error={errors.startAt?.message}
                    {...register('startAt')}
                />

                <Input
                    label="Окончание"
                    type="datetime-local"
                    error={errors.endAt?.message}
                    {...register('endAt')}
                />
            </div>

            <Input
                label="Количество гостей"
                type="number"
                min={1}
                max={50}
                error={errors.guests?.message}
                {...register('guests', { valueAsNumber: true })}
            />

            <div className={styles.field}>
                <label htmlFor="comment">Комментарий</label>
                <textarea
                    id="comment"
                    className={`base-input ${styles.textarea}`}
                    placeholder="Например: нужен стол у окна"
                    {...register('comment')}
                />
                {errors.comment?.message ? <div>{errors.comment.message}</div> : null}
            </div>

            {serverError ? <div>{serverError}</div> : null}
            {successMessage ? <div className={styles.successMessage}>{successMessage}</div> : null}

            <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Создание бронирования...' : 'Создать бронирование'}
            </button>
        </form>
    );
};
