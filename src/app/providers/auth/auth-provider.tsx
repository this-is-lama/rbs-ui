import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { tokenStorage } from '@/shared/lib/token-storage/token-storage.ts';
import { getUserProfile } from '@/entities/user/api/get-user-profile.ts';
import { logoutUser } from '@/features/user/auth/logout/api/logout.ts';
import type { UserProfile } from '@/entities/user/model/types';
import { AuthContext } from './auth-context.ts';

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadProfile = useCallback(async () => {
        const accessToken = tokenStorage.getAccessToken();

        if (!accessToken) {
            setUser(null);
            return;
        }

        try {
            const profile = await getUserProfile();
            setUser(profile);
        } catch {
            tokenStorage.clear();
            setUser(null);
        }
    }, []);

    const login = useCallback(async (accessToken: string, refreshToken: string) => {
        tokenStorage.setTokens(accessToken, refreshToken);
        await loadProfile();
    }, [loadProfile]);

    const logout = useCallback(async () => {
        const refreshToken = tokenStorage.getRefreshToken();

        try {
            if (refreshToken) {
                await logoutUser({ refreshToken });
            }
        } catch {
            // ignore backend logout error
        } finally {
            tokenStorage.clear();
            setUser(null);
            window.dispatchEvent(new Event('auth:logout'));
        }
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            try {
                await loadProfile();
            } finally {
                setIsLoading(false);
            }
        };

        void initAuth();
    }, [loadProfile]);

    useEffect(() => {
        const handleExternalLogout = () => {
            setUser(null);
            setIsLoading(false);
        };

        window.addEventListener('auth:logout', handleExternalLogout);

        return () => {
            window.removeEventListener('auth:logout', handleExternalLogout);
        };
    }, []);

    const value = useMemo(() => {
        return {
            user,
            isAuthenticated: Boolean(user),
            isLoading,
            setUser,
            login,
            logout,
            loadProfile,
        };
    }, [user, isLoading, login, logout, loadProfile]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};