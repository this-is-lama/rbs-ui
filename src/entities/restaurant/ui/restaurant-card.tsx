import { Link } from 'react-router-dom';
import type { RestaurantCard as RestaurantCardType } from '@/entities/restaurant/model/types.ts';
import { RestaurantWorkingHours } from '@/entities/restaurant/ui/restaurant-working-hours.tsx';
import { RoutePaths } from '@/shared/config/routes/routes.ts';

type RestaurantCardProps = {
    restaurant: RestaurantCardType;
};

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
    return (
        <article>
            <h2>
                <Link to={RoutePaths.RESTAURANTS + '/' + restaurant.id}>{restaurant.name}</Link>
            </h2>

            <div><strong>Категория:</strong> {restaurant.category}</div>
            <div><strong>Адрес:</strong> {restaurant.address}</div>
            <div><strong>Статус:</strong> {restaurant.active ? 'Активен' : 'Неактивен'}</div>

            {restaurant.bannerPhoto?.publicUrl ? (
                <div>
                    <img
                        src={restaurant.bannerPhoto.publicUrl}
                        alt={restaurant.name}
                        width={320}
                    />
                </div>
            ) : (
                <div>Баннер отсутствует</div>
            )}

            <div>
                <h3>Часы работы</h3>
                <RestaurantWorkingHours workingHours={restaurant.workingHours} />
            </div>

            <div>
                <Link to={RoutePaths.RESTAURANTS + '/' + restaurant.id}>Открыть ресторан</Link>
            </div>
        </article>
    );
};