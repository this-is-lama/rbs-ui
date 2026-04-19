import type { AppLanguage } from '@/shared/config/language.ts';

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
        bookingsTitle: 'РњРѕРё Р±СЂРѕРЅРёСЂРѕРІР°РЅРёСЏ',
        capacity: (capacity) => `Р’РјРµСЃС‚РёРјРѕСЃС‚СЊ: ${capacity}`,
        clickToOpenScheme: 'РќР°Р¶РјРёС‚Рµ, С‡С‚РѕР±С‹ РѕС‚РєСЂС‹С‚СЊ СЃС…РµРјСѓ Р·Р°Р»Р°',
        comment: 'РљРѕРјРјРµРЅС‚Р°СЂРёР№',
        date: 'Р”Р°С‚Р°',
        emptyBookings: 'РЈ РІР°СЃ РїРѕРєР° РЅРµС‚ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёР№',
        guests: 'Р“РѕСЃС‚РµР№',
        guestsSummary: (guests) => `Р“РѕСЃС‚РµР№: ${guests}`,
        invalidDate: 'РќРµРєРѕСЂСЂРµРєС‚РЅР°СЏ РґР°С‚Р°',
        loadingBookings: 'Р—Р°РіСЂСѓР·РєР° Р±СЂРѕРЅРёСЂРѕРІР°РЅРёР№...',
        loadingProfile: 'Р—Р°РіСЂСѓР·РєР° РїСЂРѕС„РёР»СЏ...',
        login: 'Р’РѕР№С‚Рё',
        notSpecified: 'РќРµ СѓРєР°Р·Р°РЅРѕ',
        openSchemeAria: (tableLabel) => `РћС‚РєСЂС‹С‚СЊ СЃС…РµРјСѓ СЂРµСЃС‚РѕСЂР°РЅР° РґР»СЏ ${tableLabel}`,
        orderedDishes: 'Р—Р°РєР°Р·Р°РЅРЅС‹Рµ Р±Р»СЋРґР°',
        profile: 'РџСЂРѕС„РёР»СЊ',
        profileGuestDescription: 'Р§С‚РѕР±С‹ РїРѕСЃРјРѕС‚СЂРµС‚СЊ РїСЂРѕС„РёР»СЊ, РІРѕР№РґРёС‚Рµ РІ СЃРёСЃС‚РµРјСѓ',
        restaurantFallback: 'Р РµСЃС‚РѕСЂР°РЅ',
        restaurantNotFound: 'Р РµСЃС‚РѕСЂР°РЅ РЅРµ РЅР°Р№РґРµРЅ',
        statusCancelled: 'РћС‚РјРµРЅРµРЅРѕ',
        statusReserved: 'Р—Р°Р±СЂРѕРЅРёСЂРѕРІР°РЅРѕ',
        switchLanguage: 'РџРµСЂРµРєР»СЋС‡РёС‚СЊ СЏР·С‹Рє',
        table: (tableNumber) => `РЎС‚РѕР» в„–${tableNumber}`,
        tableNotFound: 'РЎС‚РѕР» РЅРµ РЅР°Р№РґРµРЅ',
        tableNotSpecified: 'РЎС‚РѕР» РЅРµ СѓРєР°Р·Р°РЅ',
        time: 'Р’СЂРµРјСЏ',
        totalAmount: 'РС‚РѕРіРѕРІР°СЏ СЃСѓРјРјР°',
        userNotFound: 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ РЅР°Р№РґРµРЅ',
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
