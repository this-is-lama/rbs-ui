import { generatePath, useNavigate } from 'react-router-dom';
import { resolveBookingTable } from '@/entities/booking/lib/booking-details.ts';
import type { Booking } from '@/entities/booking/model/types.ts';
import { BookingAccordionItem } from '@/entities/booking/ui/booking-accordion-item.tsx';
import bookingPanelStyles from '@/entities/booking/ui/BookingAccordionItem.module.scss';
import { buildRestaurantCard } from '@/entities/restaurant/lib/build-restaurant-card.ts';
import type { Restaurant } from '@/entities/restaurant/model/types.ts';
import { type AppLanguage } from '@/shared/config/language.ts';
import { RestaurantCard } from '@/entities/restaurant/ui';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import layoutStyles from '@/shared/ui/booking-order-layout/booking-order-layout.module.scss';
import { BookingTableCard } from '@/shared/ui/booking-table-card';
import {
    formatLocalizedAmount,
    formatLocalizedDate,
    formatLocalizedDateTime,
    formatLocalizedTimeRange,
    getLocalizedBookingStatusLabel,
    getLocalizedBookingTableLabel,
    getRestaurantIdentifier,
    getStatusTone,
} from '../../lib/profile-format.ts';
import type { ProfilePageCopy } from '../../model/profile-page-copy.ts';

type UserBookingItemProps = {
    booking: Booking;
    copy: ProfilePageCopy;
    expanded: boolean;
    language: AppLanguage;
    restaurant: Restaurant | null;
    onToggle: () => void;
};

export const UserBookingItem = ({
    booking,
    copy,
    expanded,
    language,
    restaurant,
    onToggle,
}: UserBookingItemProps) => {
    const navigate = useNavigate();
    const restaurantId = getRestaurantIdentifier(booking);
    const restaurantCardData = restaurantId
        ? buildRestaurantCard({
            restaurantId,
            restaurant,
            fallbackName: copy.restaurantFallback,
            snapshot: booking.restaurant
                ? {
                    name: booking.restaurant.name,
                    category: booking.restaurant.category,
                    description: booking.restaurant.description,
                    address: booking.restaurant.address,
                }
                : null,
        })
        : null;
    const selectedTable = resolveBookingTable(booking, restaurant);
    const orderedDishes = Array.isArray(booking.dishes) ? booking.dishes : [];
    const selectedTableLabel = getLocalizedBookingTableLabel(booking, restaurant, copy);
    const selectedTableSubtitle = selectedTable
        ? [
            copy.capacity(selectedTable.capacity),
            selectedTable.description?.trim() || null,
        ].filter(Boolean).join(' вЂў ')
        : '';

    return (
        <BookingAccordionItem
            title={booking.restaurant?.name || copy.restaurantFallback}
            expanded={expanded}
            onToggle={onToggle}
            statusLabel={getLocalizedBookingStatusLabel(booking.status, copy)}
            statusTone={getStatusTone(booking.status)}
            metaChips={(
                <>
                    <span className={bookingPanelStyles.summaryChip}>
                        {formatLocalizedDateTime(booking.startAt, language, copy)}
                    </span>
                    <span className={bookingPanelStyles.summaryChip}>
                        {selectedTableLabel}
                    </span>
                    <span className={bookingPanelStyles.summaryChip}>
                        {copy.guestsSummary(booking.guests)}
                    </span>
                </>
            )}
        >
            <div className={layoutStyles.orderGrid}>
                <div className={layoutStyles.orderColumn}>
                    {restaurantCardData ? (
                        <RestaurantCard
                            restaurant={restaurantCardData}
                            locale={language}
                        />
                    ) : (
                        <article className={`${layoutStyles.card} ${layoutStyles.stateCard}`}>
                            {copy.restaurantNotFound}
                        </article>
                    )}
                </div>

                <div className={layoutStyles.orderColumn}>
                    {selectedTable ? (
                        <BookingTableCard
                            ariaLabel={copy.openSchemeAria(selectedTableLabel)}
                            hint={copy.clickToOpenScheme}
                            rows={[
                                {
                                    label: copy.date,
                                    value: formatLocalizedDate(booking.startAt, language, copy),
                                },
                                {
                                    label: copy.time,
                                    value: formatLocalizedTimeRange(
                                        booking.startAt,
                                        booking.endAt,
                                        language,
                                        copy,
                                    ),
                                },
                                {
                                    label: copy.guests,
                                    value: booking.guests,
                                },
                            ]}
                            title={copy.table(selectedTable.tableNumber)}
                            subtitle={selectedTableSubtitle}
                            onOpen={() => {
                                if (!restaurantId) {
                                    return;
                                }

                                const restaurantPath = generatePath(RoutePaths.RESTAURANT, {
                                    id: restaurantId,
                                });

                                navigate(`${restaurantPath}#restaurant-scheme`);
                            }}
                        />
                    ) : (
                        <article className={`${layoutStyles.card} ${layoutStyles.stateCard}`}>
                            {copy.tableNotFound}
                        </article>
                    )}
                </div>
            </div>

            <div className={bookingPanelStyles.footer}>
                <div className={bookingPanelStyles.priceBlock}>
                    <span className={bookingPanelStyles.priceLabel}>
                        {copy.totalAmount}
                    </span>
                    <strong className={bookingPanelStyles.priceValue}>
                        {formatLocalizedAmount(booking.totalAmount, language, copy)}
                    </strong>
                </div>

                {orderedDishes.length > 0 ? (
                    <div className={bookingPanelStyles.dishesBlock}>
                        <span className={bookingPanelStyles.dishesTitle}>
                            {copy.orderedDishes}
                        </span>
                        <div className={bookingPanelStyles.dishesList}>
                            {orderedDishes.map((dish) => (
                                <span
                                    key={dish.id}
                                    className={bookingPanelStyles.dishChip}
                                >
                                    {dish.name} Г— {dish.quantity}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : null}

                {booking.comment?.trim() ? (
                    <div className={bookingPanelStyles.infoBlock}>
                        <span className={bookingPanelStyles.infoTitle}>
                            {copy.comment}
                        </span>
                        <p className={bookingPanelStyles.infoText}>
                            {booking.comment}
                        </p>
                    </div>
                ) : null}
            </div>
        </BookingAccordionItem>
    );
};
