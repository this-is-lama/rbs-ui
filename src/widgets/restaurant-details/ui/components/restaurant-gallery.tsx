import type { Photo } from '@/entities/restaurant/model/types.ts';
import { PhotoCarousel } from '@/shared/ui/photo-carousel/photo-carousel.tsx';

type RestaurantGalleryProps = {
    restaurantName: string;
    galleryPhotos: Photo[];
};

export const RestaurantGallery = ({ restaurantName, galleryPhotos }: RestaurantGalleryProps) => (
    <PhotoCarousel
        photos={galleryPhotos}
        altText={restaurantName}
        placeholderText="Фото ресторана отсутствуют"
    />
);
