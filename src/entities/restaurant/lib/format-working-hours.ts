import type { WorkingHours, WeekDay } from '@/entities/restaurant/model/types.ts';

const weekDayLabels: Record<WeekDay, string> = {
    MONDAY: 'Понедельник',
    TUESDAY: 'Вторник',
    WEDNESDAY: 'Среда',
    THURSDAY: 'Четверг',
    FRIDAY: 'Пятница',
    SATURDAY: 'Суббота',
    SUNDAY: 'Воскресенье',
};

export const formatWeekDay = (day: WeekDay): string => {
    return weekDayLabels[day];
};

export const formatWorkingHoursValue = (item: WorkingHours): string => {
    if (item.closed) {
        return 'Выходной';
    }

    if (!item.openTime || !item.closeTime) {
        return 'Не указано';
    }

    return `${item.openTime} - ${item.closeTime}`;
};