import { Link, generatePath } from 'react-router-dom';
import type { DishCartItem } from '@/shared/dish-cart/dish-cart.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import type { DishCartGroup } from '../booking-page.types.ts';
import styles from '../BookingPageWidget.module.scss';

type DishCartSectionProps = {
    groups: DishCartGroup[];
    onClear: () => void;
    onDecrement: (restaurantId: string, dishId: string) => void;
    onIncrement: (item: DishCartItem) => void;
    onRemove: (restaurantId: string, dishId: string) => void;
    formatMoney: (value: number) => string;
};

const getDishKey = (item: DishCartItem) => `${item.restaurantId}:${item.dishId}`;

export const DishCartSection = ({
    groups,
    onClear,
    onDecrement,
    onIncrement,
    onRemove,
    formatMoney,
}: DishCartSectionProps) => {
    return (
        <section className={styles.section}>
            <div className={styles.headerRow}>
                <h2 className="section-title">Блюда</h2>

                {groups.length > 0 ? (
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.dangerButton}
                            onClick={onClear}
                        >
                            Очистить блюда
                        </button>
                    </div>
                ) : null}
            </div>

            {groups.length > 0 ? (
                groups.map((group) => (
                    <article key={group.restaurantId} className={styles.card}>
                        <div className={styles.headerRow}>
                            <h3 className={styles.bookingTitle}>{group.restaurantName}</h3>

                            <Link
                                to={generatePath(RoutePaths.RESTAURANT, { id: group.restaurantId })}
                                className={`${styles.secondaryButton} ${styles.linkButton}`}
                            >
                                Перейти в ресторан
                            </Link>
                        </div>

                        <div className={styles.dishGroupList}>
                            {group.items.map((item) => (
                                <div key={getDishKey(item)} className={styles.dishItem}>
                                    <div className={styles.dishImageBox}>
                                        {item.photoUrl ? (
                                            <img
                                                src={item.photoUrl}
                                                alt={item.dishName}
                                                className={styles.dishImage}
                                            />
                                        ) : (
                                            'Фото'
                                        )}
                                    </div>

                                    <div className={styles.dishInfo}>
                                        <strong className={styles.dishName}>{item.dishName}</strong>
                                        <span className={styles.subtleText}>{item.weight} г</span>
                                        <span className={styles.dishPrice}>
                                            {formatMoney(item.price * item.quantity)}
                                        </span>
                                    </div>

                                    <div className={styles.dishActions}>
                                        <button
                                            type="button"
                                            className={styles.secondaryButton}
                                            onClick={() => onDecrement(item.restaurantId, item.dishId)}
                                        >
                                            −
                                        </button>

                                        <div className={styles.quantityValue}>{item.quantity}</div>

                                        <button
                                            type="button"
                                            className={styles.primaryButton}
                                            onClick={() => onIncrement(item)}
                                        >
                                            +
                                        </button>

                                        <button
                                            type="button"
                                            className={styles.dangerButton}
                                            onClick={() => onRemove(item.restaurantId, item.dishId)}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>
                ))
            ) : (
                <div className={`${styles.card} ${styles.emptyCard}`}>
                    Добавленных блюд пока нет
                </div>
            )}
        </section>
    );
};
