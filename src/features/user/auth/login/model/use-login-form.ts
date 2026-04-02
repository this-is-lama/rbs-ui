import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';


import { getErrorMessage } from '../lib/get-error-message';
import { loginSchema, type LoginFormValues } from '../lib/login.schema';
import {loginUser} from "@/features/user/auth/login/api/login.ts";
import {tokenStorage} from "@/shared/lib/token-storage/token-storage.ts";

export const useLoginForm = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
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

            tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);

            form.reset();
            navigate('/');
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