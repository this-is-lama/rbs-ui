import { useState } from 'react';
import { cancelBookingForManagerOrOwner } from '@/entities/booking/api/cancel-booking.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';

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

    const handleClick = async () => {
        if (!window.confirm('Отменить это бронирование?')) {
            return;
        }

        try {
            setIsSubmitting(true);
            await cancelBookingForManagerOrOwner(bookingId);
            await onCancelled?.();
        } catch (error) {
            onError?.(getApiErrorMessage(error, 'Не удалось отменить бронирование'));
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
            {isSubmitting ? 'Отмена...' : label}
        </button>
    );
};
