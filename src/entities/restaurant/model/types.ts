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

export type ManagerRestaurantCard = RestaurantCard;

export type RestaurantManager = {
    id: string;
    name: string | null;
    surname: string | null;
    email: string | null;
    role: string;
    enabled: boolean;
    assignedAt: string;
};

export type TableLayoutItem = {
    id: string;
    positionX: number;
    positionY: number;
    markerSize: number;
};

export type UpdateRestaurantLayoutRequest = {
    tables: TableLayoutItem[];
};

export type RestaurantManageFormValues = {
    name: string;
    category: string;
    description: string;
    address: string;
    active: boolean;
    minPricingCharge: string;
    maxPricingCharge: string;
    workingHours: WorkingHours[];
    contacts: Contact[];
};

export type DishManageFormValues = {
    name: string;
    category: string;
    description: string;
    price: string;
    weight: string;
    available: boolean;
};

export type RestaurantManageRequest = {
    name: string;
    category: string;
    description: string | null;
    address: string;
    active: boolean;
    minPricingCharge: number;
    maxPricingCharge: number;
    workingHours: WorkingHours[];
    contacts: Contact[];
};

export type RestaurantPricingSettingsRequest = {
    minPricingCharge: number;
    maxPricingCharge: number;
};

export type RestaurantPricingSettingsResponse = {
    minPricingCharge: string | number;
    maxPricingCharge: string | number;
};

export type DishManageRequest = {
    name: string;
    category: string;
    description: string | null;
    price: number;
    weight: number;
    available: boolean;
};

export type TableManageRequest = {
    tableNumber: number;
    description: string | null;
    capacity: number;
    active: boolean;
    positionX: number | null;
    positionY: number | null;
    markerSize: number | null;
};

export type PhotoUploadDraft = {
    file: File;
    contentType: string;
    category: PhotoCategory;
    sortOrder: number;
};

export type PhotoUploadRequestItem = {
    contentType: string;
    category: PhotoCategory;
    sortOrder: number;
};

export type PhotoUploadPendingItem = {
    id: string;
    objectKey: string;
    presignedUrl: string;
    publicUrl: string;
    contentType: string;
    category: PhotoCategory;
    sortOrder: number;
};

export type PhotoConfirmRequestItem = {
    id: string;
    objectKey: string;
};

export type Restaurant = {
    id: string;
    name: string;
    category: string;
    description: string | null;
    address: string;
    active: boolean;
    minPricingCharge?: string | number | null;
    maxPricingCharge?: string | number | null;
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
