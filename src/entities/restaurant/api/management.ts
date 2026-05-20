import { apiClient, type PageResponse } from '@/shared/api';
import type { ManagerBookingListItem } from '@/entities/booking/model/types.ts';
import type {
    Dish,
    DishManageRequest,
    ManagerRestaurantCard,
    PhotoConfirmRequestItem,
    PhotoUploadDraft,
    PhotoUploadPendingItem,
    PhotoUploadRequestItem,
    Restaurant,
    RestaurantManageRequest,
    RestaurantManager,
    RestaurantTable,
    TableManageRequest,
    UpdateRestaurantLayoutRequest,
} from '@/entities/restaurant/model/types.ts';

type GetMyRestaurantsParams = {
    active?: boolean;
    category?: string;
    name?: string;
    address?: string;
    page?: number;
    size?: number;
};

const normalizeRestaurant = (restaurant: Restaurant): Restaurant => {
    return {
        ...restaurant,
        description: restaurant.description ?? '',
        active: Boolean(restaurant.active),
        workingHours: Array.isArray(restaurant.workingHours) ? restaurant.workingHours : [],
        contacts: Array.isArray(restaurant.contacts) ? restaurant.contacts : [],
        dishes: Array.isArray(restaurant.dishes) ? restaurant.dishes : [],
        tables: Array.isArray(restaurant.tables) ? restaurant.tables : [],
        photos: Array.isArray(restaurant.photos) ? restaurant.photos : [],
    };
};

const normalizeDish = (dish: Dish): Dish => {
    return {
        ...dish,
        description: dish.description ?? '',
        photos: Array.isArray(dish.photos) ? dish.photos : [],
    };
};

const normalizeTable = (table: RestaurantTable): RestaurantTable => {
    return {
        ...table,
        description: table.description ?? '',
        markerSize: table.markerSize ?? 46,
    };
};

const normalizeRestaurantCard = (restaurant: ManagerRestaurantCard): ManagerRestaurantCard => {
    return {
        ...restaurant,
        description: restaurant.description ?? '',
        active: Boolean(restaurant.active),
        workingHour: restaurant.workingHour ?? null,
        bannerPhoto: restaurant.bannerPhoto ?? null,
    };
};

const normalizeManagerBooking = (booking: ManagerBookingListItem): ManagerBookingListItem => {
    return {
        ...booking,
        comment: booking.comment ?? null,
        cancelledAt: booking.cancelledAt ?? null,
        cancellationReason: booking.cancellationReason ?? null,
        restaurant: booking.restaurant ?? null,
        table: booking.table ?? null,
        dishes: Array.isArray(booking.dishes) ? booking.dishes : [],
        user: booking.user
            ? {
                ...booking.user,
                name: booking.user.name ?? null,
                surname: booking.user.surname ?? null,
                email: booking.user.email ?? null,
                phone: booking.user.phone ?? null,
                active: Boolean(booking.user.active),
            }
            : null,
    };
};

const uploadPhotoBinary = async (presignedUrl: string, file: File, contentType: string) => {
    const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': contentType,
        },
        body: file,
    });

    if (!response.ok) {
        throw new Error('Не удалось загрузить файл в хранилище');
    }
};

const requestPhotoUploads = async (
    path: string,
    items: PhotoUploadRequestItem[],
): Promise<PhotoUploadPendingItem[]> => {
    const response = await apiClient.post<PhotoUploadPendingItem[]>(`${path}/uploads`, items);
    return Array.isArray(response.data) ? response.data : [];
};

const confirmPhotoUploads = async (
    path: string,
    items: PhotoConfirmRequestItem[],
): Promise<string[]> => {
    const response = await apiClient.post<string[]>(`${path}/confirm`, items);
    return Array.isArray(response.data) ? response.data : [];
};

const deletePhotos = async (path: string, ids: string[]) => {
    await apiClient.delete(`${path}/delete`, {
        data: ids,
    });
};

const uploadPhotosWithConfirm = async (path: string, drafts: PhotoUploadDraft[]) => {
    const pending = await requestPhotoUploads(
        path,
        drafts.map((draft) => ({
            contentType: draft.contentType,
            category: draft.category,
            sortOrder: draft.sortOrder,
        })),
    );

    await Promise.all(
        pending.map((item, index) => {
            const draft = drafts[index];
            return uploadPhotoBinary(item.presignedUrl, draft.file, draft.contentType);
        }),
    );

    return confirmPhotoUploads(
        path,
        pending.map((item) => ({
            id: item.id,
            objectKey: item.objectKey,
        })),
    );
};

export const getMyRestaurants = async (
    params: GetMyRestaurantsParams,
): Promise<PageResponse<ManagerRestaurantCard>> => {
    const response = await apiClient.get<PageResponse<ManagerRestaurantCard>>('/api/v1/restaurants/my', {
        params: {
            active: params.active,
            category: params.category || undefined,
            name: params.name || undefined,
            address: params.address || undefined,
            page: params.page ?? 0,
            size: params.size ?? 12,
        },
    });

    return {
        ...response.data,
        content: Array.isArray(response.data.content)
            ? response.data.content.map(normalizeRestaurantCard)
            : [],
    };
};

export const createRestaurant = async (data: RestaurantManageRequest): Promise<string> => {
    const response = await apiClient.post<string>('/api/v1/restaurants', data);
    return response.data;
};

export const updateRestaurant = async (
    id: string,
    data: RestaurantManageRequest,
): Promise<Restaurant> => {
    const response = await apiClient.put<Restaurant>(`/api/v1/restaurants/${id}`, data);
    return normalizeRestaurant(response.data);
};

export const checkRestaurantManagerAccess = async (restId: string): Promise<boolean> => {
    const response = await apiClient.get<boolean>(`/api/v1/restaurants/${restId}/manager-access`);
    return Boolean(response.data);
};

export const getRestaurantManagers = async (restId: string): Promise<RestaurantManager[]> => {
    const response = await apiClient.get<RestaurantManager[]>(`/api/v1/restaurants/${restId}/managers`);
    return Array.isArray(response.data) ? response.data : [];
};

export const addRestaurantManager = async (restId: string, managerId: string): Promise<string> => {
    const response = await apiClient.post<string>(
        `/api/v1/restaurants/${restId}/managers/${managerId}`
    );

    return response.data;
};

export const removeRestaurantManager = async (restId: string, managerId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/restaurants/${restId}/managers/${managerId}`);
};

export const getRestaurantBookingsForManager = async (
    restId: string,
): Promise<ManagerBookingListItem[]> => {
    const response = await apiClient.get<ManagerBookingListItem[]>(`/api/v1/bookings/manager/restaurants/${restId}`);
    return Array.isArray(response.data) ? response.data.map(normalizeManagerBooking) : [];
};

export const getRestaurantDishById = async (restId: string, dishId: string): Promise<Dish> => {
    const response = await apiClient.get<Dish>(`/api/v1/restaurants/${restId}/dishes/${dishId}`);
    return normalizeDish(response.data);
};

export const createDish = async (restId: string, data: DishManageRequest): Promise<string> => {
    const response = await apiClient.post<string>(`/api/v1/restaurants/${restId}/dishes`, data);
    return response.data;
};

export const updateDish = async (
    restId: string,
    id: string,
    data: DishManageRequest,
): Promise<Dish> => {
    const response = await apiClient.put<Dish>(`/api/v1/restaurants/${restId}/dishes/${id}`, data);
    return normalizeDish(response.data);
};

export const deleteDish = async (restId: string, id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/restaurants/${restId}/dishes/${id}`);
};

export const createTable = async (restId: string, data: TableManageRequest): Promise<string> => {
    const response = await apiClient.post<string>(`/api/v1/restaurants/${restId}/tables`, data);
    return response.data;
};

export const updateTable = async (
    restId: string,
    id: string,
    data: TableManageRequest,
): Promise<RestaurantTable> => {
    const response = await apiClient.put<RestaurantTable>(`/api/v1/restaurants/${restId}/tables/${id}`, data);
    return normalizeTable(response.data);
};

export const deleteTable = async (restId: string, id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/restaurants/${restId}/tables/${id}`);
};

export const updateRestaurantLayout = async (
    restId: string,
    data: UpdateRestaurantLayoutRequest,
): Promise<RestaurantTable[]> => {
    const response = await apiClient.put<RestaurantTable[]>(`/api/v1/restaurants/${restId}/tables/layout`, data);
    return Array.isArray(response.data) ? response.data.map(normalizeTable) : [];
};

export const deleteRestaurantPhotos = async (restaurantId: string, ids: string[]) => {
    return deletePhotos(`/api/v1/restaurants/${restaurantId}/photos`, ids);
};

export const uploadRestaurantPhotos = async (restaurantId: string, drafts: PhotoUploadDraft[]) => {
    return uploadPhotosWithConfirm(`/api/v1/restaurants/${restaurantId}/photos`, drafts);
};

export const deleteDishPhotos = async (dishId: string, ids: string[]) => {
    return deletePhotos(`/api/v1/dishes/${dishId}/photos`, ids);
};

export const uploadDishPhotos = async (dishId: string, drafts: PhotoUploadDraft[]) => {
    return uploadPhotosWithConfirm(`/api/v1/dishes/${dishId}/photos`, drafts);
};
