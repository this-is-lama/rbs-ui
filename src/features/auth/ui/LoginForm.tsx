import { useState } from 'react';
import { Input } from '@/shared/ui/input';
import './AuthForm.scss';
import * as React from "react";

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();

        console.log({
            email,
            password,
        });
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <h2 className="auth-form__title">Вход</h2>

            <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите email"
            />

            <Input
                label="Пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
            />

            <button className="auth-form__button" type="submit">
                Войти
            </button>
        </form>
    );
};