import type { WeekDay } from '@/entities/restaurant/model/types.ts';

const JS_DAY_TO_WEEK_DAY: Record<number, WeekDay> = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
};

export const getCurrentWeekDay = (): WeekDay => {
    return JS_DAY_TO_WEEK_DAY[new Date().getDay()];
};

export const getWeekDayFromDate = (value: string | Date): WeekDay => {
    const date = value instanceof Date
        ? value
        : new Date(`${value}T00:00:00`);

    return JS_DAY_TO_WEEK_DAY[date.getDay()];
};
