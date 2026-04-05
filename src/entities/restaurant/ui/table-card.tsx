import type { RestaurantTable } from '@/entities/restaurant/model/types.ts';

type TableCardProps = {
    table: RestaurantTable;
};

export const TableCard = ({ table }: TableCardProps) => {
    return (
        <article>
            <h3>Стол №{table.tableNumber}</h3>
            <div><strong>Вместимость:</strong> {table.capacity}</div>
            <div><strong>Статус:</strong> {table.active ? 'Активен' : 'Неактивен'}</div>
            <div><strong>Описание:</strong> {table.description || 'Не указано'}</div>
        </article>
    );
};