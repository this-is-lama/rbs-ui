import type {
    Restaurant,
    RestaurantTable,
    TableManageRequest,
} from '@/entities/restaurant/model/types.ts';
import type { TableFormValues } from '../model/types.ts';

export const DRAG_THRESHOLD = 4;
export const MIN_CAPACITY = 1;
export const MAX_CAPACITY = 20;
export const MIN_MARKER_SIZE = 28;
export const MAX_MARKER_SIZE = 88;
export const DEFAULT_CAPACITY = 4;
export const DEFAULT_MARKER_SIZE = 46;
export const DEFAULT_TABLE_POSITION = 50;
export const allowedContentTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const defaultTableFormValues = (): TableFormValues => {
    return {
        tableNumber: '',
        capacity: String(DEFAULT_CAPACITY),
        description: '',
        active: true,
    };
};

export const mapTableToFormValues = (table: RestaurantTable): TableFormValues => {
    return {
        tableNumber: String(table.tableNumber),
        capacity: String(table.capacity),
        description: table.description ?? '',
        active: table.active,
    };
};

export const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
};

export const parseRangeValue = (value: string, fallback: number, min: number, max: number) => {
    const parsedValue = Number.parseInt(value, 10);

    if (!Number.isFinite(parsedValue)) {
        return fallback;
    }

    return clamp(parsedValue, min, max);
};

export const getMarkerSizeByCapacity = (capacity: number) => {
    const normalizedCapacity = clamp(capacity, MIN_CAPACITY, MAX_CAPACITY);
    const capacityRatio = (normalizedCapacity - MIN_CAPACITY) / (MAX_CAPACITY - MIN_CAPACITY);
    return Math.round(MIN_MARKER_SIZE + capacityRatio * (MAX_MARKER_SIZE - MIN_MARKER_SIZE));
};

export const normalizeTables = (tables?: Restaurant['tables'] | null): RestaurantTable[] => {
    if (!Array.isArray(tables)) {
        return [];
    }

    return tables.map((table) => ({
        ...table,
        description: table.description ?? '',
        markerSize: getMarkerSizeByCapacity(table.capacity),
    }));
};

export const isPlaced = (table: RestaurantTable) => {
    return typeof table.positionX === 'number' && typeof table.positionY === 'number';
};

export const buildTableRequest = (
    values: TableFormValues,
    currentTable?: RestaurantTable | null,
    shouldPlaceAtCenter = false,
): TableManageRequest => {
    const parsedCapacity = Number.parseInt(values.capacity, 10);
    const markerSize = Number.isFinite(parsedCapacity) && parsedCapacity > 0
        ? getMarkerSizeByCapacity(parsedCapacity)
        : DEFAULT_MARKER_SIZE;
    const nextPositionX = currentTable?.positionX ?? (shouldPlaceAtCenter ? DEFAULT_TABLE_POSITION : null);
    const nextPositionY = currentTable?.positionY ?? (shouldPlaceAtCenter ? DEFAULT_TABLE_POSITION : null);

    return {
        tableNumber: Number.parseInt(values.tableNumber, 10),
        capacity: parsedCapacity,
        description: values.description.trim() || null,
        active: values.active,
        positionX: nextPositionX,
        positionY: nextPositionY,
        markerSize,
    };
};

