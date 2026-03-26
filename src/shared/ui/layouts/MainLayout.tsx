import {Outlet} from "react-router-dom";
import {Navbar} from "@/widgets/Navigation/Navbar.tsx";

export const MainLayout = () => {
    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>
        </>
    )
}