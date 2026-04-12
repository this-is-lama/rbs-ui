import type { CSSProperties } from 'react';
import type { Photo, RestaurantTable } from '@/entities/restaurant/model/types.ts';
import styles from '../restaurant-details-widget.module.scss';

type RestaurantSchemeSectionProps = {
    restaurantName: string;
    schemePhoto: Photo | null;
    placedTables: RestaurantTable[];
    notPlacedTables: RestaurantTable[];
    bookingCartCount: number;
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
    restaurantName,
    schemePhoto,
    placedTables,
    notPlacedTables,
    bookingCartCount,
    onSelectTable,
}: RestaurantSchemeSectionProps) => {
    return (
        <section className={styles.schemeSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Схема зала</h2>

                {bookingCartCount > 0 ? (
                    <div className={styles.bookingCartBadge}>
                        В корзине бронирований: {bookingCartCount}
                    </div>
                ) : null}
            </div>

            {schemePhoto?.publicUrl ? (
                <div className={styles.schemeCanvas}>
                    <img
                        src={schemePhoto.publicUrl}
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
            ) : (
                <div className={styles.emptyBlock}>Фото зала пока не добавлено</div>
            )}

            {placedTables.length === 0 ? (
                <div className={styles.infoMessage}>
                    На фото зала пока не расставлены координаты столов
                </div>
            ) : (
                <p className={styles.schemeHint}>
                    Нажми на стол на схеме, чтобы выбрать дату и время бронирования
                </p>
            )}

            {notPlacedTables.length > 0 ? (
                <div className={styles.unplacedTablesBlock}>
                    <h3 className={styles.unplacedTablesTitle}>Столы без координат</h3>
                    <div className={styles.unplacedTablesList}>
                        {notPlacedTables.map((table) => (
                            <button
                                key={table.id}
                                type="button"
                                className={styles.unplacedTableButton}
                                onClick={() => onSelectTable(table)}
                            >
                                Стол №{table.tableNumber} • до {table.capacity} гостей
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}
        </section>
    );
};
