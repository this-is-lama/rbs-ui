import { Link } from 'react-router-dom';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { Logo } from '@/shared/ui/logo/Logo';
import styles from './Footer.module.scss';

export const Footer = () => {
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
                        <h3 className={styles.columnTitle}>Навигация</h3>

                        <div className={styles.links}>
                            <Link to={RoutePaths.HOME} className={styles.link}>Главная</Link>
                            <Link to={RoutePaths.RESTAURANTS} className={styles.link}>Рестораны</Link>
                            <Link to={RoutePaths.BOOKING} className={styles.link}>Бронирование</Link>
                            <Link to={RoutePaths.PROFILE} className={styles.link}>Профиль</Link>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h3 className={styles.columnTitle}>О сервисе</h3>

                        <div className={styles.links}>
                            <Link
                                to={{ pathname: RoutePaths.HOME, hash: '#about' }}
                                className={styles.link}
                            >
                                О нас
                            </Link>
                            <Link
                                to={{ pathname: RoutePaths.HOME, hash: '#advantages' }}
                                className={styles.link}
                            >
                                Преимущества
                            </Link>
                            <Link
                                to={{ pathname: RoutePaths.HOME, hash: '#how-it-works' }}
                                className={styles.link}
                            >
                                Как это работает
                            </Link>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h3 className={styles.columnTitle}>Контакты</h3>

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
                    Сервис онлайн-бронирования столиков в ресторанах. Быстро, удобно и без лишних действий
                </p>
            </div>
        </footer>
    );
};
