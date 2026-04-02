import {NavLink} from "react-router-dom";
import {RoutePaths} from "@/shared/config/routes/routes.ts";
import {tokenStorage} from "@/shared/lib/token-storage/token-storage.ts";
import {Button} from "@/shared/ui/button/button.tsx";

export const Navbar = () => {
    const isAuthenticated = !!tokenStorage.getAccessToken();

    return (
        <nav>
            <NavLink to={RoutePaths.RESTAURANTS}>Рестораны</NavLink>
            <NavLink to={RoutePaths.BOOKING}>Бронирование</NavLink>

            {isAuthenticated ? (
                <NavLink to={RoutePaths.PROFILE}>Профиль</NavLink>
            ) : (
                <NavLink to={RoutePaths.LOGIN}>
                    <Button>Войти</Button>
                </NavLink>
            )}
        </nav>
    );
}