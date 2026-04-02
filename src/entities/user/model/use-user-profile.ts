import { useEffect, useState } from 'react';
import type { UserProfile } from '../api/types';
import {getUserProfile} from "@/entities/user/api/get-user-profile.ts";

export const useUserProfile = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                setIsLoading(true);
                setError('');

                const data = await getUserProfile();
                setUser(data);
            } catch {
                setError('Не удалось загрузить профиль');
            } finally {
                setIsLoading(false);
            }
        };

        void loadUserProfile();
    }, []);

    return {
        user,
        isLoading,
        error,
    };
};