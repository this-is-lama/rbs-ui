import { Link, generatePath } from 'react-router-dom';
import type { RestaurantCard as RestaurantCardType } from '@/entities/restaurant/model/types.ts';
import { RestaurantWorkingHours } from '@/entities/restaurant/ui/restaurant-working-hours.tsx';
import { RoutePaths } from '@/shared/config/routes/routes.ts';

type RestaurantCardProps = {
    restaurant: RestaurantCardType;
};

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
    const restaurantPath = generatePath(RoutePaths.RESTAURANT, { id: restaurant.id });
    const bookingPath = `${RoutePaths.BOOKING}?restaurantId=${restaurant.id}`;

    return (
        <article className="surface-block" style={{ padding: '24px', display: 'grid', gap: '18px' }}>
            <div style={{ display: 'grid', gap: '8px' }}>
                <h2>{restaurant.name}</h2>
                <div><strong>Категория:</strong> {restaurant.category}</div>
                <div><strong>Адрес:</strong> {restaurant.address}</div>
                <div><strong>Статус:</strong> {restaurant.active ? 'Активен' : 'Неактивен'}</div>
            </div>

            {restaurant.bannerPhoto?.publicUrl ? (
                <div>
                    <img
                        src={restaurant.bannerPhoto.publicUrl}
                        alt={restaurant.name}
                        width={420}
                    />
                </div>
            ) : (
                <div>Баннер отсутствует</div>
            )}

            <div style={{ display: 'grid', gap: '8px' }}>
                <h3>Часы работы</h3>
                <RestaurantWorkingHours workingHours={restaurant.workingHours} />
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to={restaurantPath}>
                    <button className="primary-button">Открыть ресторан</button>
                </Link>

                <Link to={bookingPath}>
                    <button className="secondary-button">Забронировать</button>
                </Link>
            </div>
        </article>
    );
};