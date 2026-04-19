import { Link, generatePath } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { EditIcon } from '@/shared/ui/icons/action-icons.tsx';
import { type AppLanguage } from '@/shared/config/language.ts';
import type { RestaurantCard as RestaurantCardType } from '@/entities/restaurant/model/types.ts';
import styles from './RestaurantCard.module.scss';

type RestaurantCardProps = {
    editPath?: string;
    isDimmed?: boolean;
    locale?: AppLanguage;
    restaurant: RestaurantCardType;
};

const restaurantCardCopy = {
    ru: {
        edit: 'Редактировать',
        noDescription: 'Описание отсутствует',
        openRestaurant: 'Открыть ресторан',
        editRestaurant: 'Редактировать ресторан',
        photoPlaceholder: 'Фото ресторана',
    },
    en: {
        edit: 'Edit',
        noDescription: 'No description yet',
        openRestaurant: 'Open restaurant',
        editRestaurant: 'Edit restaurant',
        photoPlaceholder: 'Restaurant photo',
    },
} satisfies Record<AppLanguage, {
    edit: string;
    noDescription: string;
    openRestaurant: string;
    editRestaurant: string;
    photoPlaceholder: string;
}>;

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
    locale: AppLanguage;
    restaurant: RestaurantCardType;
};

const RestaurantCardBody = ({ locale, restaurant }: RestaurantCardBodyProps) => {
    const copy = restaurantCardCopy[locale];
    const todayHours = restaurant.workingHour ?? null;
    const openTime = todayHours && !todayHours.closed
        ? formatCardTime(todayHours.openTime)
        : '—';
    const closeTime = todayHours && !todayHours.closed
        ? formatCardTime(todayHours.closeTime)
        : '—';
    const description = restaurant.description?.trim() || restaurant.category || copy.noDescription;

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
                    <div className={styles.imagePlaceholder}>{copy.photoPlaceholder}</div>
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

export const RestaurantCard = ({
    editPath,
    isDimmed = false,
    locale,
    restaurant,
}: RestaurantCardProps) => {
    const { language } = useLanguage();
    const resolvedLocale = locale ?? language;
    const copy = restaurantCardCopy[resolvedLocale];
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
                    aria-label={`${copy.openRestaurant} ${restaurant.name}`}
                />

                <Link
                    to={editPath}
                    className={styles.editButton}
                    aria-label={`${copy.editRestaurant} ${restaurant.name}`}
                    title={copy.edit}
                >
                    <EditIcon className={styles.editIcon} />
                </Link>

                <RestaurantCardBody locale={resolvedLocale} restaurant={restaurant} />
            </article>
        );
    }

    return (
        <Link
            to={restaurantPath}
            className={styles.cardLink}
            aria-label={`${copy.openRestaurant} ${restaurant.name}`}
        >
            <article className={cardClassName}>
                <RestaurantCardBody locale={resolvedLocale} restaurant={restaurant} />
            </article>
        </Link>
    );
};
