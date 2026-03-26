import {Route, Routes} from "react-router-dom";
import {HomePage, NotFoundPage, RestaurantsPage} from "@/pages";
import {RoutePaths} from "@/shared/config/routes.ts";
import {HomeLayout} from "@/shared/ui/layouts";

export const Router = () => {
    return (
        <Routes>
            <Route element={<HomeLayout />}>
                <Route path={RoutePaths.HOME} element={<HomePage />} />
            </Route>
            <Route path={RoutePaths.RESTAURANTS} element={<RestaurantsPage />} />
            <Route path={RoutePaths.NOT_FOUND} element={<NotFoundPage />} />
        </Routes>
    )
}

