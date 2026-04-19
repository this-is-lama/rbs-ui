import { useEffect, useMemo, useRef, useState } from 'react';
import {
    deleteDishPhotos,
    updateDishPhotoOrder,
    uploadDishPhotos,
} from '@/entities/restaurant/api/management.ts';
import type { Photo, PhotoUploadDraft } from '@/entities/restaurant/model/types.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    CloseIcon,
    PlusIcon,
} from '@/shared/ui/icons/action-icons.tsx';
import { PhotoCarousel } from '@/shared/ui/photo-carousel/photo-carousel.tsx';
import styles from './dish-photo-gallery-manager.module.scss';

type DishPhotoGalleryManagerProps = {
    dishId?: string;
    dishName: string;
    photos?: Photo[] | null;
    canManagePhotos?: boolean;
    onPhotosChanged?: () => Promise<void>;
};

type GalleryToast = {
    type: 'success' | 'error';
    message: string;
};

const uploadCategories = [
    { value: 'BANNER' as const, label: 'Обложка' },
    { value: 'GALLERY' as const, label: 'Галерея' },
];

const allowedContentTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const normalizePhotoOrder = (photos: Photo[]) => {
    return photos.map((photo, index) => ({
        ...photo,
        sortOrder: index,
    }));
};

export const DishPhotoGalleryManager = ({
    dishId,
    dishName,
    photos,
    canManagePhotos = true,
    onPhotosChanged,
}: DishPhotoGalleryManagerProps) => {
    const [selectedCategory, setSelectedCategory] = useState<'BANNER' | 'GALLERY'>('BANNER');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [sortOrderInput, setSortOrderInput] = useState('1');
    const [orderedPhotos, setOrderedPhotos] = useState<Photo[]>([]);
    const [toast, setToast] = useState<GalleryToast | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
    const categoryRef = useRef<HTMLSelectElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const nextPhotos = Array.isArray(photos)
            ? normalizePhotoOrder([...photos].sort((left, right) => left.sortOrder - right.sortOrder))
            : [];

        setOrderedPhotos(nextPhotos);
    }, [photos]);

    const nextSortOrder = useMemo(() => {
        return orderedPhotos
            .filter((photo) => photo.category === selectedCategory)
            .reduce((max, photo) => Math.max(max, photo.sortOrder), -1) + 1;
    }, [orderedPhotos, selectedCategory]);

    useEffect(() => {
        setSortOrderInput(String(nextSortOrder + 1));
    }, [nextSortOrder, selectedCategory]);

    useEffect(() => {
        categoryRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!toast) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setToast(null);
        }, 3200);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [toast]);

    const showToast = (type: GalleryToast['type'], message: string) => {
        setToast({ type, message });
    };

    const canUploadOrDeletePhotos = Boolean(dishId) && canManagePhotos;

    const handleUpload = async () => {
        if (!canUploadOrDeletePhotos || !dishId) {
            showToast('error', 'Сначала сохраните блюдо, затем добавьте фотографии');
            return;
        }

        if (!selectedFile) {
            showToast('error', 'Выберите файл');
            return;
        }

        if (!allowedContentTypes.has(selectedFile.type)) {
            showToast('error', 'Поддерживаются только JPEG, PNG и WEBP');
            return;
        }

        const parsedSortOrder = Number.parseInt(sortOrderInput, 10);
        const sortOrder = Number.isFinite(parsedSortOrder) && parsedSortOrder > 0
            ? parsedSortOrder - 1
            : nextSortOrder;

        try {
            setIsUploading(true);
            setToast(null);

            const draft: PhotoUploadDraft = {
                file: selectedFile,
                contentType: selectedFile.type,
                category: selectedCategory,
                sortOrder,
            };

            await uploadDishPhotos(dishId, [draft]);
            await onPhotosChanged?.();

            setSelectedFile(null);
            showToast('success', 'Фото добавлено');

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (requestError) {
            showToast('error', getApiErrorMessage(requestError, 'Не удалось загрузить фото'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (photoId: string) => {
        if (!dishId) {
            return;
        }

        if (!window.confirm('Удалить фотографию?')) {
            return;
        }

        try {
            setDeletingPhotoId(photoId);
            setToast(null);
            await deleteDishPhotos(dishId, [photoId]);
            await onPhotosChanged?.();
            showToast('success', 'Фото удалено');
        } catch (requestError) {
            showToast('error', getApiErrorMessage(requestError, 'Не удалось удалить фото'));
        } finally {
            setDeletingPhotoId(null);
        }
    };

    const handleMovePhoto = async (index: number, direction: 'left' | 'right') => {
        if (!dishId || isReordering) {
            return;
        }

        const targetIndex = direction === 'left' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= orderedPhotos.length) {
            return;
        }

        const previousPhotos = [...orderedPhotos];
        const nextPhotos = [...orderedPhotos];
        const [movedPhoto] = nextPhotos.splice(index, 1);
        nextPhotos.splice(targetIndex, 0, movedPhoto);
        const normalizedPhotos = normalizePhotoOrder(nextPhotos);

        setOrderedPhotos(normalizedPhotos);

        try {
            setIsReordering(true);
            setToast(null);

            await updateDishPhotoOrder(
                dishId,
                normalizedPhotos.map((photo) => ({
                    id: photo.id,
                    sortOrder: photo.sortOrder,
                })),
            );
            await onPhotosChanged?.();
            showToast('success', 'Порядок фотографий сохранен');
        } catch (requestError) {
            setOrderedPhotos(previousPhotos);
            showToast('error', getApiErrorMessage(requestError, 'Не удалось сохранить порядок фотографий'));
        } finally {
            setIsReordering(false);
        }
    };

    const addPhotoCard = (
        <article className={styles.addPhotoCard}>
            <div className={styles.addPhotoHead}>
                <h2 className={styles.addPhotoTitle}>Фотографии блюда</h2>
                <p className={styles.addPhotoDescription}>
                    {canUploadOrDeletePhotos
                        ? 'Добавляйте обложку и фотографии галереи блюда.'
                        : 'Сначала сохраните блюдо, затем сможете добавить фотографии.'}
                </p>
            </div>

            <div className={styles.addPhotoForm}>
                <label className={`${styles.addPhotoField} ${styles.addPhotoFieldCompact}`}>
                    <span className={styles.addPhotoLabel}>Категория</span>
                    <select
                        ref={categoryRef}
                        className={styles.select}
                        value={selectedCategory}
                        disabled={!canUploadOrDeletePhotos}
                        onChange={(event) => {
                            setSelectedCategory(event.target.value as 'BANNER' | 'GALLERY');
                        }}
                    >
                        {uploadCategories.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={`${styles.addPhotoField} ${styles.addPhotoFieldCompact}`}>
                    <span className={styles.addPhotoLabel}>Порядок</span>
                    <input
                        className={styles.input}
                        inputMode="numeric"
                        value={sortOrderInput}
                        disabled={!canUploadOrDeletePhotos}
                        onChange={(event) => setSortOrderInput(event.target.value)}
                        placeholder="1"
                    />
                </label>

                <label className={`${styles.addPhotoField} ${styles.addPhotoFieldWide}`}>
                    <span className={styles.addPhotoLabel}>Файл</span>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className={styles.fileInputHidden}
                        disabled={!canUploadOrDeletePhotos}
                        onChange={(event) => {
                            setSelectedFile(event.target.files?.[0] ?? null);
                        }}
                    />

                    <div className={styles.filePicker}>
                        <button
                            type="button"
                            className={styles.filePickerButton}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={!canUploadOrDeletePhotos}
                        >
                            Выбрать файл
                        </button>
                        <span className={styles.filePickerName} title={selectedFile?.name ?? 'Файл не выбран'}>
                            {selectedFile?.name ?? 'Файл не выбран'}
                        </span>
                    </div>
                </label>
            </div>

            <div className={styles.addPhotoActions}>
                <button
                    type="button"
                    className={styles.uploadIconButton}
                    onClick={() => void handleUpload()}
                    disabled={isUploading || !canUploadOrDeletePhotos}
                    aria-label={isUploading ? 'Добавление фото' : 'Добавить фото'}
                    title={isUploading ? 'Добавление...' : 'Добавить фото'}
                >
                    <PlusIcon className={styles.uploadIcon} />
                </button>
            </div>
        </article>
    );

    return (
        <section className={styles.section}>
            {toast ? (
                <div className={styles.toastViewport}>
                    <div
                        className={`${styles.toast} ${
                            toast.type === 'success' ? styles.toastSuccess : styles.toastError
                        }`}
                        role="status"
                        aria-live="polite"
                    >
                        <span className={styles.toastLabel}>
                            {toast.type === 'success' ? 'Готово' : 'Ошибка'}
                        </span>
                        <span className={styles.toastMessage}>{toast.message}</span>
                    </div>
                </div>
            ) : null}

            <PhotoCarousel
                photos={orderedPhotos}
                altText={dishName}
                placeholderText="Фотографии блюда отсутствуют"
                leadingCard={canManagePhotos ? addPhotoCard : undefined}
                leadingCardClassName={canManagePhotos ? styles.leadingCardCompact : undefined}
                size="large"
                renderPhotoActions={canUploadOrDeletePhotos ? (photo, index) => (
                    <>
                        <div className={styles.orderControls}>
                            <button
                                type="button"
                                className={styles.orderButton}
                                onClick={() => void handleMovePhoto(index, 'left')}
                                disabled={isReordering || index === 0}
                                aria-label="Переместить фото влево"
                            >
                                <ChevronLeftIcon className={styles.orderIcon} />
                            </button>

                            <button
                                type="button"
                                className={styles.orderButton}
                                onClick={() => void handleMovePhoto(index, 'right')}
                                disabled={isReordering || index === orderedPhotos.length - 1}
                                aria-label="Переместить фото вправо"
                            >
                                <ChevronRightIcon className={styles.orderIcon} />
                            </button>
                        </div>

                        <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => void handleDelete(photo.id)}
                            disabled={deletingPhotoId === photo.id}
                            aria-label="Удалить фото"
                        >
                            <CloseIcon className={styles.deleteIcon} />
                        </button>
                    </>
                ) : undefined}
            />
        </section>
    );
};
