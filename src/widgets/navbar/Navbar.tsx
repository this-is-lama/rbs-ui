import {NavLink} from "react-router-dom";
import {RoutePaths} from "@/shared/config/routes.ts";

export const Navbar = () => {
    return (
        <>
            <NavLink to={RoutePaths.RESTAURANTS} >Рестораны</NavLink>
            <NavLink to={RoutePaths.BOOKING} >Бронирование</NavLink>
            <NavLink to={RoutePaths.PROFILE} >Профиль</NavLink>
        </>
    )
}