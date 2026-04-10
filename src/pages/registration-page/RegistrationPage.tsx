import { RegisterForm } from '@/features/user/auth/register/ui/register-form.tsx';

export const RegistrationPage = () => {
    return (
        <div className="container" style={{ display: 'grid', gap: '24px', paddingBottom: '48px', maxWidth: '560px' }}>
            <h1 className="page-title">Регистрация</h1>
            <RegisterForm />
        </div>
    );
};