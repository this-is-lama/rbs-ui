import type { ReactNode } from 'react';
import type { RestaurantTable } from '@/entities/restaurant/model/types.ts';
import styles from './table-card.module.scss';

type TableCardProps = {
    table: RestaurantTable;
    actions?: ReactNode;
};

export const TableCard = ({ table, actions }: TableCardProps) => {
    return (
        <article className={`surface-block ${styles.card}`}>
            <div className={styles.content}>
                <h3 className={styles.title}>Стол №{table.tableNumber}</h3>
                <div><strong>Вместимость:</strong> {table.capacity}</div>
                <div><strong>Статус:</strong> {table.active ? 'Активен' : 'Неактивен'}</div>
                <div><strong>Описание:</strong> {table.description || 'Не указано'}</div>
            </div>

            {actions ? <div>{actions}</div> : null}
        </article>
    );
};
