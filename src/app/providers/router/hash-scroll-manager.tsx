import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const getHashTarget = (hash: string) => {
    return hash.replace(/^#/, '');
};

export const HashScrollManager = () => {
    const location = useLocation();

    useEffect(() => {
        if (!location.hash) {
            return;
        }

        const targetId = getHashTarget(location.hash);
        let attempts = 0;
        let timeoutId: number | null = null;

        const tryScrollToTarget = () => {
            const element = document.getElementById(targetId);

            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
                return;
            }

            if (attempts >= 10) {
                return;
            }

            attempts += 1;
            timeoutId = window.setTimeout(tryScrollToTarget, 50);
        };

        tryScrollToTarget();

        return () => {
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [location.hash, location.pathname]);

    return null;
};
