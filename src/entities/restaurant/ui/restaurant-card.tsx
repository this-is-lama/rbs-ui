import { Link, generatePath } from 'react-router-dom';
import type { RestaurantCard as RestaurantCardType } from '@/entities/restaurant/model/types.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import styles from './RestaurantCard.module.scss';

type RestaurantCardProps = {
    restaurant: RestaurantCardType;
};

const formatCardTime = (value: string | null | undefined) => {
    if (!value) {
        return '—';
    }

    const normalized = value.slice(0, 5);

    if (normalized.endsWith(':00')) {
        return normalized.slice(0, 2);
    }

    return normalized;
};

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
    const restaurantPath = generatePath(RoutePaths.RESTAURANT, { id: restaurant.id });
    const todayHours = restaurant.workingHour ?? null;

    const openTime = todayHours && !todayHours.closed
        ? formatCardTime(todayHours.openTime)
        : '—';

    const closeTime = todayHours && !todayHours.closed
        ? formatCardTime(todayHours.closeTime)
        : '—';

    const description = restaurant.description?.trim() || restaurant.category || 'Описание отсутствует';

    return (
        <Link
            to={restaurantPath}
            className={styles.cardLink}
            aria-label={`Открыть ресторан ${restaurant.name}`}
        >
            <article className={styles.card}>
                <div className={styles.imageWrapper}>
                    {restaurant.bannerPhoto?.publicUrl ? (
                        <img
                            src={restaurant.bannerPhoto.publicUrl}
                            alt={restaurant.name}
                            className={styles.image}
                        />
                    ) : (
                        <div className={styles.imagePlaceholder}>Фото ресторана</div>
                    )}
                </div>

                <div className={styles.content}>
                    <div className={styles.hours}>
                        <span className={styles.time}>{openTime}</span>
                        <span className={styles.divider} />
                        <span className={styles.time}>{closeTime}</span>
                    </div>

                    <div className={styles.info}>
                        <h2 className={styles.name}>{restaurant.name}</h2>

                        <p className={styles.description} title={description}>
                            {description}
                        </p>

                        <p className={styles.address} title={restaurant.address}>
                            {restaurant.address}
                        </p>
                    </div>
                </div>
            </article>
        </Link>
    );
};