export type UserRole = 'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_USER' | string;

export type RestaurantLookupUser = {
    id: string;
    name: string;
    surname: string;
    email: string;
    role: UserRole;
    enabled: boolean;
};

export type UserProfile = {
    id: string;
    name: string;
    surname: string;
    dateOfBirth: string | null;
    phone: string | null;
    email: string;
    role: UserRole;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
};
