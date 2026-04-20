import { Route, Routes } from 'react-router-dom';
import {
    BookingPage,
    DishManagePage,
    DishPage,
    HomePage,
    LoginPage,
    MyRestaurantsPage,
    NotFoundPage,
    ProfilePage,
    RegistrationPage,
    RestaurantBookingsPage,
    RestaurantLayoutPage,
    RestaurantManagePage,
    RestaurantPage,
    RestaurantsPage,
} from '@/pages';
import { ProfileEditPage } from '@/pages';
import { RoutePaths } from '@/shared/config/routes';
import { AuthLayout, HomeLayout, MainLayout } from '@/shared/ui/layouts';
import { GuestOnlyRoute } from './guest-only-route.tsx';
import { ProtectedRoute } from './protected-route.tsx';
import { RoleProtectedRoute } from './role-protected-route.tsx';

export const Router = () => {
    return (
        <Routes>
            <Route element={<HomeLayout />}>
                <Route path={RoutePaths.HOME} element={<HomePage />} />
            </Route>

            <Route element={<MainLayout />}>
                <Route path={RoutePaths.RESTAURANTS} element={<RestaurantsPage />} />
                <Route path={RoutePaths.RESTAURANT} element={<RestaurantPage />} />
                <Route path={RoutePaths.DISH} element={<DishPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route path={RoutePaths.PROFILE} element={<ProfilePage />} />
                    <Route path={RoutePaths.PROFILE_EDIT} element={<ProfileEditPage />} />
                    <Route path={RoutePaths.BOOKING} element={<BookingPage />} />
                </Route>
            </Route>

            <Route element={<RoleProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route path={RoutePaths.MY_RESTAURANTS} element={<MyRestaurantsPage />} />
                    <Route path={RoutePaths.MY_RESTAURANT_NEW} element={<RestaurantManagePage />} />
                    <Route path={RoutePaths.MY_RESTAURANT_EDIT} element={<RestaurantManagePage />} />
                    <Route path={RoutePaths.MY_RESTAURANT_BOOKINGS} element={<RestaurantBookingsPage />} />
                    <Route path={RoutePaths.MY_RESTAURANT_LAYOUT} element={<RestaurantLayoutPage />} />
                    <Route path={RoutePaths.MY_RESTAURANT_DISH_NEW} element={<DishManagePage />} />
                    <Route path={RoutePaths.MY_RESTAURANT_DISH_EDIT} element={<DishManagePage />} />
                </Route>
            </Route>

            <Route element={<GuestOnlyRoute />}>
                <Route element={<AuthLayout />}>
                    <Route path={RoutePaths.LOGIN} element={<LoginPage />} />
                    <Route path={RoutePaths.REGISTRATION} element={<RegistrationPage />} />
                </Route>
            </Route>

            <Route path={RoutePaths.NOT_FOUND} element={<NotFoundPage />} />
        </Routes>
    );
};
