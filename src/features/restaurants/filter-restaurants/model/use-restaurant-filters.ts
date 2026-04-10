import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;

export const useRestaurantFilters = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useMemo(() => {
        const pageValue = Number(searchParams.get('page') ?? DEFAULT_PAGE);
        const sizeValue = Number(searchParams.get('size') ?? DEFAULT_SIZE);

        return {
            name: searchParams.get('name') ?? '',
            category: searchParams.get('category') ?? '',
            address: searchParams.get('address') ?? '',
            page: Number.isNaN(pageValue) ? DEFAULT_PAGE : pageValue,
            size: Number.isNaN(sizeValue) ? DEFAULT_SIZE : sizeValue,
        };
    }, [searchParams]);

    const setFilters = (next: { name: string; category: string; address: string }) => {
        const params = new URLSearchParams();

        if (next.name.trim()) {
            params.set('name', next.name.trim());
        }

        if (next.category.trim()) {
            params.set('category', next.category.trim());
        }

        if (next.address.trim()) {
            params.set('address', next.address.trim());
        }

        params.set('page', '0');
        params.set('size', String(filters.size));

        setSearchParams(params);
    };

    const setCategory = (category: string) => {
        const params = new URLSearchParams(searchParams);

        if (category.trim()) {
            params.set('category', category.trim());
        } else {
            params.delete('category');
        }

        params.set('page', '0');
        params.set('size', String(filters.size));

        setSearchParams(params);
    };

    const setPage = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(page));
        params.set('size', String(filters.size));
        setSearchParams(params);
    };

    return {
        filters,
        setFilters,
        setCategory,
        setPage,
    };
};