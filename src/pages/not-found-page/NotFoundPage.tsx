import { Link } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import { RoutePaths } from '@/shared/config/routes';
import { Footer } from '@/widgets/footer';
import styles from './NotFoundPage.module.scss';

export const NotFoundPage = () => {
    const { language } = useLanguage();

    const copy = language === 'en'
        ? {
            actionsTitle: 'What you can do next',
            backHome: 'Back home',
            catalog: 'Catalog',
            catalogDescription: 'Open the restaurant catalog and choose a new place for your reservation.',
            goTo: 'Open →',
            help: 'Help',
            helpDescription: 'Open the block with a step-by-step explanation of how the service works.',
            heroDescription: 'Check the address in the browser bar or return to restaurant discovery. We saved quick routes for you below.',
            heroEyebrow: 'Page not found',
            heroTitle: 'Looks like this page has changed its address or it was never here.',
            homeDescription: 'Return to the start page and quickly restore your route.',
            homeTitle: 'Home page',
            howItWorks: 'How it works',
            missingRoute: 'The route you need was not found',
            note: 'Try opening a new route from the catalog or the home page.',
            restaurants: 'To restaurants',
            scenarioDescription: 'Choose a scenario and we will bring you back to a clear path.',
            start: 'Start',
        }
        : {
            actionsTitle: 'Что можно сделать дальше',
            backHome: 'На главную',
            catalog: 'Каталог',
            catalogDescription: 'Перейти к каталогу и выбрать новое место для брони.',
            goTo: 'Перейти →',
            help: 'Помощь',
            helpDescription: 'Открыть блок с пошаговым описанием сервиса.',
            heroDescription: 'Проверьте ссылку в адресной строке или вернитесь к поиску ресторана. Мы сохранили для вас быстрые переходы ниже.',
            heroEyebrow: 'Страница не найдена',
            heroTitle: 'Похоже, эта страница уже сменила адрес или её здесь никогда не было.',
            homeDescription: 'Вернуться на старт и быстро восстановить маршрут.',
            homeTitle: 'Главная страница',
            howItWorks: 'Как это работает',
            missingRoute: 'Нужный маршрут не найден',
            note: 'Попробуйте новый переход из каталога или главной.',
            restaurants: 'К ресторанам',
            scenarioDescription: 'Выберите сценарий, и мы вернём вас на понятный маршрут.',
            start: 'Старт',
        };

    const links = [
        {
            accent: copy.catalog,
            description: copy.catalogDescription,
            title: language === 'en' ? 'All restaurants' : 'Все рестораны',
            to: RoutePaths.RESTAURANTS,
        },
        {
            accent: copy.start,
            description: copy.homeDescription,
            title: copy.homeTitle,
            to: RoutePaths.HOME,
        },
        {
            accent: copy.help,
            description: copy.helpDescription,
            title: copy.howItWorks,
            to: { pathname: RoutePaths.HOME, hash: '#how-it-works' },
        },
    ] as const;

    return (
        <>
            <main className={styles.main}>
                <section className={styles.section}>
                    <div className={styles.container}>
                        <div className={styles.heroCard}>
                            <div className={styles.copyBlock}>
                                <span className={styles.eyebrow}>
                                    {copy.heroEyebrow}
                                </span>

                                <h1 className={styles.title}>
                                    {copy.heroTitle}
                                </h1>

                                <p className={styles.description}>
                                    {copy.heroDescription}
                                </p>

                                <div className={styles.actions}>
                                    <Link to={RoutePaths.HOME} className={styles.primaryAction}>
                                        {copy.backHome}
                                    </Link>

                                    <Link
                                        to={RoutePaths.RESTAURANTS}
                                        className={styles.secondaryAction}
                                    >
                                        {copy.restaurants}
                                    </Link>
                                </div>
                            </div>

                            <div className={styles.visualBlock} aria-hidden="true">
                                <div className={styles.glow} />

                                <div className={styles.visualCard}>
                                    <span className={styles.visualCode}>404</span>

                                    <div className={styles.visualNote}>
                                        <span className={styles.noteTitle}>
                                            {copy.missingRoute}
                                        </span>

                                        <span className={styles.noteText}>
                                            {copy.note}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <section className={styles.linksSection}>
                            <div className={styles.linksHeader}>
                                <h2 className={styles.linksTitle}>
                                    {copy.actionsTitle}
                                </h2>

                                <p className={styles.linksDescription}>
                                    {copy.scenarioDescription}
                                </p>
                            </div>

                            <div className={styles.linksGrid}>
                                {links.map((link) => (
                                    <Link key={link.title} to={link.to} className={styles.linkCard}>
                                        <span className={styles.linkAccent}>{link.accent}</span>
                                        <h3 className={styles.linkTitle}>{link.title}</h3>
                                        <p className={styles.linkText}>{link.description}</p>
                                        <span className={styles.linkArrow}>
                                            {copy.goTo}
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
