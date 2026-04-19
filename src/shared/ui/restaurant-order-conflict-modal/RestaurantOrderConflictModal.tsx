import { useEffect } from 'react';
import { useLanguage } from '@/app/providers/language';
import styles from './RestaurantOrderConflictModal.module.scss';

type RestaurantOrderConflictModalProps = {
    currentRestaurantName: string;
    nextRestaurantName: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export const RestaurantOrderConflictModal = ({
    currentRestaurantName,
    nextRestaurantName,
    onConfirm,
    onCancel,
}: RestaurantOrderConflictModalProps) => {
    const { language } = useLanguage();
    const copy = language === 'en'
        ? {
            ariaLabel: 'Confirm restaurant change',
            cancel: 'Cancel',
            confirm: 'Clear and add',
            description: `The order already contains items from "${currentRestaurantName}". You can clear it and add an item from "${nextRestaurantName}".`,
            title: 'Switch restaurant?',
        }
        : {
            ariaLabel: 'Подтверждение смены ресторана',
            cancel: 'Отмена',
            confirm: 'Очистить и добавить',
            description: `В заказе уже есть позиции из ресторана "${currentRestaurantName}". Можно очистить текущий заказ и добавить позицию из ресторана "${nextRestaurantName}".`,
            title: 'Сменить ресторан?',
        };

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div
                className={styles.dialog}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={copy.ariaLabel}
            >
                <h3 className={styles.title}>{copy.title}</h3>

                <p className={styles.description}>{copy.description}</p>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={onCancel}
                    >
                        {copy.cancel}
                    </button>

                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={onConfirm}
                    >
                        {copy.confirm}
                    </button>
                </div>
            </div>
        </div>
    );
};
