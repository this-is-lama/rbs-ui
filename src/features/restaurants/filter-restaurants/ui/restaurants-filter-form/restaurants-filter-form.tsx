import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '@/app/providers/language';
import { useRestaurantFilters } from '@/features/restaurants/filter-restaurants/model';
import styles from './restaurants-filter-form.module.scss';

type RestaurantFiltersFormValues = {
    address: string;
    name: string;
};

type RestaurantsFilterFormProps = {
    onClose?: () => void;
};

export const RestaurantsFilterForm = ({ onClose }: RestaurantsFilterFormProps) => {
    const { language } = useLanguage();
    const { filters, setFilters } = useRestaurantFilters();

    const copy = language === 'en'
        ? {
            address: 'Address',
            addressPlaceholder: 'Enter an address',
            apply: 'Apply filters',
            name: 'Name',
            namePlaceholder: 'Enter a restaurant name',
            reset: 'Reset',
        }
        : {
            address: 'Адрес',
            addressPlaceholder: 'Введите адрес',
            apply: 'Применить фильтры',
            name: 'Название',
            namePlaceholder: 'Введите название ресторана',
            reset: 'Сбросить',
        };

    const form = useForm<RestaurantFiltersFormValues>({
        defaultValues: {
            name: filters.name,
            address: filters.address,
        },
    });

    useEffect(() => {
        form.reset({
            name: filters.name,
            address: filters.address,
        });
    }, [filters, form]);

    const onSubmit = form.handleSubmit((values) => {
        setFilters({
            name: values.name,
            address: values.address,
            category: filters.category,
        });

        onClose?.();
    });

    const handleReset = () => {
        form.reset({
            name: '',
            address: '',
        });

        setFilters({
            name: '',
            address: '',
            category: '',
        });

        onClose?.();
    };

    return (
        <div className={styles.panel}>
            <form onSubmit={onSubmit} className={styles.form}>
                <div className={styles.fields}>
                    <label className={styles.field}>
                        <span className={styles.label}>{copy.name}</span>
                        <input
                            className={styles.input}
                            placeholder={copy.namePlaceholder}
                            {...form.register('name')}
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.label}>{copy.address}</span>
                        <input
                            className={styles.input}
                            placeholder={copy.addressPlaceholder}
                            {...form.register('address')}
                        />
                    </label>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={handleReset}
                    >
                        {copy.reset}
                    </button>

                    <button type="submit" className={styles.primaryButton}>
                        {copy.apply}
                    </button>
                </div>
            </form>
        </div>
    );
};
