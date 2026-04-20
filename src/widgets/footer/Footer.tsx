import { Link } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import { RoutePaths } from '@/shared/config/routes';
import { Logo } from '@/shared/ui/logo';
import styles from './Footer.module.scss';

export const Footer = () => {
    const { language } = useLanguage();

    const copy = language === 'en'
        ? {
            about: 'About',
            aboutUs: 'About us',
            advantages: 'Advantages',
            booking: 'Booking',
            contacts: 'Contacts',
            home: 'Home',
            howItWorks: 'How it works',
            navigation: 'Navigation',
            profile: 'Profile',
            restaurants: 'Restaurants',
            tagline: 'Online table booking for restaurants. Fast, simple, and friction-free.',
        }
        : {
            about: 'О сервисе',
            aboutUs: 'О нас',
            advantages: 'Преимущества',
            booking: 'Бронирование',
            contacts: 'Контакты',
            home: 'Главная',
            howItWorks: 'Как это работает',
            navigation: 'Навигация',
            profile: 'Профиль',
            restaurants: 'Рестораны',
            tagline: 'Сервис онлайн-бронирования столиков в ресторанах. Быстро, удобно и без лишних действий',
        };

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.top}>
                    <div className={styles.column}>
                        <div className={styles.logoBlock}>
                            <Logo className={styles.logo} />
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h3 className={styles.columnTitle}>{copy.navigation}</h3>

                        <div className={styles.links}>
                            <Link to={RoutePaths.HOME} className={styles.link}>{copy.home}</Link>
                            <Link to={RoutePaths.RESTAURANTS} className={styles.link}>{copy.restaurants}</Link>
                            <Link to={RoutePaths.BOOKING} className={styles.link}>{copy.booking}</Link>
                            <Link to={RoutePaths.PROFILE} className={styles.link}>{copy.profile}</Link>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h3 className={styles.columnTitle}>{copy.about}</h3>

                        <div className={styles.links}>
                            <Link
                                to={{ pathname: RoutePaths.HOME, hash: '#about' }}
                                className={styles.link}
                            >
                                {copy.aboutUs}
                            </Link>
                            <Link
                                to={{ pathname: RoutePaths.HOME, hash: '#advantages' }}
                                className={styles.link}
                            >
                                {copy.advantages}
                            </Link>
                            <Link
                                to={{ pathname: RoutePaths.HOME, hash: '#how-it-works' }}
                                className={styles.link}
                            >
                                {copy.howItWorks}
                            </Link>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h3 className={styles.columnTitle}>{copy.contacts}</h3>

                        <div className={styles.links}>
                            <a href="mailto:support@rbs.ru" className={styles.link}>
                                support@rbs.ru
                            </a>
                            <a href="tel:+79393194060" className={styles.link}>
                                +7 (939) 319-40-60
                            </a>
                        </div>
                    </div>
                </div>

                <p className={styles.bottomText}>
                    {copy.tagline}
                </p>
            </div>
        </footer>
    );
};
