import type { CSSProperties } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import { getRestaurantSchemeImageUrl } from '@/entities/restaurant/lib/get-restaurant-scheme-image-url.ts';
import type { Photo, RestaurantTable } from '@/entities/restaurant/model/types.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { EditIcon } from '@/shared/ui/icons/action-icons.tsx';
import styles from '../restaurant-details-widget/restaurant-details-widget.module.scss';

type RestaurantSchemeSectionProps = {
    restaurantId: string;
    restaurantName: string;
    schemePhoto: Photo | null;
    placedTables: RestaurantTable[];
    canManageRestaurant: boolean;
    onSelectTable: (table: RestaurantTable) => void;
};

type SchemeButtonStyle = CSSProperties & {
    '--scheme-table-left': string;
    '--scheme-table-top': string;
    '--scheme-table-size': string;
};

const getSchemeTableStyle = (table: RestaurantTable): SchemeButtonStyle => {
    return {
        '--scheme-table-left': `${table.positionX}%`,
        '--scheme-table-top': `${table.positionY}%`,
        '--scheme-table-size': `${table.markerSize ?? 46}px`,
    };
};

export const RestaurantSchemeSection = ({
    restaurantId,
    restaurantName,
    schemePhoto,
    placedTables,
    canManageRestaurant,
    onSelectTable,
}: RestaurantSchemeSectionProps) => {
    const { language } = useLanguage();
    const schemeImageUrl = getRestaurantSchemeImageUrl(schemePhoto?.publicUrl ?? null);
    const copy = language === 'en'
        ? {
            editScheme: 'Edit floor plan',
            empty: 'Table coordinates have not been placed on the floor plan yet',
            hint: 'Click a table on the floor plan to choose a booking date and time',
            openBooking: (tableNumber: number) => `Open booking for table #${tableNumber}`,
            schemeAlt: `Restaurant floor plan ${restaurantName}`,
            title: 'Floor plan',
        }
        : {
            editScheme: 'Редактировать схему',
            empty: 'На схеме зала пока не расставлены координаты столов',
            hint: 'Нажми на стол на схеме, чтобы выбрать дату и время бронирования',
            openBooking: (tableNumber: number) => `Открыть бронирование стола №${tableNumber}`,
            schemeAlt: `Схема зала ресторана ${restaurantName}`,
            title: 'Схема зала',
        };

    return (
        <section className={styles.schemeSection} id="restaurant-scheme">
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{copy.title}</h2>

                {canManageRestaurant ? (
                    <Link
                        to={generatePath(RoutePaths.MY_RESTAURANT_LAYOUT, { id: restaurantId })}
                        className={styles.schemeEditButton}
                        aria-label={`${copy.editScheme} ${restaurantName}`}
                        title={copy.editScheme}
                    >
                        <EditIcon className={styles.schemeEditButtonIcon} />
                        <span>{copy.editScheme}</span>
                    </Link>
                ) : null}
            </div>

            <div className={styles.schemeCanvas}>
                <img
                    src={schemeImageUrl}
                    alt={copy.schemeAlt}
                    className={styles.schemeImage}
                />

                {placedTables.map((table) => (
                    <button
                        key={table.id}
                        type="button"
                        className={styles.schemeTableButton}
                        style={getSchemeTableStyle(table)}
                        onClick={() => onSelectTable(table)}
                        aria-label={copy.openBooking(table.tableNumber)}
                    >
                        {table.tableNumber}
                    </button>
                ))}
            </div>

            {placedTables.length === 0 ? (
                <div className={styles.infoMessage}>{copy.empty}</div>
            ) : (
                <p className={styles.schemeHint}>{copy.hint}</p>
            )}
        </section>
    );
};

