import { useState } from 'react';
import { Input } from '@/shared/ui/input';
import styles from './AuthForm.module.scss';
import * as React from "react";

export const RegisterForm = () => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();

        console.log({
            name,
            surname,
            email,
            password,
        });
    };

    return (
        <form className={styles.authForm} onSubmit={handleSubmit}>
            <h2 className={styles.authForm__title}>Регистрация</h2>

            <Input
                label="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите имя"
            />

            <Input
                label="Фамилия"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Введите фамилию"
            />

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

            <button className={styles.authForm__button} type="submit">
                Зарегистрироваться
            </button>
        </form>
    );
};