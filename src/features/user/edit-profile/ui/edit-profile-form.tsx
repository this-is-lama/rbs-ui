import { Input } from '@/shared/ui/input/input.tsx';
import { useEditProfileForm } from '../model/use-edit-profile-form.ts';

export const EditProfileForm = () => {
    const {
        register,
        formState: { errors, isSubmitting },
        serverError,
        successMessage,
        onSubmit,
    } = useEditProfileForm();

    return (
        <form onSubmit={onSubmit} className="surface-block" style={{ padding: '24px', display: 'grid', gap: '16px' }}>
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
                label="Дата рождения"
                type="date"
                error={errors.dateOfBirth?.message}
                {...register('dateOfBirth')}
            />

            <Input
                label="Телефон"
                placeholder="Введите телефон"
                error={errors.phone?.message}
                {...register('phone')}
            />

            <Input
                label="Почта"
                type="email"
                placeholder="Введите почту"
                error={errors.email?.message}
                {...register('email')}
            />

            {serverError ? <div>{serverError}</div> : null}
            {successMessage ? <div style={{ color: 'green' }}>{successMessage}</div> : null}

            <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
        </form>
    );
};