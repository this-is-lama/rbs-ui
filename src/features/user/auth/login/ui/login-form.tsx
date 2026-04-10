import { Link } from 'react-router-dom';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { useLoginForm } from '../model/use-login-form';
import styles from '../../shared/AuthForm.module.scss';

export const LoginForm = () => {
    const {
        register,
        formState: { errors, isSubmitting },
        serverError,
        onSubmit,
    } = useLoginForm();

    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.field}>
                <input
                    className={styles.input}
                    type="email"
                    placeholder="Почта"
                    aria-label="Почта"
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
                    placeholder="Пароль"
                    aria-label="Пароль"
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
                    {isSubmitting ? 'Вход...' : 'Войти'}
                </button>

                <Link to={RoutePaths.REGISTRATION} className={styles.secondaryButton}>
                    Регистрация
                </Link>
            </div>
        </form>
    );
};