import { useChangePasswordForm } from '../model/use-change-password-form.ts';
import styles from '@/features/user/profile-settings/ui/ProfileSettingsForm.module.scss';

export const ChangePasswordForm = () => {
    const {
        register,
        formState: { errors, isSubmitting },
        serverError,
        onSubmit,
    } = useChangePasswordForm();

    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.grid}>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label htmlFor="currentPassword" className={styles.label}>Текущий пароль</label>
                    <input
                        id="currentPassword"
                        className={styles.input}
                        type="password"
                        placeholder="Введите текущий пароль"
                        autoComplete="current-password"
                        {...register('currentPassword')}
                    />
                    {errors.currentPassword?.message ? (
                        <div className={styles.error}>{errors.currentPassword.message}</div>
                    ) : null}
                </div>

                <div className={styles.field}>
                    <label htmlFor="newPassword" className={styles.label}>Новый пароль</label>
                    <input
                        id="newPassword"
                        className={styles.input}
                        type="password"
                        placeholder="Введите новый пароль"
                        autoComplete="new-password"
                        {...register('newPassword')}
                    />
                    {errors.newPassword?.message ? (
                        <div className={styles.error}>{errors.newPassword.message}</div>
                    ) : null}
                </div>

                <div className={styles.field}>
                    <label htmlFor="confirmPassword" className={styles.label}>Подтверждение пароля</label>
                    <input
                        id="confirmPassword"
                        className={styles.input}
                        type="password"
                        placeholder="Повторите новый пароль"
                        autoComplete="new-password"
                        {...register('confirmPassword')}
                    />
                    {errors.confirmPassword?.message ? (
                        <div className={styles.error}>{errors.confirmPassword.message}</div>
                    ) : null}
                </div>
            </div>

            {serverError ? <div className={styles.serverError}>{serverError}</div> : null}

            <div className={styles.actions}>
                <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Сохранение...' : 'Изменить пароль'}
                </button>
            </div>
        </form>
    );
};