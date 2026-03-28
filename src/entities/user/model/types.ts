export type UserRole = 'ROLE_USER' | 'ROLE_MANAGER' | 'ROLE_ADMIN';

export interface User {
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
}