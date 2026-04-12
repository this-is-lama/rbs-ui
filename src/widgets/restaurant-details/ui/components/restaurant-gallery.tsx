import type { RefObject } from 'react';
import type { Photo } from '@/entities/restaurant/model/types.ts';
import styles from '../restaurant-details-widget.module.scss';

type RestaurantGalleryProps = {
    restaurantName: string;
    galleryPhotos: Photo[];
    galleryRef: RefObject<HTMLDivElement | null>;
    onScrollLeft: () => void;
    onScrollRight: () => void;
};

export const RestaurantGallery = ({
    restaurantName,
    galleryPhotos,
    galleryRef,
    onScrollLeft,
    onScrollRight,
}: RestaurantGalleryProps) => {
    return (
        <section className={styles.heroSection}>
            {galleryPhotos.length > 1 ? (
                <>
                    <button
                        type="button"
                        className={`${styles.arrowButton} ${styles.leftArrow}`}
                        onClick={onScrollLeft}
                        aria-label="Прокрутить фотографии влево"
                    >
                        ‹
                    </button>

                    <button
                        type="button"
                        className={`${styles.arrowButton} ${styles.rightArrow}`}
                        onClick={onScrollRight}
                        aria-label="Прокрутить фотографии вправо"
                    >
                        ›
                    </button>
                </>
            ) : null}

            <div className={styles.heroViewport} ref={galleryRef}>
                <div className={styles.heroTrack}>
                    {galleryPhotos.length > 0 ? (
                        galleryPhotos.map((photo) => (
                            <div key={photo.id} className={styles.heroImageCard}>
                                <img
                                    src={photo.publicUrl}
                                    alt={restaurantName}
                                    className={styles.heroImage}
                                />
                            </div>
                        ))
                    ) : (
                        <div className={styles.heroPlaceholder}>
                            Фото ресторана отсутствуют
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
