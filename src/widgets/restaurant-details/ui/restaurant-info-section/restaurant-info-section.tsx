import { useLanguage } from '@/app/providers/language';
import type { WeekDay, WorkingHours } from '@/entities/restaurant/model/types.ts';
import { RestaurantWorkingHours } from '@/entities/restaurant/ui';
import type { NormalizedRestaurant } from '../../model/types.ts';
import { formatContactTypeLabel } from '../../lib/restaurant-details.ts';
import styles from '../restaurant-details-widget/restaurant-details-widget.module.scss';

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
    const { language } = useLanguage();

    return (
        <>
            <h1 className={styles.title}>{restaurant.name}</h1>

            <section className={styles.infoGrid}>
                <article className={styles.card}>
                    <h2 className={styles.cardTitle}>
                        {language === 'en' ? 'Working hours' : 'Время работы'}
                    </h2>
                    <RestaurantWorkingHours
                        workingHours={workingHours}
                        todayWeekDay={todayWeekDay}
                        language={language}
                    />
                </article>

                <div className={styles.infoStack}>
                    <article className={styles.card}>
                        <h2 className={styles.cardTitle}>{language === 'en' ? 'Address' : 'Адрес'}</h2>
                        <p className={styles.cardText}>{restaurant.address}</p>
                    </article>

                    <article className={styles.card}>
                        <h2 className={styles.cardTitle}>{language === 'en' ? 'Contacts' : 'Контакты'}</h2>

                        {restaurant.contacts.length > 0 ? (
                            <ul className={styles.contactList}>
                                {restaurant.contacts.map((contact, index) => (
                                    <li
                                        key={`${contact.type}-${contact.value}-${index}`}
                                        className={styles.contactItem}
                                    >
                                        <span className={styles.contactLabel}>
                                            {formatContactTypeLabel(contact.type, language)}
                                        </span>
                                        <span className={styles.contactValue}>{contact.value}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={styles.cardText}>
                                {language === 'en' ? 'Contacts are not specified' : 'Контакты не указаны'}
                            </p>
                        )}
                    </article>
                </div>
            </section>

            <article className={styles.card}>
                <h2 className={styles.cardTitle}>{language === 'en' ? 'Description' : 'Описание'}</h2>
                <p className={styles.descriptionText}>
                    {restaurant.description?.trim() || (
                        language === 'en'
                            ? 'Restaurant description is not available yet'
                            : 'Описание ресторана пока не указано'
                    )}
                </p>
            </article>
        </>
    );
};
