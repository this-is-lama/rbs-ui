import type { KeyboardEvent, ReactNode } from 'react';
import { CloseIcon } from '@/shared/ui/icons/action-icons.tsx';
import styles from './booking-table-card.module.scss';

export type BookingTableCardRow = {
    label: string;
    value: ReactNode;
};

type BookingTableCardProps = {
    ariaLabel: string;
    hint: string;
    rows: BookingTableCardRow[];
    title: string;
    subtitle?: string;
    onOpen: () => void;
    onRemove?: () => void;
    removeLabel?: string;
};

export const BookingTableCard = ({
    ariaLabel,
    hint,
    rows,
    title,
    subtitle,
    onOpen,
    onRemove,
    removeLabel,
}: BookingTableCardProps) => {
    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();
        onOpen();
    };

    return (
        <article
            className={styles.card}
            onClick={onOpen}
            onKeyDown={handleKeyDown}
            role="link"
            tabIndex={0}
            aria-label={ariaLabel}
        >
            {onRemove && removeLabel ? (
                <button
                    type="button"
                    className={styles.removeButton}
                    onClick={(event) => {
                        event.stopPropagation();
                        onRemove();
                    }}
                    aria-label={removeLabel}
                >
                    <CloseIcon className={styles.removeIcon} />
                </button>
            ) : null}

            <div className={styles.content}>
                <div className={`${styles.head} ${onRemove ? styles.headWithAction : ''}`}>
                    <h3 className={styles.title}>{title}</h3>
                    {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
                </div>

                <div className={styles.infoList}>
                    {rows.map((row) => (
                        <div key={row.label} className={styles.infoRow}>
                            <span className={styles.infoLabel}>{row.label}</span>
                            <span className={styles.infoValue}>{row.value}</span>
                        </div>
                    ))}
                </div>

                <div className={styles.hint}>{hint}</div>
            </div>
        </article>
    );
};
