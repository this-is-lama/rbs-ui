import type { WorkingHours } from '@/entities/restaurant/model/types.ts';
import { formatWeekDay, formatWorkingHoursValue } from '@/entities/restaurant/lib/format-working-hours.ts';

type RestaurantWorkingHoursProps = {
    workingHours?: WorkingHours[] | null;
};

export const RestaurantWorkingHours = ({ workingHours }: RestaurantWorkingHoursProps) => {
    if (!Array.isArray(workingHours) || workingHours.length === 0) {
        return <div>Часы работы не указаны</div>;
    }

    return (
        <ul>
            {workingHours.map((item, index) => (
                <li
                    key={`${item.dayOfWeek}-${item.openTime ?? 'closed'}-${item.closeTime ?? 'closed'}-${index}`}
                >
                    <strong>{formatWeekDay(item.dayOfWeek)}:</strong> {formatWorkingHoursValue(item)}
                </li>
            ))}
        </ul>
    );
};