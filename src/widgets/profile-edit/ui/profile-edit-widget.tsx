import { useLanguage } from '@/app/providers/language';
import { ChangePasswordForm } from '@/features/user/change-password';
import { EditProfileForm } from '@/features/user/edit-profile';
import styles from './ProfileEditWidget.module.scss';

export const ProfileEditWidget = () => {
    const { language } = useLanguage();

    const copy = language === 'en'
        ? {
            passwordDescription: 'After a successful password change, you will need to sign in again.',
            passwordTitle: 'Change password',
            personalDescription: 'You can update your name, surname, date of birth, phone number, and email here.',
            personalTitle: 'Personal details',
            subtitle: 'Update your personal information and sign-in settings in one place.',
            title: 'Edit profile',
        }
        : {
            passwordDescription: 'После успешной смены пароля потребуется снова войти в аккаунт.',
            passwordTitle: 'Смена пароля',
            personalDescription: 'Здесь можно изменить имя, фамилию, дату рождения, телефон и почту.',
            personalTitle: 'Личные данные',
            subtitle: 'Обновите личные данные и настройки входа в одном месте.',
            title: 'Редактирование профиля',
        };

    return (
        <div className={`container ${styles.wrapper}`}>
            <article className={styles.card}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.title}>{copy.title}</h1>
                    <p className={styles.pageDescription}>
                        {copy.subtitle}
                    </p>
                </div>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>{copy.personalTitle}</h2>
                            <p className={styles.sectionDescription}>
                                {copy.personalDescription}
                            </p>
                        </div>

                        <EditProfileForm />
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>{copy.passwordTitle}</h2>
                            <p className={styles.sectionDescription}>
                                {copy.passwordDescription}
                            </p>
                        </div>

                        <ChangePasswordForm />
                    </section>
                </div>
            </article>
        </div>
    );
};
