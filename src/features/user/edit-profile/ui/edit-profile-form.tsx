import { useEditProfileForm } from '../model/use-edit-profile-form.ts';
import styles from '@/features/user/profile-settings/ui/ProfileSettingsForm.module.scss';

export const EditProfileForm = () => {
    const {
        register,
        formState: { errors, isSubmitting },
        serverError,
        successMessage,
        onSubmit,
    } = useEditProfileForm();

    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.grid}>
                <div className={styles.field}>
                    <label htmlFor="name" className={styles.label}>Имя</label>
                    <input
                        id="name"
                        className={styles.input}
                        placeholder="Введите имя"
                        autoComplete="given-name"
                        {...register('name')}
                    />
                    {errors.name?.message ? (
                        <div className={styles.error}>{errors.name.message}</div>
                    ) : null}
                </div>

                <div className={styles.field}>
                    <label htmlFor="surname" className={styles.label}>Фамилия</label>
                    <input
                        id="surname"
                        className={styles.input}
                        placeholder="Введите фамилию"
                        autoComplete="family-name"
                        {...register('surname')}
                    />
                    {errors.surname?.message ? (
                        <div className={styles.error}>{errors.surname.message}</div>
                    ) : null}
                </div>

                <div className={styles.field}>
                    <label htmlFor="dateOfBirth" className={styles.label}>Дата рождения</label>
                    <input
                        id="dateOfBirth"
                        className={styles.input}
                        type="date"
                        {...register('dateOfBirth')}
                    />
                    {errors.dateOfBirth?.message ? (
                        <div className={styles.error}>{errors.dateOfBirth.message}</div>
                    ) : null}
                </div>

                <div className={styles.field}>
                    <label htmlFor="phone" className={styles.label}>Телефон</label>
                    <input
                        id="phone"
                        className={styles.input}
                        placeholder="Введите телефон"
                        autoComplete="tel"
                        {...register('phone')}
                    />
                    {errors.phone?.message ? (
                        <div className={styles.error}>{errors.phone.message}</div>
                    ) : null}
                </div>

                <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label htmlFor="email" className={styles.label}>Почта</label>
                    <input
                        id="email"
                        className={styles.input}
                        type="email"
                        placeholder="Введите почту"
                        autoComplete="email"
                        {...register('email')}
                    />
                    {errors.email?.message ? (
                        <div className={styles.error}>{errors.email.message}</div>
                    ) : null}
                </div>
            </div>

            {serverError ? <div className={styles.serverError}>{serverError}</div> : null}
            {successMessage ? <div className={styles.successMessage}>{successMessage}</div> : null}

            <div className={styles.actions}>
                <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </div>
        </form>
    );
};