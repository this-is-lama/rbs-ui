import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBookingSchema, type CreateBookingFormValues } from './create-booking.schema.ts';
import type { Booking } from '@/entities/booking/model';
import type { Restaurant, RestaurantCard } from '@/entities/restaurant/model';
import { createBooking } from '@/entities/booking/api';
import { getRestaurantById } from '@/entities/restaurant/api';
import { getApiErrorMessage } from '@/shared/lib/api';
import { fromDateTimeLocalValue, getDefaultBookingRange } from '@/shared/lib/date/booking-date.ts';

type UseCreateBookingFormParams = {
    restaurants: RestaurantCard[];
    initialRestaurantId?: string;
    initialTableId?: string;
    onCreated?: (booking: Booking) => void;
};

export const useCreateBookingForm = ({
                                         restaurants,
                                         initialRestaurantId = '',
                                         initialTableId = '',
                                         onCreated,
                                     }: UseCreateBookingFormParams) => {
    const defaultRange = useMemo(() => getDefaultBookingRange(), []);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [isRestaurantLoading, setIsRestaurantLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const form = useForm<CreateBookingFormValues>({
        resolver: zodResolver(createBookingSchema),
        mode: 'onBlur',
        defaultValues: {
            restaurantId: initialRestaurantId,
            tableId: initialTableId,
            startAt: defaultRange.startAt,
            endAt: defaultRange.endAt,
            guests: 2,
            comment: '',
        },
    });

    const restaurantId = form.watch('restaurantId');

    useEffect(() => {
        if (!initialRestaurantId) {
            return;
        }

        form.setValue('restaurantId', initialRestaurantId);
        if (initialTableId) {
            form.setValue('tableId', initialTableId);
        }
    }, [form, initialRestaurantId, initialTableId]);

    useEffect(() => {
        const loadRestaurant = async () => {
            if (!restaurantId) {
                setSelectedRestaurant(null);
                form.setValue('tableId', '');
                return;
            }

            try {
                setIsRestaurantLoading(true);
                setServerError('');
                const restaurant = await getRestaurantById(restaurantId);
                setSelectedRestaurant(restaurant);
            } catch (error) {
                setSelectedRestaurant(null);
                setServerError(getApiErrorMessage(error, 'Не удалось загрузить столы ресторана'));
            } finally {
                setIsRestaurantLoading(false);
            }
        };

        void loadRestaurant();
    }, [restaurantId, form]);

    useEffect(() => {
        const exists = selectedRestaurant?.tables?.some((table) => table.id === form.getValues('tableId'));

        if (!exists) {
            form.setValue('tableId', initialTableId && restaurantId === initialRestaurantId ? initialTableId : '');
        }
    }, [selectedRestaurant, form, initialRestaurantId, initialTableId, restaurantId]);

    const restaurantOptions = useMemo(() => {
        return restaurants.map((restaurant) => ({
            value: restaurant.id,
            label: restaurant.name,
        }));
    }, [restaurants]);

    const availableTables = useMemo(() => {
        if (!selectedRestaurant?.tables) {
            return [];
        }

        return selectedRestaurant.tables.filter((table) => table.active);
    }, [selectedRestaurant]);

    const onSubmit = form.handleSubmit(async (values) => {
        try {
            setServerError('');
            setSuccessMessage('');

            const booking = await createBooking({
                restaurantId: values.restaurantId,
                tableId: values.tableId,
                startAt: fromDateTimeLocalValue(values.startAt),
                endAt: fromDateTimeLocalValue(values.endAt),
                guests: values.guests,
                comment: values.comment?.trim() || undefined,
                dishes: [],
            });

            setSuccessMessage('Бронирование успешно создано');
            onCreated?.(booking);
        } catch (error) {
            setServerError(getApiErrorMessage(error, 'Не удалось создать бронирование'));
        }
    });

    return {
        ...form,
        onSubmit,
        serverError,
        successMessage,
        isRestaurantLoading,
        restaurantOptions,
        selectedRestaurant,
        availableTables,
    };
};
