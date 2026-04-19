import type { WeekDay, WorkingHours } from '@/entities/restaurant/model/types.ts';
import type { AppLanguage } from '@/shared/config/language.ts';
import { formatWeekDay, formatWorkingHoursValue } from '@/entities/restaurant/lib/format-working-hours.ts';
import styles from './restaurant-working-hours.module.scss';

type RestaurantWorkingHoursProps = {
    workingHours?: WorkingHours[] | null;
    todayWeekDay?: WeekDay;
    language?: AppLanguage;
};

export const RestaurantWorkingHours = ({
    workingHours,
    todayWeekDay,
    language = 'ru',
}: RestaurantWorkingHoursProps) => {
    if (!Array.isArray(workingHours) || workingHours.length === 0) {
        return (
            <div className={styles.empty}>
                {language === 'en' ? 'Working hours are not specified' : 'Часы работы не указаны'}
            </div>
        );
    }

    return (
        <ul className={styles.list}>
            {workingHours.map((item, index) => {
                const isToday = todayWeekDay === item.dayOfWeek;

                return (
                    <li
                        key={`${item.dayOfWeek}-${item.openTime ?? 'closed'}-${item.closeTime ?? 'closed'}-${index}`}
                        className={`${styles.item} ${isToday ? styles.itemToday : ''}`}
                    >
                        <span className={styles.day}>{formatWeekDay(item.dayOfWeek, language)}</span>
                        <span className={styles.value}>{formatWorkingHoursValue(item, language)}</span>
                    </li>
                );
            })}
        </ul>
    );
};
