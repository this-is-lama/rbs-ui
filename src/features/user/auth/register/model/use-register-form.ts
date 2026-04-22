import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/app/providers/language';
import { useAuth } from '@/app/providers/auth';
import { loginUser } from '@/features/user/auth/login/api';
import { RoutePaths } from '@/shared/config/routes';
import { registerUser } from '../api/register';
import { getErrorMessage } from '../lib/get-error-message';
import { createRegisterSchema, type RegisterFormValues } from '../lib/register.schema';

export const useRegisterForm = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const { login } = useAuth();
    const [serverError, setServerError] = useState('');
    const schema = useMemo(() => createRegisterSchema(language), [language]);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(schema),
        mode: 'onBlur',
        defaultValues: {
            name: '',
            surname: '',
            email: '',
            role: 'ROLE_USER',
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
            setServerError(getErrorMessage(error, language));
        }
    });

    return {
        ...form,
        onSubmit,
        serverError,
    };
};
