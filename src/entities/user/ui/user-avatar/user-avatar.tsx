import styles from './user-avatar.module.scss';

type UserAvatarProps = {
    className?: string;
};

export const UserAvatar = ({ className = '' }: UserAvatarProps) => {
    return (
        <div className={`${styles.avatar} ${className}`.trim()} aria-hidden="true">
            <svg
                viewBox="0 0 240 240"
                className={styles.icon}
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="120" cy="120" r="96" className={styles.circle} />
                <circle cx="120" cy="92" r="32" className={styles.head} />
                <path
                    d="M60 186C72 152 93 136 120 136C147 136 168 152 180 186"
                    className={styles.body}
                />
            </svg>
        </div>
    );
};
