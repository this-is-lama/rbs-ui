import { Route, Routes } from 'react-router-dom';
import {
    BookingPage,
    DishPage,
    HomePage,
    LoginPage,
    NotFoundPage,
    ProfilePage,
    RegistrationPage,
    RestaurantPage,
    RestaurantsPage,
} from '@/pages';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { AuthLayout, HomeLayout, MainLayout } from '@/shared/ui/layouts';
import { ProtectedRoute } from './protected-route.tsx';
import { GuestOnlyRoute } from './guest-only-route.tsx';
import { ProfileEditPage } from '@/pages/profile-edit-page/ProfileEditPage.tsx';

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
                <Route path={RoutePaths.PROFILE} element={<ProfilePage />} />
                <Route path={RoutePaths.BOOKING} element={<BookingPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route path={RoutePaths.PROFILE_EDIT} element={<ProfileEditPage />} />
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