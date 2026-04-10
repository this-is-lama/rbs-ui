import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRestaurantFilters } from '@/features/restaurants/filter-restaurants/model/use-restaurant-filters.ts';
import styles from './RestaurantsFilterForm.module.scss';

type RestaurantFiltersFormValues = {
    name: string;
    address: string;
};

export const RestaurantsFilterForm = () => {
    const { filters, setFilters } = useRestaurantFilters();

    const hasActiveFilters = useMemo(() => {
        return Boolean(
            filters.name.trim() ||
            filters.address.trim() ||
            filters.category.trim(),
        );
    }, [filters]);

    const [isOpen, setIsOpen] = useState(hasActiveFilters);

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

    useEffect(() => {
        if (hasActiveFilters) {
            setIsOpen(true);
        }
    }, [hasActiveFilters]);

    const onSubmit = form.handleSubmit((values) => {
        setFilters({
            name: values.name,
            address: values.address,
            category: filters.category,
        });
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
    };

    return (
        <div className={styles.wrapper}>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setIsOpen((current) => !current)}
                aria-expanded={isOpen}
            >
                {isOpen ? 'Скрыть фильтры' : 'Открыть фильтры'}
            </button>

            {isOpen ? (
                <div className={styles.panel}>
                    <form onSubmit={onSubmit} className={styles.form}>
                        <div className={styles.fields}>
                            <label className={styles.field}>
                                <span className={styles.label}>Название</span>
                                <input
                                    className={styles.input}
                                    placeholder="Введите название ресторана"
                                    {...form.register('name')}
                                />
                            </label>

                            <label className={styles.field}>
                                <span className={styles.label}>Адрес</span>
                                <input
                                    className={styles.input}
                                    placeholder="Введите адрес"
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
                                Сбросить
                            </button>

                            <button type="submit" className={styles.primaryButton}>
                                Применить фильтры
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}
        </div>
    );
};