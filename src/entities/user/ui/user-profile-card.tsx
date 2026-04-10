import type { UserProfile } from '../model/types.ts';
import { UserAvatar } from './user-avatar.tsx';
import styles from './UserProfileCard.module.scss';

type UserProfileCardProps = {
    user: UserProfile;
    onEditProfile: () => void;
    onOpenBookings: () => void;
    onLogout: () => void;
};

const getDisplayValue = (value: string | null | undefined) => {
    if (!value) {
        return 'Не указано';
    }

    return value;
};

const getRoleLabel = (role: string) => {
    switch (role) {
        case 'ROLE_ADMIN':
            return 'Администратор';
        case 'ROLE_MANAGER':
            return 'Менеджер';
        case 'ROLE_USER':
            return 'Пользователь';
        default:
            return role;
    }
};

export const UserProfileCard = ({
                                    user,
                                    onEditProfile,
                                    onOpenBookings,
                                    onLogout,
                                }: UserProfileCardProps) => {
    const isRegularUser = user.role === 'ROLE_USER';

    return (
        <article className={styles.card}>
            <h1 className={styles.title}>Профиль</h1>

            <div className={styles.visual}>
                <UserAvatar />
            </div>

            <div className={styles.info}>
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <span className={styles.label}>Имя</span>
                        <span className={styles.value}>{getDisplayValue(user.name)}</span>
                    </div>

                    <div className={styles.field}>
                        <span className={styles.label}>Фамилия</span>
                        <span className={styles.value}>{getDisplayValue(user.surname)}</span>
                    </div>

                    <div className={styles.field}>
                        <span className={styles.label}>Дата рождения</span>
                        <span className={styles.value}>{getDisplayValue(user.dateOfBirth)}</span>
                    </div>

                    <div className={styles.field}>
                        <span className={styles.label}>Телефон</span>
                        <span className={styles.value}>{getDisplayValue(user.phone)}</span>
                    </div>

                    <div className={styles.field}>
                        <span className={styles.label}>Почта</span>
                        <span className={styles.value}>{getDisplayValue(user.email)}</span>
                    </div>

                    {!isRegularUser ? (
                        <div className={styles.field}>
                            <span className={styles.label}>Роль</span>
                            <span className={styles.value}>{getRoleLabel(user.role)}</span>
                        </div>
                    ) : null}
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={onEditProfile}
                    >
                        Редактировать профиль
                    </button>

                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={onOpenBookings}
                    >
                        Мои бронирования
                    </button>

                    <button
                        type="button"
                        className={styles.ghostButton}
                        onClick={onLogout}
                    >
                        Выйти
                    </button>
                </div>
            </div>
        </article>
    );
};