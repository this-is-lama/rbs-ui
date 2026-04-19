import { getPhotoByCategory } from '@/entities/restaurant/lib/get-photo-by-category.ts';
import { getCurrentWeekDay } from '@/entities/restaurant/lib/week-day.ts';
import type { Restaurant, RestaurantCard } from '@/entities/restaurant/model/types.ts';

type RestaurantSnapshot = Partial<Pick<RestaurantCard, 'name' | 'category' | 'description' | 'address'>>;

type BuildRestaurantCardParams = {
    restaurantId: string;
    restaurant: Restaurant | null;
    fallbackName?: string;
    snapshot?: RestaurantSnapshot | null;
};

export const buildRestaurantCard = ({
    restaurantId,
    restaurant,
    fallbackName = '',
    snapshot = null,
}: BuildRestaurantCardParams): RestaurantCard => {
    const photos = Array.isArray(restaurant?.photos) ? restaurant.photos : [];
    const workingHours = Array.isArray(restaurant?.workingHours) ? restaurant.workingHours : [];
    const currentWeekDay = getCurrentWeekDay();

    return {
        id: restaurantId,
        name: restaurant?.name ?? snapshot?.name ?? fallbackName,
        category: restaurant?.category ?? snapshot?.category ?? '',
        description: restaurant?.description ?? snapshot?.description ?? '',
        address: restaurant?.address ?? snapshot?.address ?? '',
        active: restaurant?.active ?? true,
        workingHour: workingHours.find((item) => item.dayOfWeek === currentWeekDay) ?? null,
        bannerPhoto: getPhotoByCategory(photos, 'BANNER') ?? photos[0] ?? null,
    };
};
