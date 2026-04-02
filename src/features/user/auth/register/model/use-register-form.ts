import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormValues } from '../lib/register.schema';
import { registerUser } from '../api/register';
import { getErrorMessage } from '../lib/get-error-message';

export const useRegisterForm = () => {
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
            form.reset();
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