import { useRef } from 'react';
import type { Photo } from '@/entities/restaurant/model/types.ts';
import styles from './photo-carousel.module.scss';

type PhotoCarouselProps = {
    photos: Photo[];
    altText: string;
    placeholderText: string;
};

export const PhotoCarousel = ({
    photos,
    altText,
    placeholderText,
}: PhotoCarouselProps) => {
    const viewportRef = useRef<HTMLDivElement | null>(null);

    const scrollGallery = (direction: 'left' | 'right') => {
        const container = viewportRef.current;

        if (!container) {
            return;
        }

        const amount = container.clientWidth * 0.8;

        container.scrollBy({
            left: direction === 'left' ? -amount : amount,
            behavior: 'smooth',
        });
    };

    return (
        <section className={styles.section}>
            {photos.length > 1 ? (
                <>
                    <button
                        type="button"
                        className={`${styles.arrowButton} ${styles.leftArrow}`}
                        onClick={() => scrollGallery('left')}
                        aria-label="Прокрутить фотографии влево"
                    >
                        ‹
                    </button>

                    <button
                        type="button"
                        className={`${styles.arrowButton} ${styles.rightArrow}`}
                        onClick={() => scrollGallery('right')}
                        aria-label="Прокрутить фотографии вправо"
                    >
                        ›
                    </button>
                </>
            ) : null}

            <div className={styles.viewport} ref={viewportRef}>
                <div className={styles.track}>
                    {photos.length > 0 ? (
                        photos.map((photo) => (
                            <div key={photo.id} className={styles.imageCard}>
                                <img src={photo.publicUrl} alt={altText} className={styles.image} />
                            </div>
                        ))
                    ) : (
                        <div className={styles.placeholder}>{placeholderText}</div>
                    )}
                </div>
            </div>
        </section>
    );
};
