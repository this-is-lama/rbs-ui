import type { Dish } from '@/entities/restaurant/model/types.ts';
import { getPhotoByCategory } from '@/entities/restaurant/lib/get-photo-by-category.ts';

type DishCardProps = {
    dish: Dish;
};

export const DishCard = ({ dish }: DishCardProps) => {
    const photos = Array.isArray(dish.photos) ? dish.photos : [];
    const banner = getPhotoByCategory(photos, 'BANNER') ?? photos[0] ?? null;

    return (
        <article>
            <h3>{dish.name}</h3>
            <div><strong>Категория:</strong> {dish.category}</div>
            <div><strong>Цена:</strong> {dish.price}</div>
            <div><strong>Вес:</strong> {dish.weight} г</div>
            <div><strong>Доступность:</strong> {dish.available ? 'Доступно' : 'Недоступно'}</div>
            <div><strong>Описание:</strong> {dish.description || 'Не указано'}</div>

            {banner?.publicUrl ? (
                <div>
                    <img src={banner.publicUrl} alt={dish.name} width={240} />
                </div>
            ) : null}
        </article>
    );
};