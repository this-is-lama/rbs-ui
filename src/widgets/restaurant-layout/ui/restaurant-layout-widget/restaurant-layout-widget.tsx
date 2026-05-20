import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, generatePath, useParams } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
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
} from '@/entities/restaurant/model/types.ts';
import type { AppLanguage } from '@/shared/config/language.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { useConfirmDialog } from '@/shared/ui/confirm-dialog/use-confirm-dialog.ts';
import { CloseIcon, PlusIcon } from '@/shared/ui/icons/action-icons.tsx';
import { Footer } from '@/widgets/footer/Footer.tsx';
import pageStyles from '@/widgets/restaurant-management/shared/ManagerPage.module.scss';
import {
    allowedContentTypes,
    buildTableRequest,
    clamp,
    DEFAULT_CAPACITY,
    defaultTableFormValues,
    DRAG_THRESHOLD,
    getMarkerSizeByCapacity,
    isPlaced,
    mapTableToFormValues,
    MAX_CAPACITY,
    MIN_CAPACITY,
    normalizeTables,
    parseRangeValue,
} from '../../lib/restaurant-layout.ts';
import type { PointerPosition, TableFormValues } from '../../model/types.ts';
import styles from './restaurant-layout-widget.module.scss';

const validateTableForm = (values: TableFormValues, language: AppLanguage) => {
    const tableNumber = Number.parseInt(values.tableNumber, 10);
    const capacity = Number.parseInt(values.capacity, 10);

    if (!Number.isFinite(tableNumber) || tableNumber <= 0) {
        return language === 'en'
            ? 'Table number must be greater than zero'
            : 'Номер стола должен быть больше нуля';
    }

    if (!Number.isFinite(capacity) || capacity <= 0) {
        return language === 'en'
            ? 'Capacity must be greater than zero'
            : 'Вместимость должна быть больше нуля';
    }

    return '';
};

const getDuplicateTableNumberError = (
    tableNumberValue: string,
    tables: RestaurantTable[],
    selectedTableId: string | null,
    language: AppLanguage,
) => {
    const tableNumber = Number.parseInt(tableNumberValue, 10);

    if (!Number.isFinite(tableNumber) || tableNumber <= 0) {
        return '';
    }

    const hasDuplicate = tables.some((table) => {
        return table.tableNumber === tableNumber && table.id !== selectedTableId;
    });

    return hasDuplicate
        ? (language === 'en' ? 'A table with this number already exists' : 'Стол с таким номером уже существует')
        : '';
};

export const RestaurantLayoutWidget = () => {
    const { id } = useParams<{ id: string }>();
    const { language } = useLanguage();
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
    const copy = language === 'en'
        ? {
            active: 'Active',
            activity: 'Availability',
            activityHintActive: 'The table is available for booking',
            activityHintInactive: 'The table is hidden from booking',
            addTable: 'Add table',
            addTableDescription: 'The new table will appear in the center of the floor plan after saving.',
            addedAndCentered: 'Table added and placed in the center of the floor plan',
            addToCenterHint: 'Open a table and click "Save table" to place it in the center.',
            backgroundDefault: 'Default background',
            capacity: 'Capacity',
            centeredHint: 'After saving, the table will appear in the center of the floor plan.',
            closeEditor: 'Close table settings',
            defaultBackgroundDescription: 'A standard white 1920×1080 background is used now.',
            delete: 'Delete',
            deleteLoading: 'Deleting...',
            deleteScheme: 'Delete floor plan',
            deleteSchemeConfirm: 'Delete floor plan',
            deleteSchemeDescription: 'The custom floor plan will be removed and replaced with the default white background.',
            deleteSchemeError: 'Failed to delete floor plan',
            deleteSchemeTitle: 'Delete floor plan?',
            deleteTableConfirm: 'Delete table',
            deleteTableDescription: 'The table will be removed from the restaurant and disappear from the floor plan.',
            deleteTableError: 'Failed to delete table',
            deleteTableSuccess: 'Table removed',
            deleteTableTitle: 'Delete table?',
            description: 'Description',
            disabled: 'Inactive',
            duplicateTable: 'A table with this number already exists',
            editPageTitle: 'Floor plan editor',
            fileRemoved: 'The selected floor plan file was removed',
            fileRequired: 'Select a floor plan file',
            loading: 'Loading floor plan...',
            loadError: 'Failed to load restaurant floor plan',
            missingRestaurantId: 'Restaurant id was not found',
            newFileSelected: 'New file selected',
            newFileStatus: 'A new file is selected. Click "Save" to update the floor plan.',
            newTable: 'New table',
            notPlaced: 'Not placed on the floor plan',
            noticeDrag: 'Positions updated locally. Do not forget to save the floor plan.',
            openRestaurant: 'Open restaurant page',
            pendingCount: (count: number) => `Without coordinates: ${count}.`,
            placedCount: (count: number) => `On plan: ${count}`,
            placeOneTable: 'Place at least one table on the floor plan',
            save: 'Save',
            saved: 'Floor plan saved',
            saveLayout: 'Save floor plan',
            saveLayoutDescription: 'Save the new arrangement after dragging tables or changing their settings.',
            saveLayoutHintEmpty: 'Add at least one table to the floor plan first.',
            saveLayoutHintReady: 'The new floor plan will immediately appear on the restaurant page after saving.',
            saveLoading: 'Saving...',
            saveSchemeError: 'Failed to save floor plan',
            saveTable: 'Save table',
            saveTableError: 'Failed to save table',
            schemeAlt: (restaurantName: string) => `Floor plan of ${restaurantName}`,
            schemeDescription: 'Drag tables with the mouse, save the new arrangement, and upload your own background if needed.',
            schemeLoaded: 'Floor plan uploaded',
            schemeLoadedStatus: 'A custom floor plan is already uploaded for this restaurant.',
            schemeMissingLabel: 'Default background',
            schemePanelTitle: 'Floor plan',
            schemeRemoved: 'Floor plan removed',
            schemeReplaced: 'Floor plan replaced',
            schemeUploadButton: 'Upload floor plan',
            schemeUploadDescription: 'You can use your own hall image or keep the default white background.',
            schemeUploadError: 'Failed to upload floor plan',
            selectedTableGuests: (count: number) => `Up to ${count} guests`,
            selectedTableLabel: (tableNumber: number) => `Table #${tableNumber}`,
            selectedTableTitle: (tableNumber: number) => `Table #${tableNumber}`,
            showOnPlan: 'Placed on the floor plan',
            standardBackground: 'Default white background',
            submitTableUpdated: 'Table updated',
            submitTableUpdatedCentered: 'Table updated and placed in the center of the floor plan',
            supportedFormats: 'Only JPEG, PNG, and WEBP are supported',
            tableCount: (count: number) => `Total tables: ${count}`,
            tableNumber: 'Table number',
            tableNumberPlaceholder: 'New',
            tableStatusOff: 'Off',
            tableStatusOn: 'On',
            titleRestaurantFallback: 'Restaurant',
            uploadSectionTitle: 'Upload floor plan',
        }
        : {
            active: 'Активен',
            activity: 'Активность',
            activityHintActive: 'Стол доступен для бронирования',
            activityHintInactive: 'Стол скрыт из бронирования',
            addTable: 'Добавить стол',
            addTableDescription: 'После сохранения новый стол сразу появится в центре схемы.',
            addedAndCentered: 'Стол добавлен и размещён в центре схемы',
            addToCenterHint: 'Откройте стол и нажмите «Сохранить стол», чтобы поставить его в центр.',
            backgroundDefault: 'Стандартный фон',
            capacity: 'Вместимость',
            centeredHint: 'После сохранения стол появится в центре схемы.',
            closeEditor: 'Закрыть параметры стола',
            defaultBackgroundDescription: 'Сейчас используется стандартный белый фон 1920×1080.',
            delete: 'Удалить',
            deleteLoading: 'Удаление...',
            deleteScheme: 'Удалить схему',
            deleteSchemeConfirm: 'Удалить схему',
            deleteSchemeDescription: 'Собственная схема будет удалена, и вместо неё снова покажется стандартный белый фон.',
            deleteSchemeError: 'Не удалось удалить схему',
            deleteSchemeTitle: 'Удалить схему зала?',
            deleteTableConfirm: 'Удалить стол',
            deleteTableDescription: 'Стол будет удалён из ресторана и исчезнет со схемы зала.',
            deleteTableError: 'Не удалось удалить стол',
            deleteTableSuccess: 'Стол удалён',
            deleteTableTitle: 'Удалить стол?',
            description: 'Описание',
            disabled: 'Неактивен',
            duplicateTable: 'Стол с таким номером уже существует',
            editPageTitle: 'Редактор схемы',
            fileRemoved: 'Выбранный файл схемы убран',
            fileRequired: 'Выберите файл схемы',
            loading: 'Загрузка схемы...',
            loadError: 'Не удалось загрузить схему ресторана',
            missingRestaurantId: 'Не найден идентификатор ресторана',
            newFileSelected: 'Новый файл выбран',
            newFileStatus: 'Новый файл выбран. Нажмите «Сохранить», чтобы обновить схему.',
            newTable: 'Новый стол',
            notPlaced: 'Не размещён на схеме',
            noticeDrag: 'Позиции обновлены локально. Не забудьте сохранить схему.',
            openRestaurant: 'Открыть страницу ресторана',
            pendingCount: (count: number) => `Без координат: ${count}.`,
            placedCount: (count: number) => `На схеме: ${count}`,
            placeOneTable: 'Разместите хотя бы один стол на схеме',
            save: 'Сохранить',
            saved: 'Схема сохранена',
            saveLayout: 'Сохранить схему',
            saveLayoutDescription: 'Сохраняйте новую расстановку после перетаскивания столов или изменения их параметров.',
            saveLayoutHintEmpty: 'Сначала добавьте хотя бы один стол на схему.',
            saveLayoutHintReady: 'После сохранения новая схема сразу отобразится на странице ресторана.',
            saveLoading: 'Сохранение...',
            saveSchemeError: 'Не удалось сохранить схему',
            saveTable: 'Сохранить стол',
            saveTableError: 'Не удалось сохранить стол',
            schemeAlt: (restaurantName: string) => `Схема зала ${restaurantName}`,
            schemeDescription: 'Перетаскивайте столы мышью, сохраняйте новую расстановку и при необходимости загружайте свой фон схемы.',
            schemeLoaded: 'Схема загружена',
            schemeLoadedStatus: 'Пользовательская схема уже загружена для этого ресторана.',
            schemeMissingLabel: 'Стандартный фон',
            schemePanelTitle: 'Схема зала',
            schemeRemoved: 'Схема удалена',
            schemeReplaced: 'Схема заменена',
            schemeUploadButton: 'Загрузить схему',
            schemeUploadDescription: 'Можно использовать своё изображение зала или оставить стандартный белый фон.',
            schemeUploadError: 'Не удалось загрузить схему',
            selectedTableGuests: (count: number) => `До ${count} гостей`,
            selectedTableLabel: (tableNumber: number) => `Стол №${tableNumber}`,
            selectedTableTitle: (tableNumber: number) => `Стол №${tableNumber}`,
            showOnPlan: 'Размещён на схеме',
            standardBackground: 'Стандартный белый фон',
            submitTableUpdated: 'Стол обновлён',
            submitTableUpdatedCentered: 'Стол обновлён и размещён в центре схемы',
            supportedFormats: 'Поддерживаются только JPEG, PNG и WEBP',
            tableCount: (count: number) => `Всего столов: ${count}`,
            tableNumber: 'Номер стола',
            tableNumberPlaceholder: 'Новый',
            tableStatusOff: 'Выключен',
            tableStatusOn: 'Включён',
            titleRestaurantFallback: 'Ресторан',
            uploadSectionTitle: 'Загрузить схему',
        };

    const loadData = useCallback(async () => {
        if (!id) {
            setError(copy.missingRestaurantId);
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
            setError(getApiErrorMessage(requestError, copy.loadError));
            setRestaurant(null);
            setTables([]);
        } finally {
            setIsLoading(false);
        }
    }, [copy.loadError, copy.missingRestaurantId, id]);

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

            setNotice(copy.noticeDrag);
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
    }, [copy.noticeDrag, draggingTableId]);

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
        return getDuplicateTableNumberError(tableForm.tableNumber, tables, selectedTableId, language);
    }, [language, selectedTableId, tableForm.tableNumber, tables]);

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

        const validationError = validateTableForm(tableForm, language);

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
                        ? copy.submitTableUpdated
                        : copy.submitTableUpdatedCentered,
                );
                return;
            }

            await createTable(id, buildTableRequest(tableForm, null, true));
            await loadData();
            setSelectedTableId(null);
            setTableForm(defaultTableFormValues());
            setIsTableEditorOpen(false);
            setNotice(copy.addedAndCentered);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, copy.saveTableError));
        } finally {
            setIsSubmittingTable(false);
        }
    };

    const handleDeleteTable = async (tableId: string) => {
        if (!id) {
            return;
        }

        const isConfirmed = await confirmDialog({
            title: copy.deleteTableTitle,
            description: copy.deleteTableDescription,
            confirmText: copy.deleteTableConfirm,
        });

        if (!isConfirmed) {
            return;
        }

        try {
            setDeletingTableId(tableId);
            setError('');
            await deleteTable(id, tableId);
            setNotice(copy.deleteTableSuccess);

            if (selectedTableId === tableId) {
                handleCloseEditor();
            }

            await loadData();
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, copy.deleteTableError));
        } finally {
            setDeletingTableId(null);
        }
    };

    const handleSaveLayout = async () => {
        if (!id) {
            return;
        }

        if (placedTables.length === 0) {
            setError(copy.placeOneTable);
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
            setNotice(copy.saved);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, copy.saveSchemeError));
        } finally {
            setIsSavingLayout(false);
        }
    };

    const handleUploadScheme = async () => {
        if (!id || !selectedSchemeFile) {
            setError(copy.fileRequired);
            return;
        }

        if (!allowedContentTypes.has(selectedSchemeFile.type)) {
            setError(copy.supportedFormats);
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
            setNotice(schemePhoto ? copy.schemeReplaced : copy.schemeLoaded);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, copy.schemeUploadError));
        } finally {
            setIsUploadingScheme(false);
        }
    };

    const handleDeleteScheme = async () => {
        if (!id || schemePhotoIds.length === 0) {
            return;
        }

        const isConfirmed = await confirmDialog({
            title: copy.deleteSchemeTitle,
            description: copy.deleteSchemeDescription,
            confirmText: copy.deleteSchemeConfirm,
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
            setNotice(copy.schemeRemoved);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, copy.deleteSchemeError));
        } finally {
            setIsDeletingScheme(false);
        }
    };

    const handleDeleteSchemeAction = async () => {
        if (selectedSchemeFile) {
            resetSelectedSchemeFile();
            setNotice(copy.fileRemoved);
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
    const visiblePendingTables = notPlacedTables.slice(0, 4);

    if (isLoading) {
        return (
            <div className={`container ${pageStyles.page}`}>
                <div className={pageStyles.state}>{copy.loading}</div>
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
                        <h1 className={pageStyles.title}>{copy.editPageTitle}</h1>
                    </div>

                    <div className={pageStyles.actions}>
                        {id ? (
                            <Link
                                to={generatePath(RoutePaths.RESTAURANT, { id })}
                                className={pageStyles.primaryLink}
                            >
                                {copy.openRestaurant}
                            </Link>
                        ) : null}
                    </div>
                </div>

                {notice ? <div className={styles.message}>{notice}</div> : null}
                {error ? <div className={styles.error}>{error}</div> : null}

                <div className={styles.canvasCard}>
                    <div className={styles.canvasHeader}>
                        <div>
                            <h2 className={styles.panelTitle}>{copy.schemePanelTitle}</h2>
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
                                    <h3 className={styles.panelTitle}>{copy.uploadSectionTitle}</h3>
                                </div>

                                <div className={schemePhoto ? styles.schemeState : styles.schemeStateMuted}>
                                    {selectedSchemeFile
                                        ? copy.newFileSelected
                                        : schemePhoto
                                            ? copy.schemeLoaded
                                            : copy.schemeMissingLabel}
                                </div>

                            </div>

                            <div className={styles.controlPanelFooter}>
                                <button
                                    type="button"
                                    className={`${styles.actionButton} ${styles.tilePrimaryButton}`}
                                    onClick={handleOpenSchemePicker}
                                    disabled={isUploadingScheme || isDeletingScheme}
                                >
                                    {copy.schemeUploadButton}
                                </button>

                                {selectedSchemeFile ? (
                                    <div className={styles.tileActions}>
                                        <button
                                            type="button"
                                            className={styles.secondaryButton}
                                            onClick={() => void handleUploadScheme()}
                                            disabled={isUploadingScheme || isDeletingScheme}
                                        >
                                            {isUploadingScheme ? copy.saveLoading : copy.save}
                                        </button>

                                        <button
                                            type="button"
                                            className={styles.dangerButton}
                                            onClick={() => void handleDeleteSchemeAction()}
                                            disabled={isUploadingScheme || isDeletingScheme}
                                        >
                                            {copy.delete}
                                        </button>
                                    </div>
                                ) : schemePhoto ? (
                                    <button
                                        type="button"
                                        className={`${styles.dangerButton} ${styles.tilePrimaryButton}`}
                                        onClick={() => void handleDeleteSchemeAction()}
                                        disabled={isUploadingScheme || isDeletingScheme}
                                    >
                                        {isDeletingScheme ? copy.deleteLoading : copy.deleteScheme}
                                    </button>
                                ) : null}
                            </div>
                        </section>

                        <section className={styles.controlPanel}>
                            <div className={styles.controlPanelBody}>
                                <div>
                                    <h3 className={styles.panelTitle}>{copy.addTable}</h3>
                                </div>

                                <div className={styles.panelMetrics}>
                                    <div className={styles.infoBadge}>{copy.tableCount(tables.length)}</div>
                                    <div className={styles.infoBadgeMuted}>{copy.placedCount(placedTables.length)}</div>
                                </div>

                                {notPlacedTables.length > 0 ? (
                                    <div className={styles.pendingTables}>
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
                                                    {copy.selectedTableLabel(table.tableNumber)}
                                                </button>
                                            ))}

                                            {notPlacedTables.length > visiblePendingTables.length ? (
                                                <div className={styles.pendingTableCounter}>
                                                    +{notPlacedTables.length - visiblePendingTables.length}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            <div className={styles.controlPanelFooter}>
                                <button
                                    type="button"
                                    className={`${styles.secondaryButton} ${styles.tilePrimaryButton}`}
                                    onClick={handleStartCreate}
                                >
                                    <PlusIcon className={styles.actionIcon} />
                                    <span>{copy.addTable}</span>
                                </button>
                            </div>
                        </section>

                        <section className={styles.controlPanel}>
                            <div className={styles.controlPanelBody}>
                                <div>
                                    <h3 className={styles.panelTitle}>{copy.saveLayout}</h3>
                                </div>

                                <div className={styles.panelMetrics}>
                                    <div className={styles.infoBadge}>{copy.placedCount(placedTables.length)}</div>
                                    <div className={styles.infoBadgeMuted}>
                                        {copy.pendingCount(notPlacedTables.length).replace('.', '')}
                                    </div>
                                </div>

                            </div>

                            <div className={styles.controlPanelFooter}>
                                <button
                                    type="button"
                                    className={`${styles.saveButton} ${styles.tilePrimaryButton}`}
                                    onClick={() => void handleSaveLayout()}
                                    disabled={isSavingLayout || placedTables.length === 0}
                                >
                                    {isSavingLayout ? copy.saveLoading : copy.saveLayout}
                                </button>
                            </div>
                        </section>
                    </div>

                    <div ref={layoutRef} className={styles.canvas}>
                        <img
                            src={schemeImageUrl}
                            alt={copy.schemeAlt(restaurant?.name || copy.titleRestaurantFallback.toLowerCase())}
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
                                title={copy.selectedTableLabel(table.tableNumber)}
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
                                        {selectedTable
                                            ? copy.selectedTableTitle(selectedTable.tableNumber)
                                            : copy.newTable}
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    className={styles.closeButton}
                                    onClick={handleCloseEditor}
                                    aria-label={copy.closeEditor}
                                >
                                    <CloseIcon className={styles.closeIcon} />
                                </button>
                            </div>

                            {selectedTable ? (
                                <div className={styles.editorMetaRow}>
                                    <div className={styles.editorChip}>
                                        {copy.selectedTableGuests(selectedTable.capacity)}
                                    </div>
                                    <div className={styles.editorChip}>
                                        {isPlaced(selectedTable) ? copy.showOnPlan : copy.notPlaced}
                                    </div>
                                    {!selectedTable.active ? (
                                        <div className={styles.editorChipMuted}>{copy.disabled}</div>
                                    ) : null}
                                </div>
                            ) : null}

                            <div className={styles.form}>
                                <div className={styles.controlsGrid}>
                                    <div className={styles.controlCard}>
                                        <div className={styles.controlCardHeader}>
                                            <span className={styles.controlCardTitle}>{copy.tableNumber}</span>
                                            <span className={styles.controlCardValue}>
                                                {tableForm.tableNumber ? `№${tableForm.tableNumber}` : copy.tableNumberPlaceholder}
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
                                            <span className={styles.controlCardTitle}>{copy.capacity}</span>
                                            <span className={styles.controlCardValue}>{copy.selectedTableGuests(capacityValue)}</span>
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
                                            <span className={styles.controlCardTitle}>{copy.activity}</span>
                                            <span className={styles.controlCardValue}>
                                                {tableForm.active ? copy.active : copy.disabled}
                                            </span>
                                        </div>

                                        <span className={styles.switchRow}>
                                            <span className={styles.switchCaption}>
                                                {tableForm.active ? copy.tableStatusOn : copy.tableStatusOff}
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
                                    <label htmlFor="table-description" className={styles.label}>{copy.description}</label>
                                    <textarea
                                        id="table-description"
                                        className={styles.textarea}
                                        value={tableForm.description}
                                        onChange={(event) => handleTableFormChange('description', event.target.value)}
                                    />
                                </div>

                                <div className={styles.editorActions}>
                                    {selectedTable ? (
                                        <button
                                        type="button"
                                        className={styles.dangerButton}
                                        onClick={() => void handleDeleteTable(selectedTable.id)}
                                        disabled={deletingTableId === selectedTable.id}
                                    >
                                        {deletingTableId === selectedTable.id ? copy.deleteLoading : copy.delete}
                                    </button>
                                ) : null}

                                    <button
                                        type="button"
                                        className={styles.actionButton}
                                        onClick={() => void handleSubmitTable()}
                                        disabled={isSubmittingTable}
                                    >
                                        {isSubmittingTable ? copy.saveLoading : copy.saveTable}
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
