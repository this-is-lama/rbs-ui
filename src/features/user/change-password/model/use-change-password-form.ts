import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePassword } from '@/entities/user/api';
import { useAuth } from '@/app/providers/auth';
import { RoutePaths } from '@/shared/config/routes';
import { changePasswordSchema, type ChangePasswordFormValues } from './change-password.schema.ts';
import { getErrorMessage } from '../lib/get-error-message.ts';

export const useChangePasswordForm = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [serverError, setServerError] = useState('');

    const form = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        mode: 'onBlur',
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = form.handleSubmit(async (values) => {
        try {
            setServerError('');

            await changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });

            form.reset();

            await logout();
            navigate(RoutePaths.LOGIN, {
                replace: true,
                state: {
                    message: 'Пароль успешно изменён. Войдите снова.',
                },
            });
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    });

    return {
        ...form,
        serverError,
        onSubmit,
    };
};
