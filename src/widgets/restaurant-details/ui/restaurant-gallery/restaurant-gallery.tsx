import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/app/providers/language';
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
import { useConfirmDialog } from '@/shared/ui/confirm-dialog/use-confirm-dialog.ts';
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
    const { language } = useLanguage();
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
    const copy = language === 'en'
        ? {
            addPhoto: 'Add photo',
            addPhotoAria: 'Add photo',
            addPhotoDescription: 'Choose a category, set the order, and upload a photo to the restaurant gallery.',
            addingPhoto: 'Adding photo',
            addingPhotoTitle: 'Adding...',
            banner: 'Banner',
            category: 'Category',
            deletePhoto: 'Delete photo',
            deletePhotoConfirm: 'Delete photo',
            deletePhotoDescription: 'The restaurant photo will be deleted permanently.',
            deletePhotoTitle: 'Delete photo?',
            error: 'Error',
            file: 'File',
            fileNotSelected: 'File not selected',
            gallery: 'Gallery',
            moveLeft: 'Move photo left',
            moveRight: 'Move photo right',
            order: 'Order',
            orderSaved: 'Photo order saved',
            photoAdded: 'Photo added',
            photoDeleted: 'Photo deleted',
            placeholder: 'Restaurant photos are not available',
            ready: 'Done',
            saveOrderError: 'Failed to save photo order',
            selectFile: 'Select file',
            selectFileError: 'Select a file',
            supportedFormatsError: 'Only JPEG, PNG, and WEBP are supported',
            uploadError: 'Failed to upload photo',
            uploadTitle: 'Add photo',
            deleteError: 'Failed to delete photo',
        }
        : {
            addPhoto: 'Добавить фото',
            addPhotoAria: 'Добавить фото',
            addPhotoDescription: 'Выберите категорию, задайте порядок и загрузите фотографию в галерею ресторана.',
            addingPhoto: 'Добавление фото',
            addingPhotoTitle: 'Добавление...',
            banner: 'Баннер',
            category: 'Категория',
            deletePhoto: 'Удалить фото',
            deletePhotoConfirm: 'Удалить фото',
            deletePhotoDescription: 'Фотография ресторана будет удалена без возможности восстановления.',
            deletePhotoTitle: 'Удалить фотографию?',
            error: 'Ошибка',
            file: 'Файл',
            fileNotSelected: 'Файл не выбран',
            gallery: 'Галерея',
            moveLeft: 'Переместить фото влево',
            moveRight: 'Переместить фото вправо',
            order: 'Порядок',
            orderSaved: 'Порядок фотографий сохранен',
            photoAdded: 'Фото добавлено',
            photoDeleted: 'Фото удалено',
            placeholder: 'Фотографии ресторана отсутствуют',
            ready: 'Готово',
            saveOrderError: 'Не удалось сохранить порядок фотографий',
            selectFile: 'Выбрать файл',
            selectFileError: 'Выберите файл',
            supportedFormatsError: 'Поддерживаются только JPEG, PNG и WEBP',
            uploadError: 'Не удалось загрузить фото',
            uploadTitle: 'Добавить фото',
            deleteError: 'Не удалось удалить фото',
        };
    const uploadCategories = useMemo(() => {
        return [
            { value: 'GALLERY' as const, label: copy.gallery },
            { value: 'BANNER' as const, label: copy.banner },
        ];
    }, [copy.banner, copy.gallery]);

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
            showToast('error', copy.selectFileError);
            return;
        }

        if (!allowedContentTypes.has(selectedFile.type)) {
            showToast('error', copy.supportedFormatsError);
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
            showToast('success', copy.photoAdded);
            onPhotoManagerOpenChange?.(false);

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
        const isConfirmed = await confirmDialog({
            title: copy.deletePhotoTitle,
            description: copy.deletePhotoDescription,
            confirmText: copy.deletePhotoConfirm,
        });

        if (!isConfirmed) {
            return;
        }

        try {
            setDeletingPhotoId(photoId);
            setToast(null);
            await deleteRestaurantPhotos(restaurantId, [photoId]);
            await onPhotosChanged?.();
            showToast('success', copy.photoDeleted);
        } catch (requestError) {
            showToast('error', getApiErrorMessage(requestError, copy.deleteError));
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
            showToast('success', copy.orderSaved);
        } catch (requestError) {
            setOrderedPhotos(previousPhotos);
            showToast('error', getApiErrorMessage(requestError, copy.saveOrderError));
        } finally {
            setIsReordering(false);
        }
    };

    const addPhotoCard = canManageRestaurant ? (
        <article className={styles.addPhotoCard}>
            <div className={styles.addPhotoHead}>
                <h2 className={styles.addPhotoTitle}>{copy.addPhoto}</h2>
                <p className={styles.addPhotoDescription}>
                    {copy.addPhotoDescription}
                </p>
            </div>

            <div className={styles.addPhotoForm}>
                <label className={`${styles.addPhotoField} ${styles.addPhotoFieldCompact}`}>
                    <span className={styles.addPhotoLabel}>{copy.category}</span>
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
                    <span className={styles.addPhotoLabel}>{copy.order}</span>
                    <input
                        className={styles.input}
                        inputMode="numeric"
                        value={sortOrderInput}
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
                    disabled={isUploading}
                    aria-label={isUploading ? copy.addingPhoto : copy.addPhotoAria}
                    title={isUploading ? copy.addingPhotoTitle : copy.uploadTitle}
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
                            {toast.type === 'success' ? copy.ready : copy.error}
                        </span>
                        <span className={styles.toastMessage}>{toast.message}</span>
                    </div>
                </div>
            ) : null}

            <PhotoCarousel
                photos={orderedPhotos}
                altText={restaurantName}
                placeholderText={copy.placeholder}
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
