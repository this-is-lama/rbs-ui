import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormValues } from '../lib/register.schema';
import { registerUser } from '../api/register';
import { getErrorMessage } from '../lib/get-error-message';
import { loginUser } from '@/features/user/auth/login/api/login.ts';
import { useAuth } from '@/app/providers/auth/use-auth.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';

export const useRegisterForm = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [serverError, setServerError] = useState('');

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        mode: 'onBlur',
        defaultValues: {
            name: '',
            surname: '',
            email: '',
            password: '',
        },
    });

    const onSubmit = form.handleSubmit(async (values) => {
        try {
            setServerError('');

            await registerUser(values);

            const tokens = await loginUser({
                email: values.email,
                password: values.password,
            });

            await login(tokens.accessToken, tokens.refreshToken);

            form.reset();
            navigate(RoutePaths.PROFILE);
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