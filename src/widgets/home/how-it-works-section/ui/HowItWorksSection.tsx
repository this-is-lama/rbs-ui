import { useLanguage } from '@/app/providers/language';
import styles from './HowItWorksSection.module.scss';

export const HowItWorksSection = () => {
    const { language } = useLanguage();

    const copy = language === 'en'
        ? {
            steps: [
                {
                    description: 'Find the place that fits your mood',
                    step: 'Step 1',
                    title: 'Choose a restaurant',
                },
                {
                    description: 'Pick the date, time, and number of guests for your visit',
                    step: 'Step 2',
                    title: 'Choose a table',
                },
                {
                    description: 'Pre-order dishes you want from the menu',
                    step: 'Step 3',
                    title: 'Choose dishes',
                },
                {
                    description: 'Finish and confirm your reservation',
                    step: 'Step 4',
                    title: 'Confirm the booking',
                },
            ],
            title: 'How It Works?',
        }
        : {
            steps: [
                {
                    description: 'Найдите идеальное место',
                    step: 'Шаг 1',
                    title: 'Выберите ресторан',
                },
                {
                    description: 'Укажите дату, время и количество гостей для вашего посещения',
                    step: 'Шаг 2',
                    title: 'Выберите стол',
                },
                {
                    description: 'Закажите понравившиеся блюда из нашего меню',
                    step: 'Шаг 3',
                    title: 'Выберите блюда',
                },
                {
                    description: 'Оформите бронирование',
                    step: 'Шаг 4',
                    title: 'Подтвердите бронь',
                },
            ],
            title: 'Как это работает?',
        };

    return (
        <section className={styles.section} id="how-it-works">
            <div className={styles.container}>
                <h2 className={styles.title}>{copy.title}</h2>

                <div className={styles.timeline}>
                    <div className={styles.line} />

                    {copy.steps.map((item) => (
                        <article key={item.step} className={styles.step}>
                            <div className={styles.badge}>{item.step}</div>
                            <div className={styles.dot} />

                            <h3 className={styles.stepTitle}>{item.title}</h3>
                            <p className={styles.stepDescription}>{item.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};
