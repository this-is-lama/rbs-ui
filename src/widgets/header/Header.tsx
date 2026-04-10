import { Link } from 'react-router-dom';
import { Logo } from '@/shared/ui/logo/Logo';
import styles from './Header.module.scss';
import {Navbar} from "@/widgets/navbar";

export const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link to="/" className={styles.logoLink}>
                    <Logo className={styles.logo} />
                </Link>

                <Navbar />
            </div>
        </header>
    );
};