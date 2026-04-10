import { Link, generatePath } from 'react-router-dom';
import type { Dish } from '@/entities/restaurant/model/types.ts';
import { getPhotoByCategory } from '@/entities/restaurant/lib/get-photo-by-category.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';

type DishCardProps = {
    dish: Dish;
    restaurantId?: string;
};

export const DishCard = ({ dish, restaurantId }: DishCardProps) => {
    const photos = Array.isArray(dish.photos) ? dish.photos : [];
    const banner = getPhotoByCategory(photos, 'BANNER') ?? photos[0] ?? null;

    const dishPath = generatePath(RoutePaths.DISH, { id: dish.id });
    const detailsHref = restaurantId
        ? `${dishPath}?restaurantId=${restaurantId}`
        : dishPath;

    return (
        <article className="surface-block" style={{ padding: '20px', display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gap: '8px' }}>
                <h3>{dish.name}</h3>
                <div><strong>Категория:</strong> {dish.category}</div>
                <div><strong>Цена:</strong> {dish.price}</div>
                <div><strong>Вес:</strong> {dish.weight} г</div>
                <div><strong>Доступность:</strong> {dish.available ? 'Доступно' : 'Недоступно'}</div>
                <div><strong>Описание:</strong> {dish.description || 'Не указано'}</div>
            </div>

            {banner?.publicUrl ? (
                <div>
                    <img src={banner.publicUrl} alt={dish.name} width={240} />
                </div>
            ) : null}

            <div>
                <Link to={detailsHref}>
                    <button className="secondary-button">Подробнее о блюде</button>
                </Link>
            </div>
        </article>
    );
};