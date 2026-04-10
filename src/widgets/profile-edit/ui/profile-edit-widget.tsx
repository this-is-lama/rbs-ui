import { UserAvatar } from '@/entities/user/ui/user-avatar.tsx';
import { EditProfileForm } from '@/features/user/edit-profile/ui/edit-profile-form.tsx';
import { ChangePasswordForm } from '@/features/user/change-password/ui/change-password-form.tsx';
import styles from './ProfileEditWidget.module.scss';

export const ProfileEditWidget = () => {
    return (
        <div className={`container ${styles.wrapper}`}>
            <article className={styles.card}>
                <h1 className={styles.title}>Редактирование профиля</h1>

                <div className={styles.visual}>
                    <UserAvatar />
                </div>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Личные данные</h2>
                            <p className={styles.sectionDescription}>
                                Здесь можно изменить имя, фамилию, дату рождения, телефон и почту.
                            </p>
                        </div>

                        <EditProfileForm />
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Смена пароля</h2>
                            <p className={styles.sectionDescription}>
                                После успешной смены пароля потребуется снова войти в аккаунт.
                            </p>
                        </div>

                        <ChangePasswordForm />
                    </section>
                </div>
            </article>
        </div>
    );
};