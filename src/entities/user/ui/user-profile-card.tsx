import { EditIcon } from '@/shared/ui/icons/action-icons.tsx';
import type { UserProfile } from '../model/types.ts';
import styles from './UserProfileCard.module.scss';

type UserProfileCardProps = {
    user: UserProfile;
    onEditProfile: () => void;
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
    onLogout,
}: UserProfileCardProps) => {
    const isRegularUser = user.role === 'ROLE_USER';

    return (
        <article className={styles.card}>
            <h1 className={styles.title}>Профиль</h1>

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
                        className={styles.iconButton}
                        onClick={onEditProfile}
                        aria-label="Редактировать профиль"
                        title="Редактировать профиль"
                    >
                        <EditIcon className={styles.iconButtonIcon} />
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
