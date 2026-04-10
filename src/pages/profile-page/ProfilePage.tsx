import { UserProfileWidget } from '@/widgets/user-profile/ui/user-profile-widget.tsx';
import styles from './ProfilePage.module.scss';

export const ProfilePage = () => {
    return (
        <div className={`container ${styles.page}`}>
            <UserProfileWidget />
        </div>
    );
};