import styles from '../BookingPageWidget.module.scss';

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
    return (
        <article className={`${styles.card} ${styles.summaryCard}`}>
            <h2 className="section-title">Итог</h2>

            <div className={styles.summaryBody}>
                <div className={styles.summaryLine}>
                    <span className={styles.summaryLabel}>Всего блюд</span>
                    <span className={styles.summaryDash}>-</span>
                    <span className={styles.summaryCount}>{dishCount}</span>
                </div>

                <strong className={styles.summaryValue}>{formatMoney(totalAmount)}</strong>
            </div>
        </article>
    );
};
