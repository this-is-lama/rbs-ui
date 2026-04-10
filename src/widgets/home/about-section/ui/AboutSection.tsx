import styles from './AboutSection.module.scss';

export const AboutSection = () => {
    return (
        <section className={styles.section} id="about">
            <div className={styles.container}>
                <h2 className={styles.title}>О нас</h2>

                <p className={styles.text}>
                    <span className={styles.brand}>RBS</span> — это платформа для
                    онлайн-бронирования столиков в ресторанах, которая делает процесс выбора
                    и бронирования быстрым и удобным. Пользователи могут выбрать ресторан,
                    посмотреть схему зала, забронировать конкретный столик и оформить заказ
                    заранее.
                </p>

                <p className={styles.text}>
                    Мы стремимся упростить взаимодействие между гостями и ресторанами
                    с помощью современных технологий и автоматизации.
                </p>
            </div>
        </section>
    );
};