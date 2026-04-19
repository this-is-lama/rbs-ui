import type { CSSProperties } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { getRestaurantSchemeImageUrl } from '@/entities/restaurant/lib/get-restaurant-scheme-image-url.ts';
import type { Photo, RestaurantTable } from '@/entities/restaurant/model/types.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { EditIcon } from '@/shared/ui/icons/action-icons.tsx';
import styles from '../restaurant-details-widget.module.scss';

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
    const schemeImageUrl = getRestaurantSchemeImageUrl(schemePhoto?.publicUrl ?? null);

    return (
        <section className={styles.schemeSection} id="restaurant-scheme">
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Схема зала</h2>

                {canManageRestaurant ? (
                    <Link
                        to={generatePath(RoutePaths.MY_RESTAURANT_LAYOUT, { id: restaurantId })}
                        className={styles.schemeEditButton}
                        aria-label={`Редактировать схему ресторана ${restaurantName}`}
                        title="Редактировать схему"
                    >
                        <EditIcon className={styles.schemeEditButtonIcon} />
                        <span>Редактировать схему</span>
                    </Link>
                ) : null}
            </div>

            <div className={styles.schemeCanvas}>
                <img
                    src={schemeImageUrl}
                    alt={`Схема зала ресторана ${restaurantName}`}
                    className={styles.schemeImage}
                />

                {placedTables.map((table) => (
                    <button
                        key={table.id}
                        type="button"
                        className={styles.schemeTableButton}
                        style={getSchemeTableStyle(table)}
                        onClick={() => onSelectTable(table)}
                        aria-label={`Открыть бронирование стола №${table.tableNumber}`}
                    >
                        {table.tableNumber}
                    </button>
                ))}
            </div>

            {placedTables.length === 0 ? (
                <div className={styles.infoMessage}>
                    На схеме зала пока не расставлены координаты столов
                </div>
            ) : (
                <p className={styles.schemeHint}>
                    Нажми на стол на схеме, чтобы выбрать дату и время бронирования
                </p>
            )}
        </section>
    );
};
