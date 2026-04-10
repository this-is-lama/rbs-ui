import styles from './HowItWorksSection.module.scss';

const steps = [
    {
        step: 'Шаг 1',
        title: 'Выберите ресторан',
        description: 'Найдите идеальное место',
    },
    {
        step: 'Шаг 2',
        title: 'Выберите стол',
        description: 'Укажите дату, время и количество гостей для вашего посещения',
    },
    {
        step: 'Шаг 3',
        title: 'Выберите блюда',
        description: 'Закажите понравившиеся блюда из нашего меню',
    },
    {
        step: 'Шаг 4',
        title: 'Подтвердите бронь',
        description: 'Оформите бронирование',
    },
];

export const HowItWorksSection = () => {
    return (
        <section className={styles.section} id="how-it-works">
            <div className={styles.container}>
                <h2 className={styles.title}>Как это работает ?</h2>

                <div className={styles.timeline}>
                    <div className={styles.line} />

                    {steps.map((item) => (
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