import { Link } from 'react-router-dom';
import { Logo } from '@/shared/ui/logo/Logo';
import styles from './HomeHero.module.scss';

export const HomeHero = () => {
    return (
        <section className={styles.section} id="home">
            <div className={styles.container}>
                <div className={styles.grid}>
                    <h1 className={styles.title}>
                        <span>Рестораны,</span>
                        <span>еда и</span>
                        <span>технологии</span>
                        <span>работают</span>
                        <span>вместе</span>
                    </h1>

                    <div className={styles.logoBlock}>
                        <Logo className={styles.logo} />
                    </div>

                    <div className={styles.descriptionBlock}>
                        <p className={styles.description}>
                            Найдите идеальное место и забронируйте его за пару кликов
                        </p>
                    </div>

                    <div className={styles.actionBlock}>
                        <Link to="/restaurants" className={styles.button}>
                            Забронировать стол
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};