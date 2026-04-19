import type { ReactNode } from 'react';
import type { UserProfile } from '../../model/types.ts';
import type { AppLanguage } from '@/shared/config/language.ts';
import { EditIcon } from '@/shared/ui/icons/action-icons.tsx';
import { resolveIntlLocale } from '@/shared/config/language.ts';
import styles from './user-profile-card.module.scss';

type UserProfileCardProps = {
    headerAction?: ReactNode;
    locale?: AppLanguage;
    onEditProfile: () => void;
    onLogout: () => void;
    user: UserProfile;
};

const profileCardCopy = {
    ru: {
        dateOfBirth: 'Дата рождения',
        editProfile: 'Редактировать профиль',
        email: 'Почта',
        name: 'Имя',
        notSpecified: 'Не указано',
        phone: 'Телефон',
        profile: 'Профиль',
        role: 'Роль',
        roles: {
            ROLE_ADMIN: 'Администратор',
            ROLE_MANAGER: 'Менеджер',
            ROLE_USER: 'Пользователь',
        } as Record<string, string>,
        surname: 'Фамилия',
        logout: 'Выйти',
    },
    en: {
        dateOfBirth: 'Date of birth',
        editProfile: 'Edit profile',
        email: 'Email',
        name: 'Name',
        notSpecified: 'Not specified',
        phone: 'Phone',
        profile: 'Profile',
        role: 'Role',
        roles: {
            ROLE_ADMIN: 'Administrator',
            ROLE_MANAGER: 'Manager',
            ROLE_USER: 'User',
        } as Record<string, string>,
        surname: 'Surname',
        logout: 'Log out',
    },
} satisfies Record<AppLanguage, {
    dateOfBirth: string;
    editProfile: string;
    email: string;
    logout: string;
    name: string;
    notSpecified: string;
    phone: string;
    profile: string;
    role: string;
    roles: Record<string, string>;
    surname: string;
}>;

const getDisplayValue = (
    value: string | null | undefined,
    emptyLabel: string,
) => {
    if (!value) {
        return emptyLabel;
    }

    return value;
};

const formatDateOfBirth = (
    value: string | null | undefined,
    locale: AppLanguage,
    emptyLabel: string,
) => {
    if (!value) {
        return emptyLabel;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
        dateStyle: 'long',
    }).format(parsedDate);
};

const getRoleLabel = (role: string, locale: AppLanguage) => {
    return profileCardCopy[locale].roles[role] ?? role;
};

export const UserProfileCard = ({
    headerAction,
    locale = 'ru',
    onEditProfile,
    onLogout,
    user,
}: UserProfileCardProps) => {
    const isRegularUser = user.role === 'ROLE_USER';
    const copy = profileCardCopy[locale];

    return (
        <article className={styles.card}>
            <div className={styles.header}>
                <h1 className={styles.title}>{copy.profile}</h1>
                {headerAction ? (
                    <div className={styles.headerAction}>{headerAction}</div>
                ) : null}
            </div>

            <div className={styles.info}>
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <span className={styles.label}>{copy.name}</span>
                        <span className={styles.value}>
                            {getDisplayValue(user.name, copy.notSpecified)}
                        </span>
                    </div>

                    <div className={styles.field}>
                        <span className={styles.label}>{copy.surname}</span>
                        <span className={styles.value}>
                            {getDisplayValue(user.surname, copy.notSpecified)}
                        </span>
                    </div>

                    <div className={styles.field}>
                        <span className={styles.label}>{copy.dateOfBirth}</span>
                        <span className={styles.value}>
                            {formatDateOfBirth(user.dateOfBirth, locale, copy.notSpecified)}
                        </span>
                    </div>

                    <div className={styles.field}>
                        <span className={styles.label}>{copy.phone}</span>
                        <span className={styles.value}>
                            {getDisplayValue(user.phone, copy.notSpecified)}
                        </span>
                    </div>

                    <div className={styles.field}>
                        <span className={styles.label}>{copy.email}</span>
                        <span className={styles.value}>
                            {getDisplayValue(user.email, copy.notSpecified)}
                        </span>
                    </div>

                    {!isRegularUser ? (
                        <div className={styles.field}>
                            <span className={styles.label}>{copy.role}</span>
                            <span className={styles.value}>
                                {getRoleLabel(user.role, locale)}
                            </span>
                        </div>
                    ) : null}
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.iconButton}
                        onClick={onEditProfile}
                        aria-label={copy.editProfile}
                        title={copy.editProfile}
                    >
                        <EditIcon className={styles.iconButtonIcon} />
                    </button>

                    <button
                        type="button"
                        className={styles.ghostButton}
                        onClick={onLogout}
                    >
                        {copy.logout}
                    </button>
                </div>
            </div>
        </article>
    );
};
