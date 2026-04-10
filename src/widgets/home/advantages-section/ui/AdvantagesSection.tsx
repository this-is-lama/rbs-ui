import styles from './AdvantagesSection.module.scss';

const advantages = [
    {
        title: 'Мгновенное бронирование',
        description:
            'Забронируйте столик за несколько секунд без звонков и ожидания подтверждения',
    },
    {
        title: 'Выбор конкретного столика',
        description:
            'Смотрите схему зала и выбирайте именно тот стол, который вам подходит',
    },
    {
        title: 'Предзаказ блюд',
        description:
            'Закажите еду заранее и сэкономьте время в ресторане',
    },
    {
        title: 'Уведомления и напоминания',
        description:
            'Получайте подтверждения и напоминания, чтобы не забыть о брони',
    },
];

export const AdvantagesSection = () => {
    return (
        <section className={styles.section} id="advantages">
            <div className={styles.container}>
                <h2 className={styles.title}>Наши преимущества</h2>

                <p className={styles.lead}>
                    Мы сделали бронирование ресторанов таким, каким оно должно быть -
                </p>

                <p className={styles.leadAccent}>
                    быстрым, удобным и прозрачным
                </p>

                <div className={styles.grid}>
                    {advantages.map((item) => (
                        <article key={item.title} className={styles.card}>
                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <p className={styles.cardDescription}>{item.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};