import { useEffect, useMemo, useRef, useState } from 'react';
import {
    deleteRestaurantPhotos,
    updateRestaurantPhotoOrder,
    uploadRestaurantPhotos,
} from '@/entities/restaurant/api/management.ts';
import type { Photo, PhotoUploadDraft } from '@/entities/restaurant/model/types.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    CloseIcon,
    PlusIcon,
} from '@/shared/ui/icons/action-icons.tsx';
import { useConfirmDialog } from '@/shared/ui/confirm-dialog/ConfirmDialogProvider.tsx';
import { PhotoCarousel } from '@/shared/ui/photo-carousel/photo-carousel.tsx';
import styles from './restaurant-gallery.module.scss';

type RestaurantGalleryProps = {
    restaurantId: string;
    restaurantName: string;
    galleryPhotos: Photo[];
    canManageRestaurant?: boolean;
    isPhotoManagerOpen?: boolean;
    onPhotoManagerOpenChange?: (open: boolean) => void;
    onPhotosChanged?: () => Promise<void>;
};

type GalleryToast = {
    type: 'success' | 'error';
    message: string;
};

const uploadCategories = [
    { value: 'GALLERY' as const, label: 'Галерея' },
    { value: 'BANNER' as const, label: 'Баннер' },
];

const allowedContentTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const normalizePhotoOrder = (photos: Photo[]) => {
    return photos.map((photo, index) => ({
        ...photo,
        sortOrder: index,
    }));
};

export const RestaurantGallery = ({
    restaurantId,
    restaurantName,
    galleryPhotos,
    canManageRestaurant,
    isPhotoManagerOpen,
    onPhotoManagerOpenChange,
    onPhotosChanged,
}: RestaurantGalleryProps) => {
    const [selectedCategory, setSelectedCategory] = useState<'GALLERY' | 'BANNER'>('GALLERY');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [sortOrderInput, setSortOrderInput] = useState('1');
    const [orderedPhotos, setOrderedPhotos] = useState<Photo[]>([]);
    const [toast, setToast] = useState<GalleryToast | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
    const categoryRef = useRef<HTMLSelectElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const confirmDialog = useConfirmDialog();

    useEffect(() => {
        setOrderedPhotos(normalizePhotoOrder(galleryPhotos));
    }, [galleryPhotos]);

    const nextSortOrder = useMemo(() => {
        return orderedPhotos
            .filter((photo) => photo.category === selectedCategory)
            .reduce((max, photo) => Math.max(max, photo.sortOrder), -1) + 1;
    }, [orderedPhotos, selectedCategory]);

    useEffect(() => {
        setSortOrderInput(String(nextSortOrder + 1));
    }, [nextSortOrder, selectedCategory]);

    useEffect(() => {
        if (isPhotoManagerOpen) {
            categoryRef.current?.focus();
        }
    }, [isPhotoManagerOpen]);

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

    const handleUpload = async () => {
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

            await uploadRestaurantPhotos(restaurantId, [draft]);
            await onPhotosChanged?.();

            setSelectedFile(null);
            showToast('success', 'Фото добавлено');
            onPhotoManagerOpenChange?.(false);

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
        const isConfirmed = await confirmDialog({
            title: 'Удалить фотографию?',
            description: 'Фотография ресторана будет удалена без возможности восстановления.',
            confirmText: 'Удалить фото',
        });

        if (!isConfirmed) {
            return;
        }

        try {
            setDeletingPhotoId(photoId);
            setToast(null);
            await deleteRestaurantPhotos(restaurantId, [photoId]);
            await onPhotosChanged?.();
            showToast('success', 'Фото удалено');
        } catch (requestError) {
            showToast('error', getApiErrorMessage(requestError, 'Не удалось удалить фото'));
        } finally {
            setDeletingPhotoId(null);
        }
    };

    const handleMovePhoto = async (index: number, direction: 'left' | 'right') => {
        if (isReordering) {
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

            await updateRestaurantPhotoOrder(
                restaurantId,
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

    const addPhotoCard = canManageRestaurant ? (
        <article className={styles.addPhotoCard}>
            <div className={styles.addPhotoHead}>
                <h2 className={styles.addPhotoTitle}>Добавить фото</h2>
                <p className={styles.addPhotoDescription}>
                    Выберите категорию, задайте порядок и загрузите фотографию в галерею ресторана.
                </p>
            </div>

            <div className={styles.addPhotoForm}>
                <label className={`${styles.addPhotoField} ${styles.addPhotoFieldCompact}`}>
                    <span className={styles.addPhotoLabel}>Категория</span>
                    <select
                        ref={categoryRef}
                        className={styles.select}
                        value={selectedCategory}
                        onChange={(event) => {
                            setSelectedCategory(event.target.value as 'GALLERY' | 'BANNER');
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
                        onChange={(event) => {
                            setSelectedFile(event.target.files?.[0] ?? null);
                        }}
                    />

                    <div className={styles.filePicker}>
                        <button
                            type="button"
                            className={styles.filePickerButton}
                            onClick={() => fileInputRef.current?.click()}
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
                    disabled={isUploading}
                    aria-label={isUploading ? 'Добавление фото' : 'Добавить фото'}
                    title={isUploading ? 'Добавление...' : 'Добавить фото'}
                >
                    <PlusIcon className={styles.uploadIcon} />
                </button>
            </div>
        </article>
    ) : null;

    return (
        <section id="restaurant-photos" className={styles.section}>
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
                altText={restaurantName}
                placeholderText="Фотографии ресторана отсутствуют"
                leadingCard={addPhotoCard}
                leadingCardClassName={canManageRestaurant ? styles.leadingCardCompact : undefined}
                size="large"
                renderPhotoActions={canManageRestaurant ? (photo, index) => (
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
