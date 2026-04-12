import type { KeyboardEvent, MouseEvent } from 'react';
import type { Dish } from '@/entities/restaurant/model/types.ts';
import { getPhotoByCategory } from '@/entities/restaurant/lib/get-photo-by-category.ts';
import styles from './dish-card.module.scss';

type DishCardProps = {
    dish: Dish;
    count?: number;
    onOpen?: () => void;
    onAddToCart?: () => void;
    onDecreaseFromCart?: () => void;
};

export const DishCard = ({
    dish,
    count = 0,
    onOpen,
    onAddToCart,
    onDecreaseFromCart,
}: DishCardProps) => {
    const photos = Array.isArray(dish.photos) ? dish.photos : [];
    const banner = getPhotoByCategory(photos, 'BANNER') ?? photos[0] ?? null;

    const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (!onOpen) {
            return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen();
        }
    };

    const handleActionClick = (
        event: MouseEvent<HTMLButtonElement>,
        action?: () => void,
    ) => {
        event.stopPropagation();
        action?.();
    };

    return (
        <article
            className={`${styles.card} ${onOpen ? styles.cardInteractive : ''}`}
            onClick={onOpen}
            onKeyDown={handleCardKeyDown}
            role={onOpen ? 'link' : undefined}
            tabIndex={onOpen ? 0 : undefined}
        >
            <div className={styles.imageWrapper}>
                {banner?.publicUrl ? (
                    <img src={banner.publicUrl} alt={dish.name} className={styles.image} />
                ) : (
                    <div className={styles.imagePlaceholder}>Фото блюда</div>
                )}

                {count > 0 ? <span className={styles.countBadge}>{count}</span> : null}
            </div>

            <div className={styles.content}>
                <h3 className={styles.name}>{dish.name}</h3>

                <div className={styles.footer}>
                    <span className={styles.weightBadge}>{dish.weight} г</span>

                    {dish.available ? (
                        count > 0 ? (
                            <div className={styles.priceControls}>
                                <button
                                    type="button"
                                    className={styles.stepButton}
                                    onClick={(event) =>
                                        handleActionClick(event, onDecreaseFromCart)
                                    }
                                    aria-label={`Уменьшить количество блюда ${dish.name}`}
                                >
                                    -
                                </button>

                                <span className={styles.priceValue}>{dish.price} ₽</span>

                                <button
                                    type="button"
                                    className={styles.stepButton}
                                    onClick={(event) => handleActionClick(event, onAddToCart)}
                                    aria-label={`Увеличить количество блюда ${dish.name}`}
                                >
                                    +
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className={styles.priceButton}
                                onClick={(event) => handleActionClick(event, onAddToCart)}
                                aria-label={`Добавить блюдо ${dish.name} в корзину`}
                            >
                                <span className={styles.pricePrefix}>+</span>
                                <span className={styles.priceValue}>{dish.price} ₽</span>
                            </button>
                        )
                    ) : (
                        <div className={styles.unavailableBadge}>Нет в наличии</div>
                    )}
                </div>
            </div>
        </article>
    );
};
