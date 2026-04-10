import { RegisterForm } from '@/features/user/auth/register/ui/register-form.tsx';
import { AuthShell } from '@/shared/ui/auth-shell/AuthShell.tsx';

export const RegistrationPage = () => {
    return (
        <AuthShell title="Регистрация">
            <RegisterForm />
        </AuthShell>
    );
};