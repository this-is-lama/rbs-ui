import type { AppLanguage } from '@/shared/config';

export type ProfilePageCopy = {
    bookingsTitle: string;
    capacity: (capacity: number) => string;
    clickToOpenScheme: string;
    comment: string;
    date: string;
    emptyBookings: string;
    guests: string;
    guestsSummary: (guests: number) => string;
    invalidDate: string;
    loadingBookings: string;
    loadingProfile: string;
    login: string;
    notSpecified: string;
    openSchemeAria: (tableLabel: string) => string;
    orderedDishes: string;
    profile: string;
    profileGuestDescription: string;
    restaurantFallback: string;
    restaurantNotFound: string;
    statusCancelled: string;
    statusReserved: string;
    switchLanguage: string;
    table: (tableNumber: number) => string;
    tableNotFound: string;
    tableNotSpecified: string;
    time: string;
    totalAmount: string;
    userNotFound: string;
};

export const profilePageCopy = {
    ru: {
        bookingsTitle: 'Мои бронирования',
        capacity: (capacity) => `Вместимость: ${capacity}`,
        clickToOpenScheme: 'Нажмите, чтобы открыть схему зала',
        comment: 'Комментарий',
        date: 'Дата',
        emptyBookings: 'У вас пока нет бронирований',
        guests: 'Гостей',
        guestsSummary: (guests) => `Гостей: ${guests}`,
        invalidDate: 'Некорректная дата',
        loadingBookings: 'Загрузка бронирований...',
        loadingProfile: 'Загрузка профиля...',
        login: 'Войти',
        notSpecified: 'Не указано',
        openSchemeAria: (tableLabel) => `Открыть схему ресторана для ${tableLabel}`,
        orderedDishes: 'Заказанные блюда',
        profile: 'Профиль',
        profileGuestDescription: 'Чтобы посмотреть профиль, войдите в систему',
        restaurantFallback: 'Ресторан',
        restaurantNotFound: 'Ресторан не найден',
        statusCancelled: 'Отменено',
        statusReserved: 'Забронировано',
        switchLanguage: 'Переключить язык',
        table: (tableNumber) => `Стол №${tableNumber}`,
        tableNotFound: 'Стол не найден',
        tableNotSpecified: 'Стол не указан',
        time: 'Время',
        totalAmount: 'Итоговая сумма',
        userNotFound: 'Пользователь не найден',
    },
    en: {
        bookingsTitle: 'My bookings',
        capacity: (capacity) => `Capacity: ${capacity}`,
        clickToOpenScheme: 'Click to open the floor plan',
        comment: 'Comment',
        date: 'Date',
        emptyBookings: 'You do not have any bookings yet',
        guests: 'Guests',
        guestsSummary: (guests) => `Guests: ${guests}`,
        invalidDate: 'Invalid date',
        loadingBookings: 'Loading bookings...',
        loadingProfile: 'Loading profile...',
        login: 'Sign in',
        notSpecified: 'Not specified',
        openSchemeAria: (tableLabel) => `Open the restaurant floor plan for ${tableLabel}`,
        orderedDishes: 'Ordered dishes',
        profile: 'Profile',
        profileGuestDescription: 'Sign in to view your profile',
        restaurantFallback: 'Restaurant',
        restaurantNotFound: 'Restaurant not found',
        statusCancelled: 'Cancelled',
        statusReserved: 'Reserved',
        switchLanguage: 'Switch language',
        table: (tableNumber) => `Table #${tableNumber}`,
        tableNotFound: 'Table not found',
        tableNotSpecified: 'Table not specified',
        time: 'Time',
        totalAmount: 'Total amount',
        userNotFound: 'User not found',
    },
} satisfies Record<AppLanguage, ProfilePageCopy>;
