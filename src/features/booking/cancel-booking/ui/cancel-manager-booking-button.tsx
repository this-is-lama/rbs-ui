import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    type FormEvent,
} from 'react';
import { useLanguage } from '@/app/providers/language';
import { cancelBookingForManagerOrOwner } from '@/entities/booking/api';
import { getApiErrorMessage } from '@/shared/lib/api';
import styles from './CancelManagerBookingButton.module.scss';

const MAX_REASON_LENGTH = 500;

type CancelManagerBookingButtonProps = {
    bookingId: string;
    className?: string;
    label?: string;
    disabled?: boolean;
    onCancelled?: () => void | Promise<void>;
    onError?: (message: string) => void;
};

export const CancelManagerBookingButton = ({
    bookingId,
    className,
    label = 'Отменить',
    disabled,
    onCancelled,
    onError,
}: CancelManagerBookingButtonProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [validationError, setValidationError] = useState('');
    const { language } = useLanguage();
    const reasonInputId = useId();
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const copy = language === 'en'
        ? {
            close: 'Close',
            description: 'The guest will receive this reason in the cancellation notification.',
            fallbackError: 'Failed to cancel booking',
            label: 'Cancellation reason',
            maxLengthError: `Reason must be ${MAX_REASON_LENGTH} characters or fewer`,
            placeholder: 'For example: the restaurant is closed for maintenance',
            reasonRequired: 'Enter a cancellation reason',
            submit: 'Cancel booking',
            submitting: 'Cancelling...',
            title: 'Cancellation reason',
        }
        : {
            close: 'Закрыть',
            description: 'Гость получит эту причину в уведомлении об отмене.',
            fallbackError: 'Не удалось отменить бронирование',
            label: 'Причина отмены',
            maxLengthError: `Причина должна быть не длиннее ${MAX_REASON_LENGTH} символов`,
            placeholder: 'Например: ресторан закрыт на техническое обслуживание',
            reasonRequired: 'Укажите причину отмены',
            submit: 'Отменить бронирование',
            submitting: 'Отмена...',
            title: 'Причина отмены',
        };

    const buttonClassName = [className, styles.triggerButton].filter(Boolean).join(' ');
    const submitButtonClassName = [className, styles.submitButton].filter(Boolean).join(' ');

    const handleOpenPanel = () => {
        setIsPanelOpen(true);
        setValidationError('');
        onError?.('');
    };

    const handleClosePanel = useCallback(() => {
        if (isSubmitting) {
            return;
        }

        setIsPanelOpen(false);
        setReason('');
        setValidationError('');
    }, [isSubmitting]);

    useEffect(() => {
        if (!isPanelOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const timeoutId = window.setTimeout(() => {
            textareaRef.current?.focus();
        }, 0);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClosePanel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.clearTimeout(timeoutId);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleClosePanel, isPanelOpen]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedReason = reason.trim();

        if (!trimmedReason) {
            setValidationError(copy.reasonRequired);
            return;
        }

        if (trimmedReason.length > MAX_REASON_LENGTH) {
            setValidationError(copy.maxLengthError);
            return;
        }

        try {
            setIsSubmitting(true);
            setValidationError('');
            onError?.('');
            await cancelBookingForManagerOrOwner(bookingId, {
                reason: trimmedReason,
            });
            setIsPanelOpen(false);
            setReason('');
            await onCancelled?.();
        } catch (error) {
            onError?.(getApiErrorMessage(error, copy.fallbackError));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                type="button"
                className={buttonClassName}
                onClick={handleOpenPanel}
                disabled={disabled || isSubmitting}
            >
                {label}
            </button>

            {isPanelOpen ? (
                <div className={styles.overlay} onClick={handleClosePanel}>
                    <form
                        className={styles.panel}
                        onClick={(event) => event.stopPropagation()}
                        onSubmit={(event) => void handleSubmit(event)}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={`${reasonInputId}-title`}
                    >
                        <div className={styles.panelHeader}>
                            <h4 id={`${reasonInputId}-title`} className={styles.panelTitle}>
                                {copy.title}
                            </h4>
                            <p className={styles.panelDescription}>{copy.description}</p>
                        </div>

                        <label className={styles.field} htmlFor={reasonInputId}>
                            <span className={styles.fieldLabel}>{copy.label}</span>
                            <textarea
                                ref={textareaRef}
                                id={reasonInputId}
                                className={styles.textarea}
                                value={reason}
                                maxLength={MAX_REASON_LENGTH}
                                placeholder={copy.placeholder}
                                rows={4}
                                disabled={isSubmitting}
                                onChange={(event) => {
                                    setReason(event.target.value);
                                    setValidationError('');
                                }}
                            />
                        </label>

                        <div className={styles.metaRow}>
                            <span className={styles.validationError}>
                                {validationError}
                            </span>
                            <span className={styles.counter}>
                                {reason.length}/{MAX_REASON_LENGTH}
                            </span>
                        </div>

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={handleClosePanel}
                                disabled={isSubmitting}
                            >
                                {copy.close}
                            </button>
                            <button
                                type="submit"
                                className={submitButtonClassName}
                                disabled={disabled || isSubmitting}
                            >
                                {isSubmitting ? copy.submitting : copy.submit}
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}
        </>
    );
};
