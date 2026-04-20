import { UserProfileWidget } from '@/widgets/user-profile';
import styles from './ProfilePage.module.scss';

export const ProfilePage = () => {
    return (
        <div className={`container ${styles.page}`}>
            <UserProfileWidget />
        </div>
    );
};
