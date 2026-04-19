import { Link, generatePath, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import type { BookingCartItem } from '@/entities/booking/model/types.ts';
import type {
    RestaurantCard as RestaurantCardType,
    RestaurantTable,
} from '@/entities/restaurant/model/types.ts';
import { RestaurantCard } from '@/entities/restaurant/ui';
import { resolveIntlLocale } from '@/shared/config/language.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import layoutStyles from '@/shared/ui/booking-order-layout/booking-order-layout.module.scss';
import { BookingTableCard } from '@/shared/ui/booking-table-card';
import styles from '../booking-page-widget/booking-page-widget.module.scss';

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
    const navigate = useNavigate();
    const { language } = useLanguage();
    const locale = resolveIntlLocale(language);
    const dateFormatter = new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
    });
    const timeFormatter = new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
    });
    const copy = language === 'en'
        ? {
            currentOrder: 'Current order',
            date: 'Date',
            fallbackRestaurant: 'Restaurant',
            guests: 'Guests',
            loadingRestaurant: 'Loading restaurant card...',
            openRestaurant: 'Open restaurant page',
            openScheme: (tableNumber: number) => `Open restaurant floor plan for table #${tableNumber}`,
            removeTable: 'Remove table from the order',
            subtitle: (capacity: number) => `Capacity: ${capacity}`,
            table: (tableNumber: number) => `Table #${tableNumber}`,
            tableHint: 'Click to open the floor plan',
            tableMissingDescription: 'Pick a suitable table on the restaurant page first.',
            tableMissingTitle: 'Table has not been selected yet',
            time: 'Time',
        }
        : {
            currentOrder: 'Текущий заказ',
            date: 'Дата',
            fallbackRestaurant: 'Ресторан',
            guests: 'Гостей',
            loadingRestaurant: 'Загружаем карточку ресторана...',
            openRestaurant: 'Открыть страницу ресторана',
            openScheme: (tableNumber: number) => `Открыть схему ресторана для стола №${tableNumber}`,
            removeTable: 'Удалить стол из заказа',
            subtitle: (capacity: number) => `Вместимость: ${capacity}`,
            table: (tableNumber: number) => `Стол №${tableNumber}`,
            tableHint: 'Нажмите, чтобы открыть схему зала',
            tableMissingDescription: 'Сначала выберите подходящий стол на странице ресторана.',
            tableMissingTitle: 'Стол пока не выбран',
            time: 'Время',
        };
    const formatBookingDate = (value: string) => {
        return dateFormatter.format(new Date(`${value}T00:00:00`));
    };
    const formatBookingTimeRange = (startAt: string, endAt: string) => {
        return `${timeFormatter.format(new Date(startAt))} - ${timeFormatter.format(new Date(endAt))}`;
    };

    const restaurantPath = restaurantId
        ? generatePath(RoutePaths.RESTAURANT, { id: restaurantId })
        : RoutePaths.RESTAURANTS;
    const selectedTableSubtitle = selectedTable
        ? [
            copy.subtitle(selectedTable.capacity),
            selectedTable.description?.trim() || null,
        ].filter(Boolean).join(' • ')
        : '';

    const openScheme = () => {
        if (!restaurantId) {
            return;
        }

        navigate(`${restaurantPath}#restaurant-scheme`);
    };
    const tableRows = bookingItem ? [
        {
            label: copy.date,
            value: formatBookingDate(bookingItem.date),
        },
        {
            label: copy.time,
            value: formatBookingTimeRange(bookingItem.startAt, bookingItem.endAt),
        },
        {
            label: copy.guests,
            value: bookingItem.guests,
        },
    ] : [];

    return (
        <section className={styles.section}>
            <h2 className="section-title">{copy.currentOrder}</h2>

            <div className={layoutStyles.orderGrid}>
                <div className={layoutStyles.orderColumn}>
                    {isRestaurantLoading ? (
                        <div className={`${layoutStyles.card} ${layoutStyles.stateCard}`}>
                            {copy.loadingRestaurant}
                        </div>
                    ) : restaurantCard ? (
                        <RestaurantCard restaurant={restaurantCard} />
                    ) : (
                        <Link to={restaurantPath} className={styles.fallbackRestaurantCardLink}>
                            <article className={`${layoutStyles.card} ${styles.fallbackRestaurantCard}`}>
                                <h3 className={styles.cardTitle}>{restaurantName || copy.fallbackRestaurant}</h3>
                                <div className={styles.subtleText}>
                                    {copy.openRestaurant}
                                </div>
                            </article>
                        </Link>
                    )}
                </div>

                <div className={layoutStyles.orderColumn}>
                    {bookingItem && selectedTable ? (
                        <BookingTableCard
                            ariaLabel={copy.openScheme(bookingItem.tableNumber)}
                            hint={copy.tableHint}
                            rows={tableRows}
                            title={copy.table(bookingItem.tableNumber)}
                            subtitle={selectedTableSubtitle}
                            onOpen={openScheme}
                            onRemove={() => onRemoveTable(bookingItem.id)}
                            removeLabel={copy.removeTable}
                        />
                    ) : (
                        <article className={`${layoutStyles.card} ${layoutStyles.stateCard}`}>
                            <h3 className={styles.cardTitle}>{copy.tableMissingTitle}</h3>
                            <div className={styles.subtleText}>
                                {copy.tableMissingDescription}
                            </div>
                        </article>
                    )}
                </div>
            </div>

            {restaurantLoadError ? (
                <div className={`${layoutStyles.card} ${layoutStyles.stateCard}`}>{restaurantLoadError}</div>
            ) : null}
        </section>
    );
};
