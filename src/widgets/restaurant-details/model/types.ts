import type {
    Contact,
    Dish,
    Photo,
    Restaurant,
    RestaurantTable,
    WorkingHours,
} from '@/entities/restaurant/model/types.ts';

export type NormalizedRestaurant = Omit<
    Restaurant,
    'workingHours' | 'contacts' | 'dishes' | 'tables' | 'photos'
> & {
    workingHours: WorkingHours[];
    contacts: Contact[];
    dishes: Dish[];
    tables: RestaurantTable[];
    photos: Photo[];
};

export type RestaurantDishCounters = Record<string, number>;
