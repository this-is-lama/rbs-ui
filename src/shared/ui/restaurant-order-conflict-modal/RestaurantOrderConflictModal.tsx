import { useEffect } from 'react';
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
                aria-label="Подтверждение смены ресторана"
            >
                <h3 className={styles.title}>Сменить ресторан?</h3>

                <p className={styles.description}>
                    В заказе уже есть позиции из ресторана "{currentRestaurantName}".
                    Можно очистить текущий заказ и добавить позицию из ресторана "{nextRestaurantName}".
                </p>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={onCancel}
                    >
                        Отмена
                    </button>

                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={onConfirm}
                    >
                        Очистить и добавить
                    </button>
                </div>
            </div>
        </div>
    );
};
