import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/app/providers/language';
import {
    deleteDishPhotos,
    uploadDishPhotos,
} from '@/entities/restaurant/api/management.ts';
import type { Photo, PhotoUploadDraft } from '@/entities/restaurant/model';
import { getApiErrorMessage } from '@/shared/lib/api';
import { useConfirmDialog } from '@/shared/ui/confirm-dialog';
import { ChevronDownIcon, CloseIcon } from '@/shared/ui/icons';
import { PhotoCarousel } from '@/shared/ui/photo-carousel';
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
            addPhotoDescription: 'Choose a category, set the order, and upload a photo to the dish gallery.',
            addingPhotoTitle: 'Adding...',
            banner: 'Cover',
            category: 'Category',
            deleteConfirm: 'Delete photo',
            deleteDescription: 'The dish photo will be deleted permanently.',
            deleteError: 'Failed to delete photo',
            deletePhoto: 'Delete photo',
            deleteTitle: 'Delete photo?',
            error: 'Error',
            file: 'File',
            fileReady: 'File selected',
            gallery: 'Gallery',
            loadingHint: 'Save the dish first, then you will be able to add photos.',
            order: 'Order',
            photoAdded: 'Photo added',
            photoDeleted: 'Photo deleted',
            placeholder: 'Dish photos are not available',
            ready: 'Done',
            saveFirst: 'Save the dish first, then add photos',
            selectFile: 'Select file',
            selectFileError: 'Select a file',
            supportedFormatsError: 'Only JPEG, PNG, and WEBP are supported',
            uploadAction: 'Upload',
            uploadError: 'Failed to upload photo',
            uploadTitle: 'Add photo',
            uploadingAction: 'Uploading...',
        }
        : {
            addPhoto: 'Добавить фото',
            addPhotoDescription: 'Выберите категорию, задайте порядок и загрузите фотографию в галерею блюда.',
            addingPhotoTitle: 'Добавление...',
            banner: 'Обложка',
            category: 'Категория',
            deleteConfirm: 'Удалить фото',
            deleteDescription: 'Фотография блюда будет удалена без возможности восстановления.',
            deleteError: 'Не удалось удалить фото',
            deletePhoto: 'Удалить фото',
            deleteTitle: 'Удалить фотографию?',
            error: 'Ошибка',
            file: 'Файл',
            fileReady: 'Файл выбран',
            gallery: 'Галерея',
            loadingHint: 'Сначала сохраните блюдо, затем сможете добавить фотографии.',
            order: 'Порядок',
            photoAdded: 'Фото добавлено',
            photoDeleted: 'Фото удалено',
            placeholder: 'Фотографии блюда отсутствуют',
            ready: 'Готово',
            saveFirst: 'Сначала сохраните блюдо, затем добавьте фотографии',
            selectFile: 'Выбрать файл',
            selectFileError: 'Выберите файл',
            supportedFormatsError: 'Поддерживаются только JPEG, PNG и WEBP',
            uploadAction: 'Загрузить',
            uploadError: 'Не удалось загрузить фото',
            uploadTitle: 'Добавить фото',
            uploadingAction: 'Загрузка...',
        };
    const uploadCategories = useMemo(() => {
        return [
            { value: 'BANNER' as const, label: copy.banner },
            { value: 'GALLERY' as const, label: copy.gallery },
        ];
    }, [copy.banner, copy.gallery]);
    const selectedCategoryOption = useMemo(() => {
        return uploadCategories.find((category) => category.value === selectedCategory) ?? uploadCategories[0];
    }, [selectedCategory, uploadCategories]);
    const orderedPhotos = useMemo(() => {
        return Array.isArray(photos)
            ? [...photos].sort((left, right) => left.sortOrder - right.sortOrder)
            : [];
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
        if (canManagePhotos) {
            categoryRef.current?.focus();
        }
    }, [canManagePhotos]);

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

    useEffect(() => {
        if (canUploadOrDeletePhotos) {
            return;
        }

        setIsCategoryMenuOpen(false);
    }, [canUploadOrDeletePhotos]);

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

    const handleCategoryButtonKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
            return;
        }

        event.preventDefault();
        setIsCategoryMenuOpen(true);
    };

    const handleCategorySelect = (category: 'BANNER' | 'GALLERY') => {
        setSelectedCategory(category);
        setIsCategoryMenuOpen(false);
        categoryRef.current?.focus();
    };

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

    const addPhotoCard = (
        <article className={styles.addPhotoCard}>
            <div className={styles.addPhotoHead}>
                <h2 className={styles.addPhotoTitle}>{copy.addPhoto}</h2>
            </div>

            <div className={styles.addPhotoForm}>
                <label
                    className={`${styles.addPhotoField} ${styles.addPhotoFieldCompact} ${
                        isCategoryMenuOpen ? styles.addPhotoFieldMenuOpen : ''
                    }`}
                >
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
                            disabled={!canUploadOrDeletePhotos}
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

                    <button
                        type="button"
                        className={`${styles.filePickerButton} ${
                            selectedFile ? styles.filePickerButtonSelected : ''
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!canUploadOrDeletePhotos}
                        title={!canUploadOrDeletePhotos ? copy.saveFirst : undefined}
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
                    disabled={isUploading || !canUploadOrDeletePhotos}
                    aria-label={!canUploadOrDeletePhotos
                        ? copy.saveFirst
                        : isUploading
                            ? copy.uploadingAction
                            : copy.uploadAction}
                    title={!canUploadOrDeletePhotos
                        ? copy.saveFirst
                        : isUploading
                            ? copy.addingPhotoTitle
                            : copy.uploadTitle}
                >
                    {isUploading ? copy.uploadingAction : copy.uploadAction}
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
                renderPhotoActions={canUploadOrDeletePhotos ? (photo) => (
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
