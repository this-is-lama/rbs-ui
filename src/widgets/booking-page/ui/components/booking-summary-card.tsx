import styles from '../BookingPageWidget.module.scss';

type BookingSummaryCardProps = {
    bookingCount: number;
    dishCount: number;
    totalAmount: number;
    formatMoney: (value: number) => string;
};

export const BookingSummaryCard = ({
    bookingCount,
    dishCount,
    totalAmount,
    formatMoney,
}: BookingSummaryCardProps) => {
    return (
        <article className={styles.card}>
            <div className={styles.headerRow}>
                <h2 className="section-title">Итог</h2>
                <strong className={styles.summaryValue}>{formatMoney(totalAmount)}</strong>
            </div>

            <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Столов в корзине</span>
                <span className={styles.metaValue}>{bookingCount}</span>
            </div>

            <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Блюд в корзине</span>
                <span className={styles.metaValue}>{dishCount}</span>
            </div>
        </article>
    );
};
