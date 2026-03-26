import {Outlet} from "react-router-dom";
import {Navbar} from "@/widgets/Navigation/Navbar.tsx";

export const AuthLayout = () => {
    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>
        </>
    )
}