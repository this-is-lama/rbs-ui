import { Input } from '@/shared/ui/input/input.tsx';
import { useLoginForm } from '../model/use-login-form';

export const LoginForm = () => {
    const {
        register,
        formState: { errors, isSubmitting },
        serverError,
        onSubmit,
    } = useLoginForm();

    return (
        <form onSubmit={onSubmit} className="surface-block" style={{ padding: '24px', display: 'grid', gap: '16px' }}>
            <Input
                label="Почта"
                type="email"
                placeholder="Введите почту"
                error={errors.email?.message}
                {...register('email')}
            />

            <Input
                label="Пароль"
                type="password"
                placeholder="Введите пароль"
                error={errors.password?.message}
                {...register('password')}
            />

            {serverError ? <div>{serverError}</div> : null}

            <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Вход...' : 'Войти'}
            </button>
        </form>
    );
};