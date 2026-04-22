import {Outlet} from "react-router-dom";
import {Header} from "@/widgets/header/Header.tsx";
import { PageTransition } from './page-transition/page-transition.tsx';

export const HomeLayout = () => {
    return (
        <>
            <Header />
            <main>
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </main>
        </>
    )
}

