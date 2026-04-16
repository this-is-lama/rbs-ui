import type { KeyboardEvent, MouseEvent } from 'react';
import { Link, generatePath, useNavigate } from 'react-router-dom';
import type { BookingCartItem } from '@/entities/booking/model/types.ts';
import type {
    RestaurantCard as RestaurantCardType,
    RestaurantTable,
} from '@/entities/restaurant/model/types.ts';
import { RestaurantCard } from '@/entities/restaurant/ui/restaurant-card.tsx';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import styles from '../BookingPageWidget.module.scss';

type BookingOrderSectionProps = {
    restaurantId: string | null;
    restaurantName: string;
    restaurantCard: RestaurantCardType | null;
    isRestaurantLoading: boolean;
    restaurantLoadError: string;
    bookingItem: BookingCartItem | null;
    selectedTable: RestaurantTable | null;
    onRemoveTable: (id: string) => void;
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
});

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
});

const formatBookingDate = (value: string) => {
    return dateFormatter.format(new Date(`${value}T00:00:00`));
};

const formatBookingTimeRange = (startAt: string, endAt: string) => {
    return `${timeFormatter.format(new Date(startAt))} - ${timeFormatter.format(new Date(endAt))}`;
};

export const BookingOrderSection = ({
    restaurantId,
    restaurantName,
    restaurantCard,
    isRestaurantLoading,
    restaurantLoadError,
    bookingItem,
    selectedTable,
    onRemoveTable,
}: BookingOrderSectionProps) => {
    const navigate = useNavigate();

    const restaurantPath = restaurantId
        ? generatePath(RoutePaths.RESTAURANT, { id: restaurantId })
        : RoutePaths.RESTAURANTS;
    const selectedTableSubtitle = selectedTable
        ? [
            `Вместимость: ${selectedTable.capacity}`,
            selectedTable.description?.trim() || null,
        ].filter(Boolean).join(' • ')
        : '';

    const openScheme = () => {
        if (!restaurantId) {
            return;
        }

        navigate(`${restaurantPath}#restaurant-scheme`);
    };

    const handleTableCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openScheme();
        }
    };

    const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        if (!bookingItem) {
            return;
        }

        onRemoveTable(bookingItem.id);
    };

    return (
        <section className={styles.section}>
            <h2 className="section-title">Текущий заказ</h2>

            <div className={styles.orderGrid}>
                <div className={styles.orderColumn}>
                    {isRestaurantLoading ? (
                        <div className={`${styles.card} ${styles.stateCard}`}>
                            Загружаем карточку ресторана...
                        </div>
                    ) : restaurantCard ? (
                        <RestaurantCard restaurant={restaurantCard} />
                    ) : (
                        <Link to={restaurantPath} className={styles.fallbackRestaurantCardLink}>
                            <article className={`${styles.card} ${styles.fallbackRestaurantCard}`}>
                                <h3 className={styles.cardTitle}>{restaurantName || 'Ресторан'}</h3>
                                <div className={styles.subtleText}>
                                    Открыть страницу ресторана
                                </div>
                            </article>
                        </Link>
                    )}
                </div>

                <div className={styles.orderColumn}>
                    {bookingItem && selectedTable ? (
                        <article
                            className={`${styles.card} ${styles.selectedTableCard}`}
                            onClick={openScheme}
                            onKeyDown={handleTableCardKeyDown}
                            role="link"
                            tabIndex={0}
                            aria-label={`Открыть схему ресторана для стола №${bookingItem.tableNumber}`}
                        >
                            <button
                                type="button"
                                className={`${styles.iconDangerButton} ${styles.tableRemoveButton}`}
                                onClick={handleRemoveClick}
                                aria-label="Удалить стол из заказа"
                            >
                                X
                            </button>

                            <div className={styles.selectedTableContent}>
                                <div className={styles.selectedTableHead}>
                                    <h3 className={styles.selectedTableTitle}>Стол №{bookingItem.tableNumber}</h3>
                                    <p className={styles.selectedTableSubtitle}>{selectedTableSubtitle}</p>
                                </div>

                                <div className={styles.tableInfoList}>
                                    <div className={styles.tableInfoRow}>
                                        <span className={styles.tableInfoLabel}>Дата</span>
                                        <span className={styles.tableInfoValue}>
                                            {formatBookingDate(bookingItem.date)}
                                        </span>
                                    </div>

                                    <div className={styles.tableInfoRow}>
                                        <span className={styles.tableInfoLabel}>Время</span>
                                        <span className={styles.tableInfoValue}>
                                            {formatBookingTimeRange(bookingItem.startAt, bookingItem.endAt)}
                                        </span>
                                    </div>

                                    <div className={styles.tableInfoRow}>
                                        <span className={styles.tableInfoLabel}>Гостей</span>
                                        <span className={styles.tableInfoValue}>{bookingItem.guests}</span>
                                    </div>
                                </div>

                                <div className={styles.tableActionHint}>Нажмите, чтобы открыть схему зала</div>
                            </div>
                        </article>
                    ) : (
                        <article className={`${styles.card} ${styles.stateCard}`}>
                            <h3 className={styles.cardTitle}>Стол пока не выбран</h3>
                            <div className={styles.subtleText}>
                                Сначала выберите подходящий стол на странице ресторана.
                            </div>
                        </article>
                    )}
                </div>
            </div>

            {restaurantLoadError ? (
                <div className={`${styles.card} ${styles.stateCard}`}>{restaurantLoadError}</div>
            ) : null}
        </section>
    );
};
