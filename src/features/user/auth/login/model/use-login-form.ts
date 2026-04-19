import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/app/providers/language';
import { useAuth } from '@/app/providers/auth/use-auth.ts';
import { loginUser } from '@/features/user/auth/login/api/login.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { getErrorMessage } from '../lib/get-error-message';
import { createLoginSchema, type LoginFormValues } from '../lib/login.schema';

type LocationState = {
    from?: {
        pathname?: string;
    };
};

export const useLoginForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useLanguage();
    const { login } = useAuth();
    const [serverError, setServerError] = useState('');
    const schema = useMemo(() => createLoginSchema(language), [language]);

    const state = location.state as LocationState | null;
    const from = state?.from?.pathname || RoutePaths.PROFILE;

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(schema),
        mode: 'onBlur',
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = form.handleSubmit(async (values) => {
        try {
            setServerError('');

            const tokens = await loginUser(values);

            await login(tokens.accessToken, tokens.refreshToken);

            form.reset();
            navigate(from, { replace: true });
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
