import { Link, generatePath } from 'react-router-dom';
import type { BookingCartItem } from '@/entities/booking/model/types.ts';
import { formatBookingDateTime } from '@/shared/lib/date/booking-date.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import styles from '../BookingPageWidget.module.scss';

type BookingOrderSectionProps = {
    bookingItems: BookingCartItem[];
    onClear: () => void;
    onRemove: (id: string) => void;
};

export const BookingOrderSection = ({
    bookingItems,
    onClear,
    onRemove,
}: BookingOrderSectionProps) => {
    return (
        <section className={styles.section}>
            <div className={styles.headerRow}>
                <h2 className="section-title">Текущий заказ</h2>

                {bookingItems.length > 0 ? (
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.dangerButton}
                            onClick={onClear}
                        >
                            Очистить столы
                        </button>
                    </div>
                ) : null}
            </div>

            {bookingItems.length > 0 ? (
                <div className={styles.bookingList}>
                    {bookingItems.map((item) => {
                        const restaurantPath = generatePath(RoutePaths.RESTAURANT, { id: item.restaurantId });

                        return (
                            <article key={item.id} className={`${styles.card} ${styles.bookingItemCard}`}>
                                <div className={styles.headerRow}>
                                    <div className={styles.bookingTitleBlock}>
                                        <h3 className={styles.bookingTitle}>{item.restaurantName}</h3>
                                        <div className={styles.subtleText}>Стол №{item.tableNumber}</div>
                                    </div>

                                    <div className={styles.actions}>
                                        <Link
                                            to={restaurantPath}
                                            className={`${styles.secondaryButton} ${styles.linkButton}`}
                                        >
                                            Открыть ресторан
                                        </Link>

                                        <button
                                            type="button"
                                            className={styles.dangerButton}
                                            onClick={() => onRemove(item.id)}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.bookingMetaGrid}>
                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Дата</span>
                                        <span className={styles.metaValue}>{item.date}</span>
                                    </div>

                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Начало</span>
                                        <span className={styles.metaValue}>{formatBookingDateTime(item.startAt)}</span>
                                    </div>

                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Окончание</span>
                                        <span className={styles.metaValue}>{formatBookingDateTime(item.endAt)}</span>
                                    </div>

                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Гостей</span>
                                        <span className={styles.metaValue}>{item.guests}</span>
                                    </div>

                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Комментарий</span>
                                        <span className={styles.metaValue}>{item.comment || 'Не указан'}</span>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className={`${styles.card} ${styles.emptyCard}`}>
                    Выбранных столов пока нет
                </div>
            )}
        </section>
    );
};
