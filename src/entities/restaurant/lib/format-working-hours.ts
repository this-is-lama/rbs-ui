import type { WorkingHours, WeekDay } from '@/entities/restaurant/model/types.ts';
import type { AppLanguage } from '@/shared/config/language.ts';

const weekDayLabels: Record<AppLanguage, Record<WeekDay, string>> = {
    ru: {
        MONDAY: 'Понедельник',
        TUESDAY: 'Вторник',
        WEDNESDAY: 'Среда',
        THURSDAY: 'Четверг',
        FRIDAY: 'Пятница',
        SATURDAY: 'Суббота',
        SUNDAY: 'Воскресенье',
    },
    en: {
        MONDAY: 'Monday',
        TUESDAY: 'Tuesday',
        WEDNESDAY: 'Wednesday',
        THURSDAY: 'Thursday',
        FRIDAY: 'Friday',
        SATURDAY: 'Saturday',
        SUNDAY: 'Sunday',
    },
};

export const formatWeekDay = (day: WeekDay, language: AppLanguage = 'ru'): string => {
    return weekDayLabels[language][day];
};

export const formatWorkingHoursValue = (
    item: WorkingHours,
    language: AppLanguage = 'ru',
): string => {
    if (item.closed) {
        return language === 'en' ? 'Closed' : 'Выходной';
    }

    if (!item.openTime || !item.closeTime) {
        return language === 'en' ? 'Not specified' : 'Не указано';
    }

    return `${item.openTime} - ${item.closeTime}`;
};
