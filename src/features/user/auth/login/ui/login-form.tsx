import { Link } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import { RoutePaths } from '@/shared/config/routes';
import { useLoginForm } from '../model/use-login-form';
import styles from '../../shared/AuthForm.module.scss';

export const LoginForm = () => {
    const { language } = useLanguage();
    const {
        register,
        formState: { errors, isSubmitting },
        serverError,
        onSubmit,
    } = useLoginForm();

    const copy = language === 'en'
        ? {
            email: 'Email',
            login: 'Sign in',
            loginLoading: 'Signing in...',
            password: 'Password',
            registration: 'Create account',
        }
        : {
            email: 'Почта',
            login: 'Войти',
            loginLoading: 'Вход...',
            password: 'Пароль',
            registration: 'Регистрация',
        };

    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.field}>
                <input
                    className={styles.input}
                    type="email"
                    placeholder={copy.email}
                    aria-label={copy.email}
                    autoComplete="email"
                    autoFocus
                    {...register('email')}
                />
                {errors.email?.message ? (
                    <div className={styles.error}>{errors.email.message}</div>
                ) : null}
            </div>

            <div className={styles.field}>
                <input
                    className={styles.input}
                    type="password"
                    placeholder={copy.password}
                    aria-label={copy.password}
                    autoComplete="current-password"
                    {...register('password')}
                />
                {errors.password?.message ? (
                    <div className={styles.error}>{errors.password.message}</div>
                ) : null}
            </div>

            {serverError ? <div className={styles.serverError}>{serverError}</div> : null}

            <div className={styles.actions}>
                <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
                    {isSubmitting ? copy.loginLoading : copy.login}
                </button>

                <Link to={RoutePaths.REGISTRATION} className={styles.secondaryButton}>
                    {copy.registration}
                </Link>
            </div>
        </form>
    );
};
