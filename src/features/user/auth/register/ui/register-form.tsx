import { useRegisterForm } from '../model/use-register-form';
import styles from '../../shared/AuthForm.module.scss';

export const RegisterForm = () => {
    const {
        register,
        formState: { errors, isSubmitting },
        serverError,
        onSubmit,
    } = useRegisterForm();

    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.field}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Имя"
                    aria-label="Имя"
                    autoComplete="given-name"
                    autoFocus
                    {...register('name')}
                />
                {errors.name?.message ? (
                    <div className={styles.error}>{errors.name.message}</div>
                ) : null}
            </div>

            <div className={styles.field}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Фамилия"
                    aria-label="Фамилия"
                    autoComplete="family-name"
                    {...register('surname')}
                />
                {errors.surname?.message ? (
                    <div className={styles.error}>{errors.surname.message}</div>
                ) : null}
            </div>

            <div className={styles.field}>
                <input
                    className={styles.input}
                    type="email"
                    placeholder="Почта"
                    aria-label="Почта"
                    autoComplete="email"
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
                    autoComplete="new-password"
                    {...register('password')}
                />
                {errors.password?.message ? (
                    <div className={styles.error}>{errors.password.message}</div>
                ) : null}
            </div>

            {serverError ? <div className={styles.serverError}>{serverError}</div> : null}

            <div className={styles.actions}>
                <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
            </div>
        </form>
    );
};