import { Link, generatePath } from 'react-router-dom';
import type { BookingCartItem } from '@/entities/booking/model/types.ts';
import type {
    RestaurantCard as RestaurantCardType,
    RestaurantTable,
} from '@/entities/restaurant/model/types.ts';
import { RestaurantCard } from '@/entities/restaurant/ui/restaurant-card.tsx';
import { TableCard } from '@/entities/restaurant/ui/table-card.tsx';
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
    const restaurantPath = restaurantId
        ? generatePath(RoutePaths.RESTAURANT, { id: restaurantId })
        : RoutePaths.RESTAURANTS;

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
                        <div className={styles.tableCardWrap}>
                            <div className={styles.tableCardLabel}>Выбранный стол</div>

                            <TableCard
                                table={selectedTable}
                                actions={(
                                    <button
                                        type="button"
                                        className={styles.iconDangerButton}
                                        onClick={() => onRemoveTable(bookingItem.id)}
                                        aria-label="Удалить стол из заказа"
                                    >
                                        X
                                    </button>
                                )}
                            />
                        </div>
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
