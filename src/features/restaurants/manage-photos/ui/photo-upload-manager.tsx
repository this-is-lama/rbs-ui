import { useEffect, useMemo, useRef, useState } from 'react';
import type {
    Photo,
    PhotoCategory,
    PhotoUploadDraft,
} from '@/entities/restaurant/model/types.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { useConfirmDialog } from '@/shared/ui/confirm-dialog/use-confirm-dialog.ts';
import styles from './photo-upload-manager.module.scss';

type PhotoCategoryOption = {
    value: PhotoCategory;
    label: string;
};

type PhotoUploadManagerProps = {
    title: string;
    description?: string;
    addLabel?: string;
    emptyText?: string;
    categories: PhotoCategoryOption[];
    photos?: Photo[] | null;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onUpload: (draft: PhotoUploadDraft) => Promise<void>;
    onDelete?: (photoId: string) => Promise<void>;
};

const allowedContentTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const PhotoUploadManager = ({
    title,
    description,
    addLabel = 'Добавить фото',
    emptyText = 'Фотографии пока не добавлены',
    categories,
    photos,
    isOpen,
    onOpenChange,
    onUpload,
    onDelete,
}: PhotoUploadManagerProps) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>(categories[0]?.value ?? 'GALLERY');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const confirmDialog = useConfirmDialog();

    const expanded = typeof isOpen === 'boolean' ? isOpen : internalOpen;

    const setExpanded = (nextValue: boolean) => {
        if (typeof isOpen !== 'boolean') {
            setInternalOpen(nextValue);
        }

        onOpenChange?.(nextValue);
    };

    useEffect(() => {
        if (categories.length > 0) {
            setSelectedCategory(categories[0].value);
        }
    }, [categories]);

    const sortedPhotos = useMemo(() => {
        return [...(photos ?? [])].sort((left, right) => {
            if (left.category === right.category) {
                return left.sortOrder - right.sortOrder;
            }

            return left.category.localeCompare(right.category, 'ru');
        });
    }, [photos]);

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Выберите файл');
            return;
        }

        if (!allowedContentTypes.has(selectedFile.type)) {
            setError('Поддерживаются только JPEG, PNG и WEBP');
            return;
        }

        try {
            setError('');
            setSuccessMessage('');
            setIsUploading(true);

            const nextSortOrder = sortedPhotos
                .filter((photo) => photo.category === selectedCategory)
                .reduce((max, photo) => Math.max(max, photo.sortOrder), -1) + 1;

            await onUpload({
                file: selectedFile,
                contentType: selectedFile.type,
                category: selectedCategory,
                sortOrder: nextSortOrder,
            });

            setSelectedFile(null);
            setSuccessMessage('Фото загружено');
            setExpanded(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось загрузить фото'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (photoId: string) => {
        if (!onDelete) {
            return;
        }

        const isConfirmed = await confirmDialog({
            title: 'Удалить фотографию?',
            description: 'Фотография будет удалена без возможности восстановления.',
            confirmText: 'Удалить фото',
        });

        if (!isConfirmed) {
            return;
        }

        try {
            setDeletingPhotoId(photoId);
            setError('');
            setSuccessMessage('');
            await onDelete(photoId);
            setSuccessMessage('Фотография удалена');
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось удалить фото'));
        } finally {
            setDeletingPhotoId(null);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <div className={styles.titleBlock}>
                    <h3 className={styles.title}>{title}</h3>
                    {description ? <p className={styles.description}>{description}</p> : null}
                </div>

                <button
                    type="button"
                    className={styles.toggleButton}
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? 'Скрыть форму' : addLabel}
                </button>
            </div>

            {expanded ? (
                <div className={styles.form}>
                    <div className={styles.formGrid}>
                        <div className={styles.field}>
                            <label htmlFor={`${title}-category`} className={styles.label}>Категория</label>
                            <select
                                id={`${title}-category`}
                                className={styles.select}
                                value={selectedCategory}
                                onChange={(event) => {
                                    setSelectedCategory(event.target.value as PhotoCategory);
                                }}
                            >
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor={`${title}-file`} className={styles.label}>Файл</label>
                            <input
                                id={`${title}-file`}
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className={styles.fileInput}
                                onChange={(event) => {
                                    setSelectedFile(event.target.files?.[0] ?? null);
                                }}
                            />
                        </div>

                        <button
                            type="button"
                            className={styles.submitButton}
                            onClick={() => void handleUpload()}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Загрузка...' : 'Загрузить'}
                        </button>
                    </div>
                </div>
            ) : null}

            {error ? <div className={styles.error}>{error}</div> : null}
            {successMessage ? <div className={styles.success}>{successMessage}</div> : null}

            {sortedPhotos.length > 0 ? (
                <div className={styles.grid}>
                    {sortedPhotos.map((photo) => {
                        const categoryLabel = categories.find((item) => item.value === photo.category)?.label
                            ?? photo.category;

                        return (
                            <article key={photo.id} className={styles.card}>
                                <div className={styles.preview}>
                                    <img src={photo.publicUrl} alt={categoryLabel} className={styles.image} />
                                    <span className={styles.category}>{categoryLabel}</span>
                                </div>

                                <div className={styles.cardFooter}>
                                    <span className={styles.meta}>Порядок: {photo.sortOrder}</span>
                                    {onDelete ? (
                                        <button
                                            type="button"
                                            className={styles.deleteButton}
                                            onClick={() => void handleDelete(photo.id)}
                                            disabled={deletingPhotoId === photo.id}
                                        >
                                            {deletingPhotoId === photo.id ? 'Удаление...' : 'Удалить'}
                                        </button>
                                    ) : null}
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className={styles.empty}>{emptyText}</div>
            )}
        </div>
    );
};
