import { useLanguage } from '@/app/providers/language';
import styles from '../booking-page-widget/booking-page-widget.module.scss';

type BookingSummaryCardProps = {
    dishCount: number;
    preorderAmount: number;
    serviceFee: number;
    totalAmount: number;
    isQuoteLoading?: boolean;
    quoteError?: string;
    expiresAt?: string | null;
    formatMoney: (value: number) => string;
};

export const BookingSummaryCard = ({
    dishCount,
    preorderAmount,
    serviceFee,
    totalAmount,
    isQuoteLoading = false,
    quoteError = '',
    expiresAt = null,
    formatMoney,
}: BookingSummaryCardProps) => {
    const { language } = useLanguage();
    const copy = language === 'en'
        ? {
            dishCount: 'Total dishes',
            expiresAt: 'Quote valid until',
            preorderAmount: 'Preorder',
            quoteLoading: 'Calculating service fee...',
            serviceFee: 'Service fee',
            title: 'Summary',
            totalAmount: 'Total',
        }
        : {
            dishCount: 'Всего блюд',
            expiresAt: 'Расчет актуален до',
            preorderAmount: 'Предзаказ',
            quoteLoading: 'Рассчитываем сервисный сбор...',
            serviceFee: 'Сервисный сбор',
            title: 'Итог',
            totalAmount: 'Итого',
        };
    const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
    const formattedExpiresAt = expiresAtDate && Number.isFinite(expiresAtDate.getTime())
        ? new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'ru-RU', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(expiresAtDate)
        : null;
    const serviceFeeText = serviceFee === 0
        ? '0 ₽'
        : formatMoney(serviceFee);

    return (
        <article className={`${styles.card} ${styles.summaryCard}`}>
            <h2 className="section-title">{copy.title}</h2>

            <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>{copy.dishCount}</span>
                    <span className={styles.summaryCount}>{dishCount}</span>
                </div>

                <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>{copy.preorderAmount}</span>
                    <span className={styles.summaryValue}>{formatMoney(preorderAmount)}</span>
                </div>

                <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>{copy.serviceFee}</span>
                    <span className={styles.summaryValue}>{serviceFeeText}</span>
                </div>

                <div className={`${styles.summaryRow} ${styles.summaryTotalRow}`}>
                    <span className={styles.summaryLabel}>{copy.totalAmount}</span>
                    <strong className={styles.summaryValue}>{formatMoney(totalAmount)}</strong>
                </div>

                {isQuoteLoading ? (
                    <div className={styles.summaryHint}>{copy.quoteLoading}</div>
                ) : null}

                {quoteError ? (
                    <div className={styles.summaryError}>{quoteError}</div>
                ) : null}

                {formattedExpiresAt ? (
                    <div className={styles.summaryHint}>
                        {copy.expiresAt} {formattedExpiresAt}
                    </div>
                ) : null}
            </div>
        </article>
    );
};
