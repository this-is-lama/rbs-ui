import type { PropsWithChildren, ReactNode } from 'react';
import { Logo } from '@/shared/ui/logo/Logo';
import styles from './AuthShell.module.scss';

type AuthShellProps = PropsWithChildren<{
    title: string;
    message?: ReactNode;
}>;

export const AuthShell = ({ title, message, children }: AuthShellProps) => {
    return (
        <section className={styles.page}>
            <div className={styles.card}>
                <div className={styles.content}>
                    <div className={styles.left}>
                        <h1 className={styles.title}>{title}</h1>
                        {message ? <div className={styles.message}>{message}</div> : null}
                        {children}
                    </div>

                    <div className={styles.right} aria-hidden="true">
                        <Logo className={styles.logo} />
                    </div>
                </div>
            </div>
        </section>
    );
};
