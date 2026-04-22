import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/app/providers/language';
import {
    deleteRestaurantPhotos,
    uploadRestaurantPhotos,
} from '@/entities/restaurant/api/management.ts';
import type { Photo, PhotoUploadDraft } from '@/entities/restaurant/model/types.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import {
    ChevronDownIcon,
    CloseIcon,
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
    const [toast, setToast] = useState<GalleryToast | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
    const categoryMenuId = useId();
    const categoryRef = useRef<HTMLButtonElement | null>(null);
    const categoryMenuRef = useRef<HTMLDivElement | null>(null);
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
            fileReady: 'File selected',
            gallery: 'Gallery',
            order: 'Order',
            photoAdded: 'Photo added',
            photoDeleted: 'Photo deleted',
            placeholder: 'Restaurant photos are not available',
            ready: 'Done',
            selectFile: 'Select file',
            selectFileError: 'Select a file',
            supportedFormatsError: 'Only JPEG, PNG, and WEBP are supported',
            uploadAction: 'Upload',
            uploadError: 'Failed to upload photo',
            uploadTitle: 'Add photo',
            uploadingAction: 'Uploading...',
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
            fileReady: 'Файл выбран',
            gallery: 'Галерея',
            order: 'Порядок',
            photoAdded: 'Фото добавлено',
            photoDeleted: 'Фото удалено',
            placeholder: 'Фотографии ресторана отсутствуют',
            ready: 'Готово',
            selectFile: 'Выбрать файл',
            selectFileError: 'Выберите файл',
            supportedFormatsError: 'Поддерживаются только JPEG, PNG и WEBP',
            uploadAction: 'Загрузить',
            uploadError: 'Не удалось загрузить фото',
            uploadTitle: 'Добавить фото',
            uploadingAction: 'Загрузка...',
            deleteError: 'Не удалось удалить фото',
        };
    const uploadCategories = useMemo(() => {
        return [
            { value: 'GALLERY' as const, label: copy.gallery },
            { value: 'BANNER' as const, label: copy.banner },
        ];
    }, [copy.banner, copy.gallery]);
    const selectedCategoryOption = useMemo(() => {
        return uploadCategories.find((category) => category.value === selectedCategory) ?? uploadCategories[0];
    }, [selectedCategory, uploadCategories]);
    const orderedPhotos = useMemo(() => [...galleryPhotos], [galleryPhotos]);

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
        if (!isPhotoManagerOpen) {
            setIsCategoryMenuOpen(false);
        }
    }, [isPhotoManagerOpen]);

    useEffect(() => {
        if (!isCategoryMenuOpen) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            if (categoryMenuRef.current?.contains(event.target as Node)) {
                return;
            }

            setIsCategoryMenuOpen(false);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') {
                return;
            }

            setIsCategoryMenuOpen(false);
            categoryRef.current?.focus();
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isCategoryMenuOpen]);

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

    const handleCategoryButtonKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
            return;
        }

        event.preventDefault();
        setIsCategoryMenuOpen(true);
    };

    const handleCategorySelect = (category: 'GALLERY' | 'BANNER') => {
        setSelectedCategory(category);
        setIsCategoryMenuOpen(false);
        categoryRef.current?.focus();
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
                    <div ref={categoryMenuRef} className={styles.selectMenu}>
                        <button
                            ref={categoryRef}
                            type="button"
                            className={`${styles.selectButton} ${
                                isCategoryMenuOpen ? styles.selectButtonOpen : ''
                            }`}
                            onClick={() => setIsCategoryMenuOpen((currentValue) => !currentValue)}
                            onKeyDown={handleCategoryButtonKeyDown}
                            aria-haspopup="listbox"
                            aria-expanded={isCategoryMenuOpen}
                            aria-controls={categoryMenuId}
                        >
                            <span className={styles.selectButtonValue}>
                                {selectedCategoryOption?.label}
                            </span>
                            <ChevronDownIcon
                                className={`${styles.selectButtonIcon} ${
                                    isCategoryMenuOpen ? styles.selectButtonIconOpen : ''
                                }`}
                            />
                        </button>

                        {isCategoryMenuOpen ? (
                            <div
                                id={categoryMenuId}
                                className={styles.selectMenuPopover}
                                role="listbox"
                                aria-label={copy.category}
                            >
                                {uploadCategories.map((category) => (
                                    <button
                                        key={category.value}
                                        type="button"
                                        role="option"
                                        aria-selected={category.value === selectedCategory}
                                        className={`${styles.selectOption} ${
                                            category.value === selectedCategory ? styles.selectOptionSelected : ''
                                        }`}
                                        onClick={() => handleCategorySelect(category.value)}
                                    >
                                        <span className={styles.selectOptionLabel}>{category.label}</span>
                                        {category.value === selectedCategory ? (
                                            <span className={styles.selectOptionIndicator} />
                                        ) : null}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
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

                    <button
                        type="button"
                        className={`${styles.filePickerButton} ${
                            selectedFile ? styles.filePickerButtonSelected : ''
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {selectedFile ? copy.fileReady : copy.selectFile}
                    </button>
                </label>
            </div>

            <div className={styles.addPhotoActions}>
                <button
                    type="button"
                    className={styles.uploadButton}
                    onClick={() => void handleUpload()}
                    disabled={isUploading}
                    aria-label={isUploading ? copy.uploadingAction : copy.uploadAction}
                    title={isUploading ? copy.addingPhotoTitle : copy.uploadTitle}
                >
                    {isUploading ? copy.uploadingAction : copy.uploadAction}
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
                renderPhotoActions={canManageRestaurant ? (photo) => (
                    <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => void handleDelete(photo.id)}
                        disabled={deletingPhotoId === photo.id}
                        aria-label={copy.deletePhoto}
                    >
                        <CloseIcon className={styles.deleteIcon} />
                    </button>
                ) : undefined}
            />
        </section>
    );
};
