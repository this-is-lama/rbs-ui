import { Link } from 'react-router-dom';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { Footer } from '@/widgets/footer/Footer.tsx';
import styles from './NotFoundPage.module.scss';

const links = [
    {
        title: '\u0412\u0441\u0435 \u0440\u0435\u0441\u0442\u043e\u0440\u0430\u043d\u044b',
        description:
            '\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u043a \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u0443 \u0438 \u0432\u044b\u0431\u0440\u0430\u0442\u044c \u043d\u043e\u0432\u043e\u0435 \u043c\u0435\u0441\u0442\u043e \u0434\u043b\u044f \u0431\u0440\u043e\u043d\u0438.',
        to: RoutePaths.RESTAURANTS,
        accent: '\u041a\u0430\u0442\u0430\u043b\u043e\u0433',
    },
    {
        title: '\u0413\u043b\u0430\u0432\u043d\u0430\u044f \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430',
        description:
            '\u0412\u0435\u0440\u043d\u0443\u0442\u044c\u0441\u044f \u043d\u0430 \u0441\u0442\u0430\u0440\u0442 \u0438 \u0431\u044b\u0441\u0442\u0440\u043e \u0432\u043e\u0441\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u044c \u043c\u0430\u0440\u0448\u0440\u0443\u0442.',
        to: RoutePaths.HOME,
        accent: '\u0421\u0442\u0430\u0440\u0442',
    },
    {
        title: '\u041a\u0430\u043a \u044d\u0442\u043e \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442',
        description:
            '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0431\u043b\u043e\u043a \u0441 \u043f\u043e\u0448\u0430\u0433\u043e\u0432\u044b\u043c \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435\u043c \u0441\u0435\u0440\u0432\u0438\u0441\u0430.',
        to: { pathname: RoutePaths.HOME, hash: '#how-it-works' },
        accent: '\u041f\u043e\u043c\u043e\u0449\u044c',
    },
] as const;

export const NotFoundPage = () => {
    return (
        <>
            <main className={styles.main}>
                <section className={styles.section}>
                    <div className={styles.container}>
                        <div className={styles.heroCard}>
                            <div className={styles.copyBlock}>
                                <span className={styles.eyebrow}>
                                    {'\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430'}
                                </span>

                                <h1 className={styles.title}>
                                    {
                                        '\u041f\u043e\u0445\u043e\u0436\u0435, \u044d\u0442\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0443\u0436\u0435 \u0441\u043c\u0435\u043d\u0438\u043b\u0430 \u0430\u0434\u0440\u0435\u0441 \u0438\u043b\u0438 \u0435\u0451 \u0437\u0434\u0435\u0441\u044c \u043d\u0438\u043a\u043e\u0433\u0434\u0430 \u043d\u0435 \u0431\u044b\u043b\u043e.'
                                    }
                                </h1>

                                <p className={styles.description}>
                                    {
                                        '\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0441\u0441\u044b\u043b\u043a\u0443 \u0432 \u0430\u0434\u0440\u0435\u0441\u043d\u043e\u0439 \u0441\u0442\u0440\u043e\u043a\u0435 \u0438\u043b\u0438 \u0432\u0435\u0440\u043d\u0438\u0442\u0435\u0441\u044c \u043a \u043f\u043e\u0438\u0441\u043a\u0443 \u0440\u0435\u0441\u0442\u043e\u0440\u0430\u043d\u0430. \u041c\u044b \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u043b\u0438 \u0434\u043b\u044f \u0432\u0430\u0441 \u0431\u044b\u0441\u0442\u0440\u044b\u0435 \u043f\u0435\u0440\u0435\u0445\u043e\u0434\u044b \u043d\u0438\u0436\u0435.'
                                    }
                                </p>

                                <div className={styles.actions}>
                                    <Link to={RoutePaths.HOME} className={styles.primaryAction}>
                                        {'\u041d\u0430 \u0433\u043b\u0430\u0432\u043d\u0443\u044e'}
                                    </Link>

                                    <Link
                                        to={RoutePaths.RESTAURANTS}
                                        className={styles.secondaryAction}
                                    >
                                        {'\u041a \u0440\u0435\u0441\u0442\u043e\u0440\u0430\u043d\u0430\u043c'}
                                    </Link>
                                </div>
                            </div>

                            <div className={styles.visualBlock} aria-hidden="true">
                                <div className={styles.glow} />

                                <div className={styles.visualCard}>
                                    <span className={styles.visualCode}>404</span>

                                    <div className={styles.visualNote}>
                                        <span className={styles.noteTitle}>
                                            {
                                                '\u041d\u0443\u0436\u043d\u044b\u0439 \u043c\u0430\u0440\u0448\u0440\u0443\u0442 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d'
                                            }
                                        </span>

                                        <span className={styles.noteText}>
                                            {
                                                '\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043d\u043e\u0432\u044b\u0439 \u043f\u0435\u0440\u0435\u0445\u043e\u0434 \u0438\u0437 \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u0430 \u0438\u043b\u0438 \u0433\u043b\u0430\u0432\u043d\u043e\u0439.'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <section className={styles.linksSection}>
                            <div className={styles.linksHeader}>
                                <h2 className={styles.linksTitle}>
                                    {'\u0427\u0442\u043e \u043c\u043e\u0436\u043d\u043e \u0441\u0434\u0435\u043b\u0430\u0442\u044c \u0434\u0430\u043b\u044c\u0448\u0435'}
                                </h2>

                                <p className={styles.linksDescription}>
                                    {
                                        '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0439, \u0438 \u043c\u044b \u0432\u0435\u0440\u043d\u0451\u043c \u0432\u0430\u0441 \u043d\u0430 \u043f\u043e\u043d\u044f\u0442\u043d\u044b\u0439 \u043c\u0430\u0440\u0448\u0440\u0443\u0442.'
                                    }
                                </p>
                            </div>

                            <div className={styles.linksGrid}>
                                {links.map((link) => (
                                    <Link key={link.title} to={link.to} className={styles.linkCard}>
                                        <span className={styles.linkAccent}>{link.accent}</span>
                                        <h3 className={styles.linkTitle}>{link.title}</h3>
                                        <p className={styles.linkText}>{link.description}</p>
                                        <span className={styles.linkArrow}>
                                            {'\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u2192'}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
};
