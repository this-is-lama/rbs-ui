import { Link } from 'react-router-dom';
import { Logo } from '@/shared/ui/logo/Logo';
import styles from './Footer.module.scss';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.top}>
                    <div className={styles.logoBlock}>
                        <Logo className={styles.logo} />
                    </div>

                    <div className={styles.columns}>
                        <div className={styles.column}>
                            <h3 className={styles.columnTitle}>Навигация</h3>

                            <div className={styles.links}>
                                <Link to="/" className={styles.link}>Главная</Link>
                                <Link to="/restaurants" className={styles.link}>Рестораны</Link>
                                <Link to="/booking" className={styles.link}>Бронирование</Link>
                                <Link to="/profile" className={styles.link}>Профиль</Link>
                            </div>
                        </div>

                        <div className={styles.column}>
                            <h3 className={styles.columnTitle}>О сервисе</h3>

                            <div className={styles.links}>
                                <a href="#about" className={styles.link}>О нас</a>
                                <a href="#advantages" className={styles.link}>Преимущества</a>
                                <a href="#how-it-works" className={styles.link}>Как это работает</a>
                            </div>
                        </div>

                        <div className={styles.column}>
                            <h3 className={styles.columnTitle}>Контакты</h3>

                            <div className={styles.links}>
                                <a href="mailto:support@rbs.ru" className={styles.link}>
                                    Email: support@rbs.ru
                                </a>
                                <a href="tel:+79991234567" className={styles.link}>
                                    Телефон: +7 (999) 123-45-67
                                </a>
                            </div>
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