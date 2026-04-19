import { useLanguage } from '@/app/providers/language';
import styles from './AdvantagesSection.module.scss';

export const AdvantagesSection = () => {
    const { language } = useLanguage();

    const copy = language === 'en'
        ? {
            advantages: [
                {
                    description: 'Reserve a table in seconds without calls or waiting for confirmation',
                    title: 'Instant booking',
                },
                {
                    description: 'Open the floor plan and choose the exact table that fits your visit',
                    title: 'Pick a specific table',
                },
                {
                    description: 'Pre-order food and save time once you arrive at the restaurant',
                    title: 'Dish pre-order',
                },
                {
                    description: 'Receive confirmations and reminders so your reservation never slips away',
                    title: 'Notifications and reminders',
                },
            ],
            lead: 'We made restaurant booking the way it should feel:',
            leadAccent: 'fast, transparent, and comfortable',
            title: 'Our advantages',
        }
        : {
            advantages: [
                {
                    description: 'Забронируйте столик за несколько секунд без звонков и ожидания подтверждения',
                    title: 'Мгновенное бронирование',
                },
                {
                    description: 'Смотрите схему зала и выбирайте именно тот стол, который вам подходит',
                    title: 'Выбор конкретного столика',
                },
                {
                    description: 'Закажите еду заранее и сэкономьте время в ресторане',
                    title: 'Предзаказ блюд',
                },
                {
                    description: 'Получайте подтверждения и напоминания, чтобы не забыть о брони',
                    title: 'Уведомления и напоминания',
                },
            ],
            lead: 'Мы сделали бронирование ресторанов таким, каким оно должно быть:',
            leadAccent: 'быстрым, удобным и прозрачным',
            title: 'Наши преимущества',
        };

    return (
        <section className={styles.section} id="advantages">
            <div className={styles.container}>
                <h2 className={styles.title}>{copy.title}</h2>

                <p className={styles.lead}>
                    {copy.lead}
                </p>

                <p className={styles.leadAccent}>
                    {copy.leadAccent}
                </p>

                <div className={styles.grid}>
                    {copy.advantages.map((item) => (
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
