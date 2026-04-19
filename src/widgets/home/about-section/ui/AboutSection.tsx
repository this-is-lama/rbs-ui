import { useLanguage } from '@/app/providers/language';
import styles from './AboutSection.module.scss';

export const AboutSection = () => {
    const { language } = useLanguage();

    const copy = language === 'en'
        ? {
            paragraphOne: 'is a platform for online restaurant table booking that makes choosing a place and reserving it fast and simple. Guests can pick a restaurant, view the floor plan, reserve a specific table, and pre-order dishes in advance.',
            paragraphTwo: 'We aim to simplify the interaction between guests and restaurants with modern technology and thoughtful automation.',
            title: 'About Us',
        }
        : {
            paragraphOne: 'это платформа для онлайн-бронирования столиков в ресторанах, которая делает процесс выбора и бронирования быстрым и удобным. Пользователи могут выбрать ресторан, посмотреть схему зала, забронировать конкретный столик и оформить заказ заранее.',
            paragraphTwo: 'Мы стремимся упростить взаимодействие между гостями и ресторанами с помощью современных технологий и автоматизации.',
            title: 'О нас',
        };

    return (
        <section className={styles.section} id="about">
            <div className={styles.container}>
                <h2 className={styles.title}>{copy.title}</h2>

                <p className={styles.text}>
                    <span className={styles.brand}>RBS</span>{' '}
                    {copy.paragraphOne}
                </p>

                <p className={styles.text}>
                    {copy.paragraphTwo}
                </p>
            </div>
        </section>
    );
};
