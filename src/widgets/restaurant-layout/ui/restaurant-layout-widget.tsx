import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, generatePath, useParams } from 'react-router-dom';
import { Footer } from '@/widgets/footer/Footer.tsx';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
import { getPhotoByCategory } from '@/entities/restaurant/lib/get-photo-by-category.ts';
import {
    createTable,
    deleteRestaurantPhotos,
    deleteTable,
    getRestaurantTables,
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
import { PhotoUploadManager } from '@/features/restaurants/manage-photos/ui/photo-upload-manager.tsx';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import pageStyles from '@/widgets/restaurant-management/shared/ManagerPage.module.scss';
import styles from './RestaurantLayoutWidget.module.scss';

type TableFormValues = {
    tableNumber: string;
    capacity: string;
    description: string;
    active: boolean;
    markerSize: string;
};

const defaultTableFormValues = (): TableFormValues => {
    return {
        tableNumber: '',
        capacity: '',
        description: '',
        active: true,
        markerSize: '46',
    };
};

const mapTableToFormValues = (table: RestaurantTable): TableFormValues => {
    return {
        tableNumber: String(table.tableNumber),
        capacity: String(table.capacity),
        description: table.description ?? '',
        active: table.active,
        markerSize: String(table.markerSize ?? 46),
    };
};

const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
};

const isPlaced = (table: RestaurantTable) => {
    return typeof table.positionX === 'number' && typeof table.positionY === 'number';
};

const buildTableRequest = (
    values: TableFormValues,
    currentTable?: RestaurantTable | null,
): TableManageRequest => {
    const parsedMarkerSize = Number.parseInt(values.markerSize, 10);

    return {
        tableNumber: Number.parseInt(values.tableNumber, 10),
        capacity: Number.parseInt(values.capacity, 10),
        description: values.description.trim() || null,
        active: values.active,
        positionX: currentTable?.positionX ?? null,
        positionY: currentTable?.positionY ?? null,
        markerSize: Number.isFinite(parsedMarkerSize) && parsedMarkerSize > 0 ? parsedMarkerSize : 46,
    };
};

const validateTableForm = (values: TableFormValues) => {
    const tableNumber = Number.parseInt(values.tableNumber, 10);
    const capacity = Number.parseInt(values.capacity, 10);
    const markerSize = Number.parseInt(values.markerSize, 10);

    if (!Number.isFinite(tableNumber) || tableNumber <= 0) {
        return 'Номер стола должен быть больше нуля';
    }

    if (!Number.isFinite(capacity) || capacity <= 0) {
        return 'Вместимость должна быть больше нуля';
    }

    if (!Number.isFinite(markerSize) || markerSize <= 0) {
        return 'Размер маркера должен быть больше нуля';
    }

    return '';
};

const schemeCategoryOption = [
    { value: 'SCHEME' as const, label: 'Схема зала' },
];

export const RestaurantLayoutWidget = () => {
    const { id } = useParams<{ id: string }>();
    const layoutRef = useRef<HTMLDivElement | null>(null);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [tableForm, setTableForm] = useState<TableFormValues>(defaultTableFormValues());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [isSavingLayout, setIsSavingLayout] = useState(false);
    const [isSubmittingTable, setIsSubmittingTable] = useState(false);
    const [deletingTableId, setDeletingTableId] = useState<string | null>(null);
    const [draggingTableId, setDraggingTableId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!id) {
            setError('Не найден идентификатор ресторана');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const [restaurantResponse, tablesResponse] = await Promise.all([
                getRestaurantById(id),
                getRestaurantTables(id),
            ]);

            setRestaurant(restaurantResponse);
            setTables(tablesResponse);
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
                        markerSize: table.markerSize ?? 46,
                    };
                });
            });
        };

        const handlePointerUp = () => {
            setDraggingTableId(null);
            setNotice('Позиции обновлены локально. Не забудьте сохранить схему.');
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [draggingTableId]);

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

    const handleStartCreate = () => {
        setSelectedTableId(null);
        setTableForm(defaultTableFormValues());
        setNotice('');
        setError('');
    };

    const handleEditTable = (table: RestaurantTable) => {
        setSelectedTableId(table.id);
        setTableForm(mapTableToFormValues(table));
        setNotice('');
        setError('');
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

    const handleSubmitTable = async () => {
        if (!id) {
            return;
        }

        const validationError = validateTableForm(tableForm);

        if (validationError) {
            setError(validationError);
            setNotice('');
            return;
        }

        try {
            setIsSubmittingTable(true);
            setError('');
            setNotice('');

            if (selectedTable) {
                await updateTable(id, selectedTable.id, buildTableRequest(tableForm, selectedTable));
                setNotice('Стол обновлён');
            } else {
                await createTable(id, buildTableRequest(tableForm));
                setNotice('Стол добавлен');
                setTableForm(defaultTableFormValues());
            }

            setSelectedTableId(null);
            await loadData();
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

        if (!window.confirm('Удалить стол?')) {
            return;
        }

        try {
            setDeletingTableId(tableId);
            setError('');
            setNotice('');
            await deleteTable(id, tableId);
            setNotice('Стол удалён');

            if (selectedTableId === tableId) {
                setSelectedTableId(null);
                setTableForm(defaultTableFormValues());
            }

            await loadData();
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось удалить стол'));
        } finally {
            setDeletingTableId(null);
        }
    };

    const handlePlaceTable = (tableId: string) => {
        setTables((currentTables) => {
            return currentTables.map((table) => {
                if (table.id !== tableId) {
                    return table;
                }

                return {
                    ...table,
                    positionX: table.positionX ?? 50,
                    positionY: table.positionY ?? 50,
                    markerSize: table.markerSize ?? 46,
                };
            });
        });

        setNotice('Стол размещён локально. Не забудьте сохранить схему.');
        setError('');
    };

    const handleUnplaceTable = async (table: RestaurantTable) => {
        if (!id) {
            return;
        }

        try {
            setError('');
            setNotice('');
            await updateTable(id, table.id, {
                tableNumber: table.tableNumber,
                capacity: table.capacity,
                description: table.description ?? null,
                active: table.active,
                positionX: null,
                positionY: null,
                markerSize: table.markerSize ?? 46,
            });
            setNotice('Стол убран со схемы');
            await loadData();
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось убрать стол со схемы'));
        }
    };

    const handleSaveLayout = async () => {
        if (!id) {
            return;
        }

        if (placedTables.length === 0) {
            setError('Разместите хотя бы один стол на схеме');
            setNotice('');
            return;
        }

        try {
            setIsSavingLayout(true);
            setError('');
            setNotice('');

            const response = await updateRestaurantLayout(id, {
                tables: placedTables.map((table) => ({
                    id: table.id,
                    positionX: table.positionX ?? 50,
                    positionY: table.positionY ?? 50,
                    markerSize: table.markerSize ?? 46,
                })),
            });

            setTables(response);
            setNotice('Схема сохранена');
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось сохранить схему'));
        } finally {
            setIsSavingLayout(false);
        }
    };

    const handleUploadScheme = async (draft: PhotoUploadDraft) => {
        if (!id) {
            return;
        }

        await uploadRestaurantPhotos(id, [{
            ...draft,
            category: 'SCHEME',
        }]);
        await loadData();
        setNotice('Схема зала загружена');
        setError('');
    };

    const handleDeleteScheme = async (photoId: string) => {
        if (!id) {
            return;
        }

        await deleteRestaurantPhotos(id, [photoId]);
        await loadData();
        setNotice('Схема удалена');
        setError('');
    };

    const handleMarkerPointerDown = (
        tableId: string,
        event: ReactPointerEvent<HTMLButtonElement>,
    ) => {
        event.preventDefault();
        setDraggingTableId(tableId);
    };

    const getMarkerStyle = (table: RestaurantTable): CSSProperties => {
        const markerSize = table.markerSize ?? 46;

        return {
            left: `${table.positionX}%`,
            top: `${table.positionY}%`,
            width: `${markerSize}px`,
            height: `${markerSize}px`,
            transform: 'translate(-50%, -50%)',
        };
    };

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
                                to={generatePath(RoutePaths.MY_RESTAURANT_EDIT, { id })}
                                className={pageStyles.link}
                            >
                                К управлению рестораном
                            </Link>
                        ) : null}

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

                <div className={styles.layoutGrid}>
                    <div className={styles.canvasCard}>
                        <div className={styles.canvasHeader}>
                            <div>
                                <h2 className={styles.panelTitle}>Схема зала</h2>
                                <p className={styles.panelDescription}>
                                    Перетаскивайте столы мышью и сохраняйте новое расположение.
                                </p>
                            </div>

                            <button
                                type="button"
                                className={styles.saveButton}
                                onClick={() => void handleSaveLayout()}
                                disabled={isSavingLayout}
                            >
                                {isSavingLayout ? 'Сохранение...' : 'Сохранить схему'}
                            </button>
                        </div>

                        <PhotoUploadManager
                            title="Фон схемы"
                            description="Можно загрузить или заменить фотографию схемы ресторана."
                            categories={schemeCategoryOption}
                            photos={schemePhoto ? [schemePhoto] : []}
                            emptyText="Фон схемы пока не загружен"
                            onUpload={handleUploadScheme}
                            onDelete={handleDeleteScheme}
                        />

                        <div ref={layoutRef} className={styles.canvas}>
                            {schemePhoto?.publicUrl ? (
                                <img
                                    src={schemePhoto.publicUrl}
                                    alt={`Схема зала ${restaurant?.name || 'ресторана'}`}
                                    className={styles.canvasImage}
                                />
                            ) : (
                                <div className={styles.canvasEmpty}>
                                    Пока нет фотографии схемы. Загрузите её выше, и столы появятся поверх изображения.
                                </div>
                            )}

                            {placedTables.map((table) => (
                                <button
                                    key={table.id}
                                    type="button"
                                    className={`${styles.marker} ${
                                        draggingTableId === table.id ? styles.markerDragging : ''
                                    } ${!table.active ? styles.markerInactive : ''}`}
                                    style={getMarkerStyle(table)}
                                    onPointerDown={(event) => handleMarkerPointerDown(table.id, event)}
                                    onClick={() => handleEditTable(table)}
                                >
                                    {table.tableNumber}
                                </button>
                            ))}
                        </div>

                        {notPlacedTables.length > 0 ? (
                            <div className={styles.unplacedBlock}>
                                <h3 className={styles.unplacedTitle}>Не размещены</h3>
                                <div className={styles.unplacedList}>
                                    {notPlacedTables.map((table) => (
                                        <button
                                            key={table.id}
                                            type="button"
                                            className={styles.unplacedButton}
                                            onClick={() => handlePlaceTable(table.id)}
                                        >
                                            Стол №{table.tableNumber} • до {table.capacity} гостей
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className={styles.sidebar}>
                        <section className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <h2 className={styles.panelTitle}>Столы</h2>
                                    <p className={styles.panelDescription}>
                                        Редактируйте существующие столы и быстро размещайте их на схеме.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className={styles.actionButton}
                                    onClick={handleStartCreate}
                                >
                                    Добавить стол
                                </button>
                            </div>

                            <div className={styles.list}>
                                {tables.map((table) => (
                                    <article
                                        key={table.id}
                                        className={`${styles.listItem} ${
                                            selectedTableId === table.id ? styles.listItemSelected : ''
                                        }`}
                                    >
                                        <div className={styles.listItemTop}>
                                            <div>
                                                <h3 className={styles.listItemTitle}>
                                                    Стол №{table.tableNumber}
                                                </h3>
                                                <div className={styles.listItemMeta}>
                                                    Вместимость: {table.capacity} • {table.active ? 'Активен' : 'Неактивен'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.listItemActions}>
                                            <button
                                                type="button"
                                                className={styles.miniButton}
                                                onClick={() => handleEditTable(table)}
                                            >
                                                Редактировать
                                            </button>

                                            {isPlaced(table) ? (
                                                <button
                                                    type="button"
                                                    className={styles.miniButton}
                                                    onClick={() => void handleUnplaceTable(table)}
                                                >
                                                    Убрать со схемы
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className={styles.miniButton}
                                                    onClick={() => handlePlaceTable(table.id)}
                                                >
                                                    Разместить
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className={styles.miniDangerButton}
                                                onClick={() => void handleDeleteTable(table.id)}
                                                disabled={deletingTableId === table.id}
                                            >
                                                {deletingTableId === table.id ? 'Удаление...' : 'Удалить'}
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <h2 className={styles.panelTitle}>
                                        {selectedTable ? `Стол №${selectedTable.tableNumber}` : 'Новый стол'}
                                    </h2>
                                    <p className={styles.panelDescription}>
                                        Заполните поля и сохраните изменения.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.form}>
                                <div className={styles.formGrid}>
                                    <div className={styles.field}>
                                        <label htmlFor="table-number" className={styles.label}>Номер стола</label>
                                        <input
                                            id="table-number"
                                            className={styles.input}
                                            inputMode="numeric"
                                            value={tableForm.tableNumber}
                                            onChange={(event) => handleTableFormChange('tableNumber', event.target.value)}
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label htmlFor="table-capacity" className={styles.label}>Вместимость</label>
                                        <input
                                            id="table-capacity"
                                            className={styles.input}
                                            inputMode="numeric"
                                            value={tableForm.capacity}
                                            onChange={(event) => handleTableFormChange('capacity', event.target.value)}
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label htmlFor="table-marker-size" className={styles.label}>Размер маркера</label>
                                        <input
                                            id="table-marker-size"
                                            className={styles.input}
                                            inputMode="numeric"
                                            value={tableForm.markerSize}
                                            onChange={(event) => handleTableFormChange('markerSize', event.target.value)}
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <span className={styles.label}>Статус</span>
                                        <label className={styles.checkboxRow}>
                                            <input
                                                type="checkbox"
                                                className={styles.checkboxInput}
                                                checked={tableForm.active}
                                                onChange={(event) => handleTableFormChange('active', event.target.checked)}
                                            />
                                            <span className={styles.checkboxLabel}>Стол активен</span>
                                        </label>
                                    </div>

                                    <div className={styles.field}>
                                        <label htmlFor="table-description" className={styles.label}>Описание</label>
                                        <textarea
                                            id="table-description"
                                            className={styles.textarea}
                                            value={tableForm.description}
                                            onChange={(event) => handleTableFormChange('description', event.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.hint}>
                                    Для нового стола координаты задаются после размещения на схеме.
                                </div>

                                <div className={pageStyles.actions}>
                                    <button
                                        type="button"
                                        className={styles.secondaryButton}
                                        onClick={handleStartCreate}
                                    >
                                        Сбросить форму
                                    </button>

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
                </div>
            </section>

            <Footer />
        </div>
    );
};
