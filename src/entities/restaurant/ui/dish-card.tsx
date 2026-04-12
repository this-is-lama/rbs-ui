import type { Dish } from '@/entities/restaurant/model/types.ts';
import { getPhotoByCategory } from '@/entities/restaurant/lib/get-photo-by-category.ts';
import styles from './dish-card.module.scss';

type DishCardProps = {
    dish: Dish;
    count?: number;
    onAddToCart?: () => void;
    onDecreaseFromCart?: () => void;
};

export const DishCard = ({
                             dish,
                             count = 0,
                             onAddToCart,
                             onDecreaseFromCart,
                         }: DishCardProps) => {
    const photos = Array.isArray(dish.photos) ? dish.photos : [];
    const banner = getPhotoByCategory(photos, 'BANNER') ?? photos[0] ?? null;

    return (
        <article className={styles.card}>
            <div className={styles.imageWrapper}>
                {banner?.publicUrl ? (
                    <img src={banner.publicUrl} alt={dish.name} className={styles.image} />
                ) : (
                    <div className={styles.imagePlaceholder}>Фото блюда</div>
                )}

                <div className={styles.overlayRow}>
                    <span className={styles.weightBadge}>{dish.weight} г</span>

                    {dish.available ? (
                        count > 0 ? (
                            <div className={styles.counterGroup}>
                                <button
                                    type="button"
                                    className={styles.counterButton}
                                    onClick={onDecreaseFromCart}
                                    aria-label={`Уменьшить количество блюда ${dish.name}`}
                                >
                                    −
                                </button>

                                <span className={styles.counterPrice}>
                                    {dish.price} ₽
                                </span>

                                <button
                                    type="button"
                                    className={styles.counterButton}
                                    onClick={onAddToCart}
                                    aria-label={`Увеличить количество блюда ${dish.name}`}
                                >
                                    +
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className={styles.actionButton}
                                onClick={onAddToCart}
                                aria-label={`Добавить блюдо ${dish.name} в корзину`}
                            >
                                <span className={styles.actionSymbol}>+</span>
                                <span>{dish.price} ₽</span>
                            </button>
                        )
                    ) : (
                        <div className={styles.unavailableBadge}>Нет в наличии</div>
                    )}
                </div>
            </div>

            <div className={styles.content}>
                <h3 className={styles.name}>{dish.name}</h3>
            </div>
        </article>
    );
};