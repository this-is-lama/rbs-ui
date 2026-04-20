import { Link } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import { Logo } from '@/shared/ui/logo';
import { RoutePaths } from '@/shared/config/routes';
import styles from './HomeHero.module.scss';

export const HomeHero = () => {
    const { language } = useLanguage();

    const copy = language === 'en'
        ? {
            button: 'Book a table',
            description: 'Find the perfect place and reserve it in just a couple of clicks',
            lines: ['Restaurants,', 'food, and', 'technology', 'work', 'together'],
        }
        : {
            button: 'Забронировать стол',
            description: 'Найдите идеальное место и забронируйте его за пару кликов',
            lines: ['Рестораны,', 'еда и', 'технологии', 'работают', 'вместе'],
        };

    return (
        <section className={styles.section} id="home">
            <div className={styles.container}>
                <div className={styles.grid}>
                    <h1 className={styles.title}>
                        {copy.lines.map((line) => (
                            <span key={line}>{line}</span>
                        ))}
                    </h1>

                    <div className={styles.logoBlock}>
                        <Logo className={styles.logo} />
                    </div>

                    <div className={styles.descriptionBlock}>
                        <p className={styles.description}>
                            {copy.description}
                        </p>
                    </div>

                    <div className={styles.actionBlock}>
                        <Link to={RoutePaths.RESTAURANTS} className={styles.button}>
                            {copy.button}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
