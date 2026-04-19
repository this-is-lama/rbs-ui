import { useLanguage } from '@/app/providers/language';
import styles from '../booking-page-widget/booking-page-widget.module.scss';

type BookingSummaryCardProps = {
    dishCount: number;
    totalAmount: number;
    formatMoney: (value: number) => string;
};

export const BookingSummaryCard = ({
    dishCount,
    totalAmount,
    formatMoney,
}: BookingSummaryCardProps) => {
    const { language } = useLanguage();
    const copy = language === 'en'
        ? {
            dishCount: 'Total dishes',
            title: 'Summary',
        }
        : {
            dishCount: 'Всего блюд',
            title: 'Итог',
        };

    return (
        <article className={`${styles.card} ${styles.summaryCard}`}>
            <h2 className="section-title">{copy.title}</h2>

            <div className={styles.summaryBody}>
                <div className={styles.summaryLine}>
                    <span className={styles.summaryLabel}>{copy.dishCount}</span>
                    <span className={styles.summaryDash}>-</span>
                    <span className={styles.summaryCount}>{dishCount}</span>
                </div>

                <strong className={styles.summaryValue}>{formatMoney(totalAmount)}</strong>
            </div>
        </article>
    );
};
