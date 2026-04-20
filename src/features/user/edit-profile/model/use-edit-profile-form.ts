import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editProfileSchema, type EditProfileFormValues } from './edit-profile.schema.ts';
import { updateUserProfile } from '@/entities/user/api';
import { useAuth } from '@/app/providers/auth';
import { getErrorMessage } from '../lib/get-error-message.ts';
import { RoutePaths } from '@/shared/config/routes';

export const useEditProfileForm = () => {
    const navigate = useNavigate();
    const { user, setUser, logout } = useAuth();
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const form = useForm<EditProfileFormValues>({
        resolver: zodResolver(editProfileSchema),
        mode: 'onBlur',
        defaultValues: {
            name: '',
            surname: '',
            dateOfBirth: '',
            phone: '',
            email: '',
        },
    });

    useEffect(() => {
        if (!user) {
            return;
        }

        form.reset({
            name: user.name ?? '',
            surname: user.surname ?? '',
            dateOfBirth: user.dateOfBirth ?? '',
            phone: user.phone ?? '',
            email: user.email ?? '',
        });
    }, [user, form]);

    const onSubmit = form.handleSubmit(async (values) => {
        try {
            setServerError('');
            setSuccessMessage('');

            const oldEmail = user?.email ?? '';

            const updatedUser = await updateUserProfile({
                name: values.name,
                surname: values.surname,
                dateOfBirth: values.dateOfBirth || null,
                phone: values.phone || null,
                email: values.email,
            });

            const emailChanged = oldEmail !== updatedUser.email;

            if (emailChanged) {
                await logout();
                navigate(RoutePaths.LOGIN, {
                    replace: true,
                    state: {
                        message: 'Почта успешно изменена. Войдите снова.',
                    },
                });
                return;
            }

            setUser(updatedUser);
            setSuccessMessage('Профиль успешно обновлён');
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    });

    return {
        ...form,
        serverError,
        successMessage,
        onSubmit,
    };
};
