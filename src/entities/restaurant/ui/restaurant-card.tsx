import { Link, generatePath } from 'react-router-dom';
import type { RestaurantCard as RestaurantCardType } from '@/entities/restaurant/model/types.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { EditIcon } from '@/shared/ui/icons/action-icons.tsx';
import styles from './RestaurantCard.module.scss';

type RestaurantCardProps = {
    restaurant: RestaurantCardType;
    editPath?: string;
    isDimmed?: boolean;
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

type RestaurantCardBodyProps = {
    restaurant: RestaurantCardType;
};

const RestaurantCardBody = ({ restaurant }: RestaurantCardBodyProps) => {
    const todayHours = restaurant.workingHour ?? null;
    const openTime = todayHours && !todayHours.closed
        ? formatCardTime(todayHours.openTime)
        : '—';
    const closeTime = todayHours && !todayHours.closed
        ? formatCardTime(todayHours.closeTime)
        : '—';
    const description = restaurant.description?.trim() || restaurant.category || 'Описание отсутствует';

    return (
        <>
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
        </>
    );
};

export const RestaurantCard = ({ restaurant, editPath, isDimmed = false }: RestaurantCardProps) => {
    const restaurantPath = generatePath(RoutePaths.RESTAURANT, { id: restaurant.id });
    const cardClassName = `${styles.card} ${editPath ? styles.cardInteractive : ''} ${
        isDimmed ? styles.cardDimmed : ''
    }`.trim();

    if (editPath) {
        return (
            <article className={cardClassName}>
                <Link
                    to={restaurantPath}
                    className={styles.cardCoverLink}
                    aria-label={`Открыть ресторан ${restaurant.name}`}
                />

                <Link
                    to={editPath}
                    className={styles.editButton}
                    aria-label={`Редактировать ресторан ${restaurant.name}`}
                    title="Редактировать"
                >
                    <EditIcon className={styles.editIcon} />
                </Link>

                <RestaurantCardBody restaurant={restaurant} />
            </article>
        );
    }

    return (
        <Link
            to={restaurantPath}
            className={styles.cardLink}
            aria-label={`Открыть ресторан ${restaurant.name}`}
        >
            <article className={cardClassName}>
                <RestaurantCardBody restaurant={restaurant} />
            </article>
        </Link>
    );
};
