import {Outlet} from "react-router-dom";
import { PageTransition } from './page-transition/page-transition.tsx';

export const AuthLayout = () => {
    return (
        <>
            <main>
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </main>
        </>
    )
}
