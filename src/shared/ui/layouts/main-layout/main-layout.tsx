import { Outlet } from 'react-router-dom';
import { PageTransition } from '../page-transition/page-transition.tsx';
import styles from './MainLayout.module.scss';
import {Header} from "@/widgets/header/Header.tsx";

export const MainLayout = () => {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </main>
        </>
    );
};
