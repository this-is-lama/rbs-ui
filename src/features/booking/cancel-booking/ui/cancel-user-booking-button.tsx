import { useState } from 'react';
import { useLanguage } from '@/app/providers/language';
import { cancelBooking } from '@/entities/booking/api';
import { getApiErrorMessage } from '@/shared/lib/api';
import { useConfirmDialog } from '@/shared/ui/confirm-dialog';

type CancelUserBookingButtonProps = {
    bookingId: string;
    className?: string;
    disabled?: boolean;
    onCancelled?: () => void | Promise<void>;
    onError?: (message: string) => void;
};

export const CancelUserBookingButton = ({
    bookingId,
    className,
    disabled,
    onCancelled,
    onError,
}: CancelUserBookingButtonProps) => {
    const { language } = useLanguage();
    const confirmDialog = useConfirmDialog();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const copy = language === 'en'
        ? {
            confirm: 'Cancel booking',
            confirming: 'Cancelling...',
            description: 'The booking will be cancelled and removed from the active restaurant schedule.',
            fallbackError: 'Failed to cancel booking',
            label: 'Cancel booking',
            title: 'Cancel booking?',
        }
        : {
            confirm: 'Отменить бронирование',
            confirming: 'Отмена...',
            description: 'Бронирование будет отменено и исчезнет из активного расписания ресторана.',
            fallbackError: 'Не удалось отменить бронирование',
            label: 'Отменить бронирование',
            title: 'Отменить бронирование?',
        };

    const handleClick = async () => {
        onError?.('');

        const isConfirmed = await confirmDialog({
            title: copy.title,
            description: copy.description,
            confirmText: copy.confirm,
        });

        if (!isConfirmed) {
            return;
        }

        try {
            setIsSubmitting(true);
            onError?.('');
            await cancelBooking(bookingId);
            await onCancelled?.();
        } catch (error) {
            onError?.(getApiErrorMessage(error, copy.fallbackError));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <button
            type="button"
            className={className}
            onClick={() => void handleClick()}
            disabled={disabled || isSubmitting}
        >
            {isSubmitting ? copy.confirming : copy.label}
        </button>
    );
};
