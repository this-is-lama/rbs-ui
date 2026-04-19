import type { ReactNode } from 'react';
import styles from './BookingAccordionItem.module.scss';

type BookingAccordionItemProps = {
    children: ReactNode;
    dimmed?: boolean;
    expanded: boolean;
    metaChips: ReactNode;
    onToggle: () => void;
    statusLabel: string;
    statusTone: 'cancelled' | 'reserved';
    title: string;
};

export const BookingAccordionItem = ({
    children,
    dimmed = false,
    expanded,
    metaChips,
    onToggle,
    statusLabel,
    statusTone,
    title,
}: BookingAccordionItemProps) => {
    return (
        <article className={`${styles.item} ${dimmed ? styles.itemDimmed : ''}`}>
            <button
                type="button"
                className={styles.toggle}
                onClick={onToggle}
                aria-expanded={expanded}
            >
                <div className={styles.summaryMain}>
                    <h3 className={styles.name}>{title}</h3>
                    <div className={styles.summaryMeta}>
                        {metaChips}
                        <span
                            className={`${styles.summaryChip} ${styles.statusChip} ${
                                statusTone === 'cancelled'
                                    ? styles.statusChipCancelled
                                    : styles.statusChipReserved
                            }`}
                        >
                            {statusLabel}
                        </span>
                    </div>
                </div>

                <span
                    className={`${styles.toggleIcon} ${expanded ? styles.toggleIconExpanded : ''}`}
                    aria-hidden="true"
                >
                    <svg viewBox="0 0 16 10" className={styles.toggleIconSvg}>
                        <path
                            d="M1.5 1.5L8 8L14.5 1.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="square"
                            strokeLinejoin="miter"
                        />
                    </svg>
                </span>
            </button>

            {expanded ? <div className={styles.details}>{children}</div> : null}
        </article>
    );
};
