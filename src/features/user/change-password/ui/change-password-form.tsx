import { Input } from '@/shared/ui/input/input.tsx';
import { useChangePasswordForm } from '../model/use-change-password-form.ts';

export const ChangePasswordForm = () => {
    const {
        register,
        formState: { errors, isSubmitting },
        serverError,
        onSubmit,
    } = useChangePasswordForm();

    return (
        <form onSubmit={onSubmit} className="surface-block" style={{ padding: '24px', display: 'grid', gap: '16px' }}>
            <Input
                label="Текущий пароль"
                type="password"
                placeholder="Введите текущий пароль"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
            />

            <Input
                label="Новый пароль"
                type="password"
                placeholder="Введите новый пароль"
                error={errors.newPassword?.message}
                {...register('newPassword')}
            />

            <Input
                label="Подтверждение нового пароля"
                type="password"
                placeholder="Повторите новый пароль"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
            />

            {serverError ? <div>{serverError}</div> : null}

            <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Изменить пароль'}
            </button>
        </form>
    );
};