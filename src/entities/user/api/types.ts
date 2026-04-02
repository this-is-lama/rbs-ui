export type UserProfile = {
    id: string;
    name: string;
    surname: string;
    dateOfBirth: string | null;
    phone: string | null;
    email: string;
    role: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
};