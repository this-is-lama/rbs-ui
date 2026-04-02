import { Input } from '@/shared/ui/input/input.tsx';
import { useRegisterForm } from '../model/use-register-form';

export const RegisterForm = () => {
    const {
        register,
        formState: { errors, isSubmitting },
        serverError,
        onSubmit,
    } = useRegisterForm();

    return (
        <form  onSubmit={onSubmit}>
            <Input
                label="Имя"
                placeholder="Введите имя"
                error={errors.name?.message}
                {...register('name')}
            />

            <Input
                label="Фамилия"
                placeholder="Введите фамилию"
                error={errors.surname?.message}
                {...register('surname')}
            />

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

            <button  type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>

            {serverError && <div>{serverError}</div>}
        </form>
    );
};