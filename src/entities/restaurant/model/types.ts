export type ContactType = 'PHONE' | 'EMAIL' | 'WEBSITE';
export type PhotoCategory = 'BANNER' | 'SCHEME' | 'GALLERY';
export type WeekDay =
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';

export type Photo = {
    id: string;
    objectKey: string;
    publicUrl: string;
    contentType: string;
    category: PhotoCategory;
    sortOrder: number;
};

export type WorkingHours = {
    dayOfWeek: WeekDay;
    openTime: string | null;
    closeTime: string | null;
    closed: boolean;
};

export type Contact = {
    type: ContactType;
    value: string;
};

export type Dish = {
    id: string;
    name: string;
    category: string;
    description: string | null;
    price: string | number;
    weight: number;
    available: boolean;
    photos: Photo[] | null;
};

export type RestaurantTable = {
    id: string;
    tableNumber: number;
    description: string | null;
    capacity: number;
    active: boolean;
    positionX: number | null;
    positionY: number | null;
    markerSize: number | null;
};

export type RestaurantCard = {
    id: string;
    name: string;
    category: string;
    description?: string | null;
    address: string;
    active: boolean;
    workingHour?: WorkingHours | null;
    bannerPhoto?: Photo | null;
};

export type Restaurant = {
    id: string;
    name: string;
    category: string;
    description: string | null;
    address: string;
    active: boolean;
    workingHours?: WorkingHours[] | null;
    contacts?: Contact[] | null;
    dishes?: Dish[] | null;
    tables?: RestaurantTable[] | null;
    photos?: Photo[] | null;
};

export type GetRestaurantsParams = {
    category?: string;
    name?: string;
    address?: string;
    page?: number;
    size?: number;
};
