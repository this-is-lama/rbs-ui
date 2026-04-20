import { createContext } from 'react';
import type { UserProfile } from '@/entities/user/model';

export type AuthContextValue = {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: UserProfile | null) => void;
    login: (accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => Promise<void>;
    loadProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
