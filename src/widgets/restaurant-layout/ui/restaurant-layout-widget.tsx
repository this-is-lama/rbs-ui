import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, generatePath, useParams } from 'react-router-dom';
import { Footer } from '@/widgets/footer/Footer.tsx';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
import { getPhotoByCategory } from '@/entities/restaurant/lib/get-photo-by-category.ts';
import { getRestaurantSchemeImageUrl } from '@/entities/restaurant/lib/get-restaurant-scheme-image-url.ts';
import {
    createTable,
    deleteRestaurantPhotos,
    deleteTable,
    updateRestaurantLayout,
    updateTable,
    uploadRestaurantPhotos,
} from '@/entities/restaurant/api/management.ts';
import type {
    PhotoUploadDraft,
    Restaurant,
    RestaurantTable,
    TableManageRequest,
} from '@/entities/restaurant/model/types.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { useConfirmDialog } from '@/shared/ui/confirm-dialog/ConfirmDialogProvider.tsx';
import { CloseIcon, PlusIcon } from '@/shared/ui/icons/action-icons.tsx';
import pageStyles from '@/widgets/restaurant-management/shared/ManagerPage.module.scss';
import styles from './RestaurantLayoutWidget.module.scss';

type TableFormValues = {
    tableNumber: string;
    capacity: string;
    description: string;
    active: boolean;
};

type PointerPosition = {
    x: number;
    y: number;
};

const DRAG_THRESHOLD = 4;
const MIN_CAPACITY = 1;
const MAX_CAPACITY = 20;
const MIN_MARKER_SIZE = 28;
const MAX_MARKER_SIZE = 88;
const DEFAULT_CAPACITY = 4;
const DEFAULT_MARKER_SIZE = 46;
const DEFAULT_TABLE_POSITION = 50;
const allowedContentTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const defaultTableFormValues = (): TableFormValues => {
    return {
        tableNumber: '',
        capacity: String(DEFAULT_CAPACITY),
        description: '',
        active: true,
    };
};

const mapTableToFormValues = (table: RestaurantTable): TableFormValues => {
    return {
        tableNumber: String(table.tableNumber),
        capacity: String(table.capacity),
        description: table.description ?? '',
        active: table.active,
    };
};

const normalizeTables = (tables?: Restaurant['tables'] | null): RestaurantTable[] => {
    if (!Array.isArray(tables)) {
        return [];
    }

    return tables.map((table) => ({
        ...table,
        description: table.description ?? '',
        markerSize: getMarkerSizeByCapacity(table.capacity),
    }));
};

const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
};

const parseRangeValue = (value: string, fallback: number, min: number, max: number) => {
    const parsedValue = Number.parseInt(value, 10);

    if (!Number.isFinite(parsedValue)) {
        return fallback;
    }

    return clamp(parsedValue, min, max);
};

const getMarkerSizeByCapacity = (capacity: number) => {
    const normalizedCapacity = clamp(capacity, MIN_CAPACITY, MAX_CAPACITY);
    const capacityRatio = (normalizedCapacity - MIN_CAPACITY) / (MAX_CAPACITY - MIN_CAPACITY);
    return Math.round(MIN_MARKER_SIZE + capacityRatio * (MAX_MARKER_SIZE - MIN_MARKER_SIZE));
};

const isPlaced = (table: RestaurantTable) => {
    return typeof table.positionX === 'number' && typeof table.positionY === 'number';
};

const buildTableRequest = (
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

const validateTableForm = (values: TableFormValues) => {
    const tableNumber = Number.parseInt(values.tableNumber, 10);
    const capacity = Number.parseInt(values.capacity, 10);

    if (!Number.isFinite(tableNumber) || tableNumber <= 0) {
        return 'Номер стола должен быть больше нуля';
    }

    if (!Number.isFinite(capacity) || capacity <= 0) {
        return 'Вместимость должна быть больше нуля';
    }

    return '';
};

const getDuplicateTableNumberError = (
    tableNumberValue: string,
    tables: RestaurantTable[],
    selectedTableId: string | null,
) => {
    const tableNumber = Number.parseInt(tableNumberValue, 10);

    if (!Number.isFinite(tableNumber) || tableNumber <= 0) {
        return '';
    }

    const hasDuplicate = tables.some((table) => {
        return table.tableNumber === tableNumber && table.id !== selectedTableId;
    });

    return hasDuplicate ? 'Стол с таким номером уже существует' : '';
};

export const RestaurantLayoutWidget = () => {
    const { id } = useParams<{ id: string }>();
    const layoutRef = useRef<HTMLDivElement | null>(null);
    const schemeFileInputRef = useRef<HTMLInputElement | null>(null);
    const pointerStartRef = useRef<PointerPosition | null>(null);
    const dragMovedRef = useRef(false);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [tableForm, setTableForm] = useState<TableFormValues>(defaultTableFormValues());
    const [selectedSchemeFile, setSelectedSchemeFile] = useState<File | null>(null);
    const [isTableEditorOpen, setIsTableEditorOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [isSavingLayout, setIsSavingLayout] = useState(false);
    const [isSubmittingTable, setIsSubmittingTable] = useState(false);
    const [isUploadingScheme, setIsUploadingScheme] = useState(false);
    const [isDeletingScheme, setIsDeletingScheme] = useState(false);
    const [deletingTableId, setDeletingTableId] = useState<string | null>(null);
    const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
    const confirmDialog = useConfirmDialog();

    const loadData = useCallback(async () => {
        if (!id) {
            setError('Не найден идентификатор ресторана');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const restaurantResponse = await getRestaurantById(id);

            setRestaurant(restaurantResponse);
            setTables(normalizeTables(restaurantResponse.tables));
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось загрузить схему ресторана'));
            setRestaurant(null);
            setTables([]);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    useEffect(() => {
        if (!draggingTableId) {
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            const layoutElement = layoutRef.current;

            if (!layoutElement) {
                return;
            }

            const rect = layoutElement.getBoundingClientRect();

            if (rect.width === 0 || rect.height === 0) {
                return;
            }

            const pointerStart = pointerStartRef.current;

            if (
                pointerStart
                && (
                    Math.abs(event.clientX - pointerStart.x) > DRAG_THRESHOLD
                    || Math.abs(event.clientY - pointerStart.y) > DRAG_THRESHOLD
                )
            ) {
                dragMovedRef.current = true;
            }

            const positionX = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
            const positionY = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);

            setTables((currentTables) => {
                return currentTables.map((table) => {
                    if (table.id !== draggingTableId) {
                        return table;
                    }

                    return {
                        ...table,
                        positionX,
                        positionY,
                        markerSize: getMarkerSizeByCapacity(table.capacity),
                    };
                });
            });
        };

        const handlePointerUp = () => {
            const hasDragged = dragMovedRef.current;

            setDraggingTableId(null);
            pointerStartRef.current = null;

            if (!hasDragged) {
                return;
            }

            setNotice('Позиции обновлены локально. Не забудьте сохранить схему.');
            window.setTimeout(() => {
                dragMovedRef.current = false;
            }, 0);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [draggingTableId]);

    const handleCloseEditor = useCallback(() => {
        if (isSubmittingTable) {
            return;
        }

        setSelectedTableId(null);
        setTableForm(defaultTableFormValues());
        setIsTableEditorOpen(false);
        setError('');
    }, [isSubmittingTable]);

    useEffect(() => {
        if (!isTableEditorOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleCloseEditor();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleCloseEditor, isTableEditorOpen]);

    useEffect(() => {
        if (!selectedTableId) {
            return;
        }

        const nextSelectedTable = tables.find((table) => table.id === selectedTableId);

        if (!nextSelectedTable) {
            setSelectedTableId(null);
            setTableForm(defaultTableFormValues());

            if (isTableEditorOpen) {
                setIsTableEditorOpen(false);
            }

            return;
        }

        setTableForm(mapTableToFormValues(nextSelectedTable));
    }, [isTableEditorOpen, selectedTableId, tables]);

    const placedTables = useMemo(() => {
        return tables.filter(isPlaced);
    }, [tables]);

    const notPlacedTables = useMemo(() => {
        return tables.filter((table) => !isPlaced(table));
    }, [tables]);

    const selectedTable = useMemo(() => {
        return tables.find((table) => table.id === selectedTableId) ?? null;
    }, [selectedTableId, tables]);

    const schemePhoto = useMemo(() => {
        return getPhotoByCategory(restaurant?.photos, 'SCHEME');
    }, [restaurant?.photos]);

    const schemePhotoIds = useMemo(() => {
        return (restaurant?.photos ?? [])
            .filter((photo) => photo.category === 'SCHEME')
            .map((photo) => photo.id);
    }, [restaurant?.photos]);
    const schemeImageUrl = useMemo(() => {
        return getRestaurantSchemeImageUrl(schemePhoto?.publicUrl ?? null);
    }, [schemePhoto?.publicUrl]);

    const capacityValue = useMemo(() => {
        return parseRangeValue(tableForm.capacity, DEFAULT_CAPACITY, MIN_CAPACITY, MAX_CAPACITY);
    }, [tableForm.capacity]);
    const duplicateTableNumberError = useMemo(() => {
        return getDuplicateTableNumberError(tableForm.tableNumber, tables, selectedTableId);
    }, [selectedTableId, tableForm.tableNumber, tables]);

    const resetSelectedSchemeFile = useCallback(() => {
        if (schemeFileInputRef.current) {
            schemeFileInputRef.current.value = '';
        }

        setSelectedSchemeFile(null);
    }, []);

    const handleStartCreate = () => {
        setSelectedTableId(null);
        setTableForm(defaultTableFormValues());
        setIsTableEditorOpen(true);
        setError('');
    };

    const handleEditTable = (table: RestaurantTable) => {
        setSelectedTableId(table.id);
        setTableForm(mapTableToFormValues(table));
        setIsTableEditorOpen(true);
        setError('');
    };

    const handleMarkerClick = (table: RestaurantTable) => {
        if (dragMovedRef.current) {
            return;
        }

        handleEditTable(table);
    };

    const handleTableFormChange = <Key extends keyof TableFormValues>(
        key: Key,
        value: TableFormValues[Key],
    ) => {
        setTableForm((currentValue) => ({
            ...currentValue,
            [key]: value,
        }));
    };

    const handleOpenSchemePicker = () => {
        if (isUploadingScheme || isDeletingScheme) {
            return;
        }

        schemeFileInputRef.current?.click();
    };

    const handleSchemeFileChange = (file: File | null) => {
        setSelectedSchemeFile(file);
        setError('');
    };

    const handleSubmitTable = async () => {
        if (!id) {
            return;
        }

        const validationError = validateTableForm(tableForm);

        if (validationError) {
            setError(validationError);
            return;
        }

        if (duplicateTableNumberError) {
            return;
        }

        try {
            setIsSubmittingTable(true);
            setError('');

            if (selectedTable) {
                await updateTable(
                    id,
                    selectedTable.id,
                    buildTableRequest(tableForm, selectedTable, !isPlaced(selectedTable)),
                );
                await loadData();
                setSelectedTableId(null);
                setTableForm(defaultTableFormValues());
                setIsTableEditorOpen(false);
                setNotice(
                    isPlaced(selectedTable)
                        ? 'Стол обновлён'
                        : 'Стол обновлён и размещён в центре схемы',
                );
                return;
            }

            await createTable(id, buildTableRequest(tableForm, null, true));
            await loadData();
            setSelectedTableId(null);
            setTableForm(defaultTableFormValues());
            setIsTableEditorOpen(false);
            setNotice('Стол добавлен и размещён в центре схемы');
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось сохранить стол'));
        } finally {
            setIsSubmittingTable(false);
        }
    };

    const handleDeleteTable = async (tableId: string) => {
        if (!id) {
            return;
        }

        const isConfirmed = await confirmDialog({
            title: 'Удалить стол?',
            description: 'Стол будет удалён из ресторана и исчезнет со схемы зала.',
            confirmText: 'Удалить стол',
        });

        if (!isConfirmed) {
            return;
        }

        try {
            setDeletingTableId(tableId);
            setError('');
            await deleteTable(id, tableId);
            setNotice('Стол удалён');

            if (selectedTableId === tableId) {
                handleCloseEditor();
            }

            await loadData();
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось удалить стол'));
        } finally {
            setDeletingTableId(null);
        }
    };

    const handleSaveLayout = async () => {
        if (!id) {
            return;
        }

        if (placedTables.length === 0) {
            setError('Разместите хотя бы один стол на схеме');
            return;
        }

        try {
            setIsSavingLayout(true);
            setError('');

            const normalizedPlacedTables = normalizeTables(placedTables);

            const response = await updateRestaurantLayout(id, {
                tables: normalizedPlacedTables.map((table) => ({
                    id: table.id,
                    positionX: table.positionX ?? 50,
                    positionY: table.positionY ?? 50,
                    markerSize: getMarkerSizeByCapacity(table.capacity),
                })),
            });

            const normalizedResponse = normalizeTables(response);
            setTables(normalizedResponse);
            setRestaurant((currentRestaurant) => {
                if (!currentRestaurant) {
                    return currentRestaurant;
                }

                return {
                    ...currentRestaurant,
                    tables: normalizedResponse,
                };
            });
            setNotice('Схема сохранена');
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось сохранить схему'));
        } finally {
            setIsSavingLayout(false);
        }
    };

    const handleUploadScheme = async () => {
        if (!id || !selectedSchemeFile) {
            setError('Выберите файл схемы');
            return;
        }

        if (!allowedContentTypes.has(selectedSchemeFile.type)) {
            setError('Поддерживаются только JPEG, PNG и WEBP');
            return;
        }

        try {
            setIsUploadingScheme(true);
            setError('');

            const uploadedIds = await uploadRestaurantPhotos(id, [{
                file: selectedSchemeFile,
                contentType: selectedSchemeFile.type,
                category: 'SCHEME',
                sortOrder: 0,
            } as PhotoUploadDraft]);

            const oldSchemeIds = schemePhotoIds.filter((photoId) => !uploadedIds.includes(photoId));

            if (oldSchemeIds.length > 0) {
                await deleteRestaurantPhotos(id, oldSchemeIds);
            }

            resetSelectedSchemeFile();
            await loadData();
            setNotice(schemePhoto ? 'Схема заменена' : 'Схема зала загружена');
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось загрузить схему'));
        } finally {
            setIsUploadingScheme(false);
        }
    };

    const handleDeleteScheme = async () => {
        if (!id || schemePhotoIds.length === 0) {
            return;
        }

        const isConfirmed = await confirmDialog({
            title: 'Удалить схему зала?',
            description: 'Собственная схема будет удалена, и вместо неё снова покажется стандартный белый фон.',
            confirmText: 'Удалить схему',
        });

        if (!isConfirmed) {
            return;
        }

        try {
            setIsDeletingScheme(true);
            setError('');
            await deleteRestaurantPhotos(id, schemePhotoIds);
            resetSelectedSchemeFile();
            await loadData();
            setNotice('Схема удалена');
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось удалить схему'));
        } finally {
            setIsDeletingScheme(false);
        }
    };

    const handleDeleteSchemeAction = async () => {
        if (selectedSchemeFile) {
            resetSelectedSchemeFile();
            setNotice('Выбранный файл схемы убран');
            setError('');
            return;
        }

        await handleDeleteScheme();
    };

    const handleMarkerPointerDown = (
        tableId: string,
        event: ReactPointerEvent<HTMLButtonElement>,
    ) => {
        event.preventDefault();
        pointerStartRef.current = {
            x: event.clientX,
            y: event.clientY,
        };
        dragMovedRef.current = false;
        setDraggingTableId(tableId);
    };

    const getMarkerStyle = (table: RestaurantTable): CSSProperties => {
        const markerSize = getMarkerSizeByCapacity(table.capacity);

        return {
            left: `${table.positionX}%`,
            top: `${table.positionY}%`,
            width: `${markerSize}px`,
            height: `${markerSize}px`,
            transform: 'translate(-50%, -50%)',
        };
    };
    const schemeStatusLabel = selectedSchemeFile
        ? 'Новый файл выбран. Нажмите «Сохранить», чтобы обновить схему.'
        : schemePhoto
            ? 'Пользовательская схема уже загружена для этого ресторана.'
            : 'Сейчас используется стандартный белый фон 1920×1080.';
    const visiblePendingTables = notPlacedTables.slice(0, 4);

    if (isLoading) {
        return (
            <div className={`container ${pageStyles.page}`}>
                <div className={pageStyles.state}>Загрузка схемы...</div>
            </div>
        );
    }

    if (error && !restaurant) {
        return (
            <div className={`container ${pageStyles.page}`}>
                <div className={pageStyles.state}>{error}</div>
            </div>
        );
    }

    return (
        <div className={pageStyles.page}>
            <section className={`container ${pageStyles.section}`}>
                <div className={pageStyles.header}>
                    <div className={pageStyles.titleBlock}>
                        <h1 className={pageStyles.title}>Редактор схемы</h1>
                        <p className={pageStyles.subtitle}>
                            {restaurant?.name || 'Ресторан'}
                        </p>
                    </div>

                    <div className={pageStyles.actions}>
                        {id ? (
                            <Link
                                to={generatePath(RoutePaths.RESTAURANT, { id })}
                                className={pageStyles.primaryLink}
                            >
                                Открыть страницу ресторана
                            </Link>
                        ) : null}
                    </div>
                </div>

                {notice ? <div className={styles.message}>{notice}</div> : null}
                {error ? <div className={styles.error}>{error}</div> : null}

                <div className={styles.canvasCard}>
                    <div className={styles.canvasHeader}>
                        <div>
                            <h2 className={styles.panelTitle}>Схема зала</h2>
                            <p className={styles.panelDescription}>
                                Перетаскивайте столы мышью, сохраняйте новую расстановку и при
                                необходимости загружайте свой фон схемы.
                            </p>
                        </div>
                    </div>

                    <input
                        ref={schemeFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className={styles.hiddenFileInput}
                        onChange={(event) => handleSchemeFileChange(event.target.files?.[0] ?? null)}
                    />

                    <div className={styles.controlGrid}>
                        <section className={styles.controlPanel}>
                            <div className={styles.controlPanelBody}>
                                <div>
                                    <h3 className={styles.panelTitle}>Загрузить схему</h3>
                                    <p className={styles.panelDescription}>
                                        Можно использовать своё изображение зала или оставить
                                        стандартный белый фон.
                                    </p>
                                </div>

                                <div className={schemePhoto ? styles.schemeState : styles.schemeStateMuted}>
                                    {selectedSchemeFile
                                        ? 'Новый файл выбран'
                                        : schemePhoto
                                            ? 'Схема загружена'
                                            : 'Стандартный фон'}
                                </div>

                                <p className={styles.controlPanelNote}>{schemeStatusLabel}</p>
                            </div>

                            <div className={styles.controlPanelFooter}>
                                <button
                                    type="button"
                                    className={`${styles.actionButton} ${styles.tilePrimaryButton}`}
                                    onClick={handleOpenSchemePicker}
                                    disabled={isUploadingScheme || isDeletingScheme}
                                >
                                    Загрузить схему
                                </button>

                                {selectedSchemeFile ? (
                                    <div className={styles.tileActions}>
                                        <button
                                            type="button"
                                            className={styles.secondaryButton}
                                            onClick={() => void handleUploadScheme()}
                                            disabled={isUploadingScheme || isDeletingScheme}
                                        >
                                            {isUploadingScheme ? 'Сохранение...' : 'Сохранить'}
                                        </button>

                                        <button
                                            type="button"
                                            className={styles.dangerButton}
                                            onClick={() => void handleDeleteSchemeAction()}
                                            disabled={isUploadingScheme || isDeletingScheme}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                ) : schemePhoto ? (
                                    <button
                                        type="button"
                                        className={`${styles.dangerButton} ${styles.tilePrimaryButton}`}
                                        onClick={() => void handleDeleteSchemeAction()}
                                        disabled={isUploadingScheme || isDeletingScheme}
                                    >
                                        {isDeletingScheme ? 'Удаление...' : 'Удалить схему'}
                                    </button>
                                ) : null}
                            </div>
                        </section>

                        <section className={styles.controlPanel}>
                            <div className={styles.controlPanelBody}>
                                <div>
                                    <h3 className={styles.panelTitle}>Добавить стол</h3>
                                    <p className={styles.panelDescription}>
                                        После сохранения новый стол сразу появится в центре схемы.
                                    </p>
                                </div>

                                <div className={styles.panelMetrics}>
                                    <div className={styles.infoBadge}>Всего столов: {tables.length}</div>
                                    <div className={styles.infoBadgeMuted}>На схеме: {placedTables.length}</div>
                                </div>

                                {notPlacedTables.length > 0 ? (
                                    <div className={styles.pendingTables}>
                                        <p className={styles.controlPanelNote}>
                                            Без координат: {notPlacedTables.length}. Откройте стол и
                                            нажмите «Сохранить стол», чтобы поставить его в центр.
                                        </p>

                                        <div className={styles.pendingTableList}>
                                            {visiblePendingTables.map((table) => (
                                                <button
                                                    key={table.id}
                                                    type="button"
                                                    className={`${styles.unplacedButton} ${
                                                        isTableEditorOpen && selectedTableId === table.id
                                                            ? styles.unplacedButtonActive
                                                            : ''
                                                    }`}
                                                    onClick={() => handleEditTable(table)}
                                                >
                                                    Стол №{table.tableNumber}
                                                </button>
                                            ))}

                                            {notPlacedTables.length > visiblePendingTables.length ? (
                                                <div className={styles.pendingTableCounter}>
                                                    +{notPlacedTables.length - visiblePendingTables.length}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : (
                                    <p className={styles.controlPanelNote}>
                                        Все активные столы уже находятся на схеме.
                                    </p>
                                )}
                            </div>

                            <div className={styles.controlPanelFooter}>
                                <button
                                    type="button"
                                    className={`${styles.secondaryButton} ${styles.tilePrimaryButton}`}
                                    onClick={handleStartCreate}
                                >
                                    <PlusIcon className={styles.actionIcon} />
                                    <span>Добавить стол</span>
                                </button>
                            </div>
                        </section>

                        <section className={styles.controlPanel}>
                            <div className={styles.controlPanelBody}>
                                <div>
                                    <h3 className={styles.panelTitle}>Сохранить схему</h3>
                                    <p className={styles.panelDescription}>
                                        Сохраняйте новую расстановку после перетаскивания столов или
                                        изменения их параметров.
                                    </p>
                                </div>

                                <div className={styles.panelMetrics}>
                                    <div className={styles.infoBadge}>На схеме: {placedTables.length}</div>
                                    <div className={styles.infoBadgeMuted}>
                                        Без координат: {notPlacedTables.length}
                                    </div>
                                </div>

                                <p className={styles.controlPanelNote}>
                                    {placedTables.length > 0
                                        ? 'После сохранения новая схема сразу отобразится на странице ресторана.'
                                        : 'Сначала добавьте хотя бы один стол на схему.'}
                                </p>
                            </div>

                            <div className={styles.controlPanelFooter}>
                                <button
                                    type="button"
                                    className={`${styles.saveButton} ${styles.tilePrimaryButton}`}
                                    onClick={() => void handleSaveLayout()}
                                    disabled={isSavingLayout || placedTables.length === 0}
                                >
                                    {isSavingLayout ? 'Сохранение...' : 'Сохранить схему'}
                                </button>
                            </div>
                        </section>
                    </div>

                    <div ref={layoutRef} className={styles.canvas}>
                        <img
                            src={schemeImageUrl}
                            alt={`Схема зала ${restaurant?.name || 'ресторана'}`}
                            className={styles.canvasImage}
                        />

                        {placedTables.map((table) => (
                            <button
                                key={table.id}
                                type="button"
                                className={`${styles.marker} ${
                                    draggingTableId === table.id ? styles.markerDragging : ''
                                } ${!table.active ? styles.markerInactive : ''} ${
                                    isTableEditorOpen && selectedTableId === table.id
                                        ? styles.markerSelected
                                        : ''
                                }`}
                                style={getMarkerStyle(table)}
                                onPointerDown={(event) => handleMarkerPointerDown(table.id, event)}
                                onClick={() => handleMarkerClick(table)}
                                title={`Стол №${table.tableNumber}`}
                            >
                                {table.tableNumber}
                            </button>
                        ))}
                    </div>
                </div>

                {isTableEditorOpen ? (
                    <div
                        className={styles.editorBackdrop}
                        onClick={handleCloseEditor}
                        role="presentation"
                    >
                        <section
                            className={styles.editorModal}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className={styles.editorHeader}>
                                <div className={styles.editorTitleBlock}>
                                    <h2 className={styles.panelTitle}>
                                        {selectedTable ? `Стол №${selectedTable.tableNumber}` : 'Новый стол'}
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    className={styles.closeButton}
                                    onClick={handleCloseEditor}
                                    aria-label="Закрыть параметры стола"
                                >
                                    <CloseIcon className={styles.closeIcon} />
                                </button>
                            </div>

                            {selectedTable ? (
                                <div className={styles.editorMetaRow}>
                                    <div className={styles.editorChip}>
                                        До {selectedTable.capacity} гостей
                                    </div>
                                    <div className={styles.editorChip}>
                                        {isPlaced(selectedTable) ? 'Размещён на схеме' : 'Не размещён на схеме'}
                                    </div>
                                    {!selectedTable.active ? (
                                        <div className={styles.editorChipMuted}>Неактивен</div>
                                    ) : null}
                                </div>
                            ) : null}

                            <div className={styles.form}>
                                <div className={styles.controlsGrid}>
                                    <div className={styles.controlCard}>
                                        <div className={styles.controlCardHeader}>
                                            <span className={styles.controlCardTitle}>Номер стола</span>
                                            <span className={styles.controlCardValue}>
                                                {tableForm.tableNumber ? `№${tableForm.tableNumber}` : 'Новый'}
                                            </span>
                                        </div>

                                        <input
                                            id="table-number"
                                            className={`${styles.input} ${styles.tableNumberInput}`}
                                            inputMode="numeric"
                                            value={tableForm.tableNumber}
                                            onChange={(event) => handleTableFormChange('tableNumber', event.target.value)}
                                        />

                                        {duplicateTableNumberError ? (
                                            <div className={styles.fieldError}>{duplicateTableNumberError}</div>
                                        ) : null}
                                    </div>

                                    <label className={styles.controlCard}>
                                        <div className={styles.controlCardHeader}>
                                            <span className={styles.controlCardTitle}>Вместимость</span>
                                            <span className={styles.controlCardValue}>{capacityValue} гостей</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={MIN_CAPACITY}
                                            max={MAX_CAPACITY}
                                            step={1}
                                            className={styles.rangeInput}
                                            value={capacityValue}
                                            onChange={(event) => {
                                                handleTableFormChange('capacity', event.target.value);
                                            }}
                                        />
                                        <div className={styles.rangeScale}>
                                            <span>{MIN_CAPACITY}</span>
                                            <span>{MAX_CAPACITY}</span>
                                        </div>
                                    </label>

                                    <label
                                        className={`${styles.controlCard} ${
                                            tableForm.active ? styles.activityCardActive : styles.activityCardInactive
                                        }`}
                                    >
                                        <div className={styles.controlCardHeader}>
                                            <span className={styles.controlCardTitle}>Активность</span>
                                            <span className={styles.controlCardValue}>
                                                {tableForm.active ? 'Активен' : 'Неактивен'}
                                            </span>
                                        </div>

                                        <span className={styles.activityCardHint}>
                                            {tableForm.active
                                                ? 'Стол доступен для бронирования'
                                                : 'Стол скрыт из бронирования'}
                                        </span>

                                        <span className={styles.switchRow}>
                                            <span className={styles.switchCaption}>
                                                {tableForm.active ? 'Включён' : 'Выключен'}
                                            </span>

                                            <span className={styles.switchControl}>
                                                <input
                                                    type="checkbox"
                                                    className={styles.switchInput}
                                                    checked={tableForm.active}
                                                    onChange={(event) => {
                                                        handleTableFormChange('active', event.target.checked);
                                                    }}
                                                />
                                                <span className={styles.switchTrack}>
                                                    <span className={styles.switchThumb} />
                                                </span>
                                            </span>
                                        </span>
                                    </label>
                                </div>

                                <div className={`${styles.field} ${styles.fullWidth}`}>
                                    <label htmlFor="table-description" className={styles.label}>Описание</label>
                                    <textarea
                                        id="table-description"
                                        className={styles.textarea}
                                        value={tableForm.description}
                                        onChange={(event) => handleTableFormChange('description', event.target.value)}
                                    />
                                </div>

                                <div className={styles.hint}>
                                    {selectedTable && !isPlaced(selectedTable)
                                        ? 'После сохранения стол появится в центре схемы.'
                                        : 'После сохранения вы можете перетащить стол на схеме и затем сохранить общую расстановку.'}
                                </div>

                                <div className={styles.editorActions}>
                                    {selectedTable ? (
                                        <button
                                            type="button"
                                            className={styles.dangerButton}
                                            onClick={() => void handleDeleteTable(selectedTable.id)}
                                            disabled={deletingTableId === selectedTable.id}
                                        >
                                            {deletingTableId === selectedTable.id ? 'Удаление...' : 'Удалить'}
                                        </button>
                                    ) : null}

                                    <button
                                        type="button"
                                        className={styles.actionButton}
                                        onClick={() => void handleSubmitTable()}
                                        disabled={isSubmittingTable}
                                    >
                                        {isSubmittingTable ? 'Сохранение...' : 'Сохранить стол'}
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                ) : null}
            </section>

            <Footer />
        </div>
    );
};
