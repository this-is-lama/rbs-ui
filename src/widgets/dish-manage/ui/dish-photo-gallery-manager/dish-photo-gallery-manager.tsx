import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/app/providers/language';
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
import { useConfirmDialog } from '@/shared/ui/confirm-dialog/use-confirm-dialog.ts';
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
    const { language } = useLanguage();
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
    const confirmDialog = useConfirmDialog();
    const copy = language === 'en'
        ? {
            addPhoto: 'Add photo',
            addingPhoto: 'Adding photo',
            addingTitle: 'Adding...',
            banner: 'Cover',
            category: 'Category',
            deleteConfirm: 'Delete photo',
            deleteDescription: 'The dish photo will be deleted permanently.',
            deleteTitle: 'Delete photo?',
            deleteError: 'Failed to delete photo',
            deletePhoto: 'Delete photo',
            error: 'Error',
            file: 'File',
            fileNotSelected: 'File not selected',
            gallery: 'Gallery',
            loadingHint: 'Save the dish first, then you will be able to add photos.',
            moveLeft: 'Move photo left',
            moveRight: 'Move photo right',
            order: 'Order',
            orderSaved: 'Photo order saved',
            photoAdded: 'Photo added',
            photoDeleted: 'Photo deleted',
            photosTitle: 'Dish photos',
            placeholder: 'Dish photos are not available',
            ready: 'Done',
            saveFirst: 'Save the dish first, then add photos',
            saveOrderError: 'Failed to save photo order',
            selectFile: 'Select file',
            selectFileError: 'Select a file',
            supportedFormats: 'Only JPEG, PNG, and WEBP are supported',
            uploadError: 'Failed to upload photo',
            uploadHint: 'Add a cover and gallery photos for the dish.',
        }
        : {
            addPhoto: 'Добавить фото',
            addingPhoto: 'Добавление фото',
            addingTitle: 'Добавление...',
            banner: 'Обложка',
            category: 'Категория',
            deleteConfirm: 'Удалить фото',
            deleteDescription: 'Фотография блюда будет удалена без возможности восстановления.',
            deleteTitle: 'Удалить фотографию?',
            deleteError: 'Не удалось удалить фото',
            deletePhoto: 'Удалить фото',
            error: 'Ошибка',
            file: 'Файл',
            fileNotSelected: 'Файл не выбран',
            gallery: 'Галерея',
            loadingHint: 'Сначала сохраните блюдо, затем сможете добавить фотографии.',
            moveLeft: 'Переместить фото влево',
            moveRight: 'Переместить фото вправо',
            order: 'Порядок',
            orderSaved: 'Порядок фотографий сохранен',
            photoAdded: 'Фото добавлено',
            photoDeleted: 'Фото удалено',
            photosTitle: 'Фотографии блюда',
            placeholder: 'Фотографии блюда отсутствуют',
            ready: 'Готово',
            saveFirst: 'Сначала сохраните блюдо, затем добавьте фотографии',
            saveOrderError: 'Не удалось сохранить порядок фотографий',
            selectFile: 'Выбрать файл',
            selectFileError: 'Выберите файл',
            supportedFormats: 'Поддерживаются только JPEG, PNG и WEBP',
            uploadError: 'Не удалось загрузить фото',
            uploadHint: 'Добавляйте обложку и фотографии галереи блюда.',
        };
    const uploadCategories = useMemo(() => {
        return [
            { value: 'BANNER' as const, label: copy.banner },
            { value: 'GALLERY' as const, label: copy.gallery },
        ];
    }, [copy.banner, copy.gallery]);

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
            showToast('error', copy.saveFirst);
            return;
        }

        if (!selectedFile) {
            showToast('error', copy.selectFileError);
            return;
        }

        if (!allowedContentTypes.has(selectedFile.type)) {
            showToast('error', copy.supportedFormats);
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
            showToast('success', copy.photoAdded);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (requestError) {
            showToast('error', getApiErrorMessage(requestError, copy.uploadError));
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (photoId: string) => {
        if (!dishId) {
            return;
        }

        const isConfirmed = await confirmDialog({
            title: copy.deleteTitle,
            description: copy.deleteDescription,
            confirmText: copy.deleteConfirm,
        });

        if (!isConfirmed) {
            return;
        }

        try {
            setDeletingPhotoId(photoId);
            setToast(null);
            await deleteDishPhotos(dishId, [photoId]);
            await onPhotosChanged?.();
            showToast('success', copy.photoDeleted);
        } catch (requestError) {
            showToast('error', getApiErrorMessage(requestError, copy.deleteError));
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
            showToast('success', copy.orderSaved);
        } catch (requestError) {
            setOrderedPhotos(previousPhotos);
            showToast('error', getApiErrorMessage(requestError, copy.saveOrderError));
        } finally {
            setIsReordering(false);
        }
    };

    const addPhotoCard = (
        <article className={styles.addPhotoCard}>
            <div className={styles.addPhotoHead}>
                <h2 className={styles.addPhotoTitle}>{copy.photosTitle}</h2>
                <p className={styles.addPhotoDescription}>
                    {canUploadOrDeletePhotos
                        ? copy.uploadHint
                        : copy.loadingHint}
                </p>
            </div>

            <div className={styles.addPhotoForm}>
                <label className={`${styles.addPhotoField} ${styles.addPhotoFieldCompact}`}>
                    <span className={styles.addPhotoLabel}>{copy.category}</span>
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
                    <span className={styles.addPhotoLabel}>{copy.order}</span>
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
                    <span className={styles.addPhotoLabel}>{copy.file}</span>
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
                            {copy.selectFile}
                        </button>
                        <span className={styles.filePickerName} title={selectedFile?.name ?? copy.fileNotSelected}>
                            {selectedFile?.name ?? copy.fileNotSelected}
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
                    aria-label={isUploading ? copy.addingPhoto : copy.addPhoto}
                    title={isUploading ? copy.addingTitle : copy.addPhoto}
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
                            {toast.type === 'success' ? copy.ready : copy.error}
                        </span>
                        <span className={styles.toastMessage}>{toast.message}</span>
                    </div>
                </div>
            ) : null}

            <PhotoCarousel
                photos={orderedPhotos}
                altText={dishName}
                placeholderText={copy.placeholder}
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
                                aria-label={copy.moveLeft}
                            >
                                <ChevronLeftIcon className={styles.orderIcon} />
                            </button>

                            <button
                                type="button"
                                className={styles.orderButton}
                                onClick={() => void handleMovePhoto(index, 'right')}
                                disabled={isReordering || index === orderedPhotos.length - 1}
                                aria-label={copy.moveRight}
                            >
                                <ChevronRightIcon className={styles.orderIcon} />
                            </button>
                        </div>

                        <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => void handleDelete(photo.id)}
                            disabled={deletingPhotoId === photo.id}
                            aria-label={copy.deletePhoto}
                        >
                            <CloseIcon className={styles.deleteIcon} />
                        </button>
                    </>
                ) : undefined}
            />
        </section>
    );
};
