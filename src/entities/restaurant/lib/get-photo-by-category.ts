import type { Photo, PhotoCategory } from '@/entities/restaurant/model/types.ts';

export const getPhotoByCategory = (
    photos: Photo[] | null | undefined,
    category: PhotoCategory,
): Photo | null => {
    if (!photos || photos.length === 0) {
        return null;
    }

    return photos.find((photo) => photo.category === category) ?? null;
};