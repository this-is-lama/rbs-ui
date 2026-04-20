import { useState } from 'react';

import { Button } from '@/shared/ui/button';
import { useLogout } from '../model/use-logout';

export const LogoutButton = () => {
    const { logout } = useLogout();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoading(true);
            await logout();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleLogout} disabled={isLoading}>
            {isLoading ? 'Выход...' : 'Выйти'}
        </Button>
    );
};
