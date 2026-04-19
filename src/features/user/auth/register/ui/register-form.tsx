import { useLanguage } from '@/app/providers/language';
import { useRegisterForm } from '../model/use-register-form';
import styles from '../../shared/AuthForm.module.scss';

export const RegisterForm = () => {
    const { language } = useLanguage();
    const {
        register,
        formState: { errors, isSubmitting },
        serverError,
        onSubmit,
    } = useRegisterForm();

    const copy = language === 'en'
        ? {
            email: 'Email',
            name: 'Name',
            password: 'Password',
            register: 'Create account',
            registerLoading: 'Creating account...',
            surname: 'Surname',
        }
        : {
            email: 'Почта',
            name: 'Имя',
            password: 'Пароль',
            register: 'Зарегистрироваться',
            registerLoading: 'Регистрация...',
            surname: 'Фамилия',
        };

    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.field}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder={copy.name}
                    aria-label={copy.name}
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
                    placeholder={copy.surname}
                    aria-label={copy.surname}
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
                    placeholder={copy.email}
                    aria-label={copy.email}
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
                    placeholder={copy.password}
                    aria-label={copy.password}
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
                    {isSubmitting ? copy.registerLoading : copy.register}
                </button>
            </div>
        </form>
    );
};
