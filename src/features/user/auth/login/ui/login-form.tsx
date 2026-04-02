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
        <form
            onSubmit={onSubmit}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
            }}
        >
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

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Вход...' : 'Войти'}
            </button>

            {serverError && (<div>{serverError}</div>)}
        </form>
    );
};