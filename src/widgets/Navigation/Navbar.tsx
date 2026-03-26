import {NavLink} from "react-router-dom";
import {RoutePaths} from "@/shared/config/routes.ts";

export const Navbar = () => {
    return (
        <header className="navbar">
            <div className="navbar__container">
                <NavLink to={RoutePaths.HOME} className="navbar__logo">
                    RBS
                </NavLink>

                <nav className="navbar__nav">
                    <NavLink to={RoutePaths.HOME} >
                        Главная
                    </NavLink>

                    <NavLink to={RoutePaths.RESTAURANTS} >
                        Рестораны
                    </NavLink>

                    <NavLink to={RoutePaths.BOOKING} >
                        Бронь
                    </NavLink>

                    <NavLink to={RoutePaths.PROFILE} >
                        Профиль
                    </NavLink>
                </nav>

                <div className="navbar__auth">
                    <NavLink to={RoutePaths.LOGIN} >
                        Вход
                    </NavLink>

                    <NavLink to={RoutePaths.REGISTRATION} >
                        Регистрация
                    </NavLink>
                </div>
            </div>
        </header>
    )
}