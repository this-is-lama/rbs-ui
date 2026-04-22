export type RegisterRequest = {
    name: string;
    surname: string;
    email: string;
    password: string;
    role: 'ROLE_MANAGER' | 'ROLE_USER';
};
