import { Outlet } from 'react-router-dom';
import styles from './MainLayout.module.scss';
import {Header} from "@/widgets/header/Header.tsx";

export const MainLayout = () => {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <Outlet />
            </main>
        </>
    );
};