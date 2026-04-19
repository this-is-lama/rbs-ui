import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { useLanguage } from '@/app/providers/language';
import type { Dish } from '@/entities/restaurant/model/types.ts';
import { getPhotoByCategory } from '@/entities/restaurant/lib/get-photo-by-category.ts';
import { CartActionIcon } from '@/shared/ui/cart-action-icon/cart-action-icon.tsx';
import styles from './dish-card.module.scss';

type DishCardProps = {
    dish: Dish;
    count?: number;
    onOpen?: () => void;
    onAddToCart?: () => void;
    onDecreaseFromCart?: () => void;
    action?: ReactNode;
};

export const DishCard = ({
    dish,
    count = 0,
    onOpen,
    onAddToCart,
    onDecreaseFromCart,
    action,
}: DishCardProps) => {
    const { language } = useLanguage();
    const photos = Array.isArray(dish.photos) ? dish.photos : [];
    const banner = getPhotoByCategory(photos, 'BANNER') ?? photos[0] ?? null;
    const copy = language === 'en'
        ? {
            addDish: `Add ${dish.name} to cart`,
            decrementDish: `Decrease ${dish.name} quantity`,
            imageFallback: 'Dish photo',
            incrementDish: `Increase ${dish.name} quantity`,
            unavailable: 'Unavailable',
            weight: 'g',
        }
        : {
            addDish: `Добавить блюдо ${dish.name} в корзину`,
            decrementDish: `Уменьшить количество блюда ${dish.name}`,
            imageFallback: 'Фото блюда',
            incrementDish: `Увеличить количество блюда ${dish.name}`,
            unavailable: 'Нет в наличии',
            weight: 'г',
        };

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
        actionHandler?: () => void,
    ) => {
        event.stopPropagation();
        actionHandler?.();
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
                    <div className={styles.imagePlaceholder}>{copy.imageFallback}</div>
                )}

                {count > 0 ? <span className={styles.countBadge}>{count}</span> : null}
            </div>

            <div className={styles.content}>
                <div className={styles.head}>
                    <h3 className={styles.name}>{dish.name}</h3>
                    {action ? (
                        <div
                            className={styles.action}
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => event.stopPropagation()}
                        >
                            {action}
                        </div>
                    ) : null}
                </div>

                <div className={styles.footer}>
                    <span className={styles.weightBadge}>{dish.weight} {copy.weight}</span>

                    {dish.available ? (
                        count > 0 ? (
                            <div className={styles.priceControls}>
                                <button
                                    type="button"
                                    className={styles.stepButton}
                                    onClick={(event) =>
                                        handleActionClick(event, onDecreaseFromCart)
                                    }
                                    aria-label={copy.decrementDish}
                                >
                                    <CartActionIcon type="minus" className={styles.stepIcon} />
                                </button>

                                <span className={styles.priceValue}>{dish.price} ₽</span>

                                <button
                                    type="button"
                                    className={styles.stepButton}
                                    onClick={(event) => handleActionClick(event, onAddToCart)}
                                    aria-label={copy.incrementDish}
                                >
                                    <CartActionIcon type="plus" className={styles.stepIcon} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className={styles.priceButton}
                                onClick={(event) => handleActionClick(event, onAddToCart)}
                                aria-label={copy.addDish}
                            >
                                <CartActionIcon type="plus" className={styles.pricePrefix} />
                                <span className={styles.priceValue}>{dish.price} ₽</span>
                            </button>
                        )
                    ) : (
                        <div className={styles.unavailableBadge}>{copy.unavailable}</div>
                    )}
                </div>
            </div>
        </article>
    );
};
