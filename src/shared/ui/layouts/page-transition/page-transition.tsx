import type { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.scss';

export const PageTransition = ({ children }: PropsWithChildren) => {
    const location = useLocation();

    return (
        <div className={styles.stage}>
            <div key={location.pathname} className={styles.page}>
                {children}
            </div>
        </div>
    );
};
