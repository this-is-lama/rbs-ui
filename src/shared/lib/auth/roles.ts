import type { UserRole } from '@/entities/user/model/types.ts';

export const isAdminRole = (role?: string | null): role is 'ROLE_ADMIN' => {
    return role === 'ROLE_ADMIN';
};

export const canManageRestaurants = (role?: string | null): role is UserRole => {
    return role === 'ROLE_MANAGER' || role === 'ROLE_ADMIN';
};
