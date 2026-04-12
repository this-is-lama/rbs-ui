import { RestaurantWorkingHours } from '@/entities/restaurant/ui/restaurant-working-hours.tsx';
import type { WeekDay, WorkingHours } from '@/entities/restaurant/model/types.ts';
import type { NormalizedRestaurant } from '../../model/types.ts';
import { contactTypeLabels } from '../../lib/restaurant-details.ts';
import styles from '../restaurant-details-widget.module.scss';

type RestaurantInfoSectionProps = {
    restaurant: NormalizedRestaurant;
    todayWeekDay: WeekDay;
    workingHours: WorkingHours[];
};

export const RestaurantInfoSection = ({
    restaurant,
    todayWeekDay,
    workingHours,
}: RestaurantInfoSectionProps) => {
    return (
        <>
            <h1 className={styles.title}>{restaurant.name}</h1>

            <section className={styles.infoGrid}>
                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>Время работы</h2>
                    <RestaurantWorkingHours
                        workingHours={workingHours}
                        todayWeekDay={todayWeekDay}
                    />
                </article>

                <div className={styles.infoStack}>
                    <article className={styles.card}>
                        <h2 className={styles.cardTitle}>Адрес</h2>
                        <p className={styles.cardText}>{restaurant.address}</p>
                    </article>

                    <article className={styles.card}>
                        <h2 className={styles.cardTitle}>Контакты</h2>

                        {restaurant.contacts.length > 0 ? (
                            <ul className={styles.contactList}>
                                {restaurant.contacts.map((contact, index) => (
                                    <li
                                        key={`${contact.type}-${contact.value}-${index}`}
                                        className={styles.contactItem}
                                    >
                                        <span className={styles.contactLabel}>
                                            {contactTypeLabels[contact.type] ?? contact.type}
                                        </span>
                                        <span className={styles.contactValue}>{contact.value}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={styles.cardText}>Контакты не указаны</p>
                        )}
                    </article>
                </div>
            </section>

            <article className={styles.card}>
                <h2 className={styles.cardTitle}>Описание</h2>
                <p className={styles.descriptionText}>
                    {restaurant.description?.trim() || 'Описание ресторана пока не указано'}
                </p>
            </article>
        </>
    );
};
