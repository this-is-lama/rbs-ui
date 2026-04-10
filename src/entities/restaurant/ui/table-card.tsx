import type { ReactNode } from 'react';
import type { RestaurantTable } from '@/entities/restaurant/model/types.ts';

type TableCardProps = {
    table: RestaurantTable;
    actions?: ReactNode;
};

export const TableCard = ({ table, actions }: TableCardProps) => {
    return (
        <article className="surface-block" style={{ padding: '20px', display: 'grid', gap: '12px' }}>
            <div style={{ display: 'grid', gap: '6px' }}>
                <h3>Стол №{table.tableNumber}</h3>
                <div><strong>Вместимость:</strong> {table.capacity}</div>
                <div><strong>Статус:</strong> {table.active ? 'Активен' : 'Неактивен'}</div>
                <div><strong>Описание:</strong> {table.description || 'Не указано'}</div>
            </div>

            {actions ? <div>{actions}</div> : null}
        </article>
    );
};