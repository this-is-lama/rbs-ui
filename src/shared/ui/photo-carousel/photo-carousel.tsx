import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/app/providers/language';
import type { Photo } from '@/entities/restaurant/model/types.ts';
import { ChevronLeftIcon, ChevronRightIcon } from '@/shared/ui/icons/action-icons.tsx';
import styles from './photo-carousel.module.scss';

type PhotoCarouselProps = {
    photos: Photo[];
    altText: string;
    placeholderText: string;
    leadingCard?: ReactNode;
    leadingCardClassName?: string;
    size?: 'default' | 'large';
    renderPhotoActions?: (photo: Photo, index: number) => ReactNode;
};

export const PhotoCarousel = ({
    photos,
    altText,
    placeholderText,
    leadingCard,
    leadingCardClassName,
    size = 'default',
    renderPhotoActions,
}: PhotoCarouselProps) => {
    const { language } = useLanguage();
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const visibleCardCount = photos.length + (leadingCard ? 1 : 0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(visibleCardCount > 1);
    const copy = language === 'en'
        ? {
            scrollLeft: 'Scroll photos left',
            scrollRight: 'Scroll photos right',
        }
        : {
            scrollLeft: 'Прокрутить фотографии влево',
            scrollRight: 'Прокрутить фотографии вправо',
        };

    useEffect(() => {
        const container = viewportRef.current;

        if (!container) {
            return;
        }

        const updateScrollState = () => {
            const maxScrollLeft = Math.max(container.scrollWidth - container.clientWidth, 0);
            setCanScrollLeft(container.scrollLeft > 4);
            setCanScrollRight(container.scrollLeft < maxScrollLeft - 4);
        };

        updateScrollState();
        container.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState);

        return () => {
            container.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [visibleCardCount]);

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
        <section className={`${styles.section} ${size === 'large' ? styles.sectionLarge : ''}`.trim()}>
            {visibleCardCount > 1 && canScrollLeft ? (
                <>
                    <button
                        type="button"
                        className={`${styles.arrowButton} ${styles.leftArrow}`}
                        onClick={() => scrollGallery('left')}
                        aria-label={copy.scrollLeft}
                    >
                        <ChevronLeftIcon className={styles.arrowIcon} />
                    </button>
                </>
            ) : null}

            {visibleCardCount > 1 && canScrollRight ? (
                <>
                    <button
                        type="button"
                        className={`${styles.arrowButton} ${styles.rightArrow}`}
                        onClick={() => scrollGallery('right')}
                        aria-label={copy.scrollRight}
                    >
                        <ChevronRightIcon className={styles.arrowIcon} />
                    </button>
                </>
            ) : null}

            <div className={styles.viewport} ref={viewportRef}>
                <div className={styles.track}>
                    {leadingCard ? (
                        <div className={`${styles.utilityCard} ${leadingCardClassName ?? ''}`.trim()}>
                            {leadingCard}
                        </div>
                    ) : null}

                    {photos.length > 0 ? (
                        photos.map((photo, index) => (
                            <div key={photo.id} className={styles.imageCard}>
                                <img src={photo.publicUrl} alt={altText} className={styles.image} />
                                {renderPhotoActions ? (
                                    <div className={styles.imageActions}>
                                        {renderPhotoActions(photo, index)}
                                    </div>
                                ) : null}
                            </div>
                        ))
                    ) : leadingCard ? null : (
                        <div className={styles.placeholder}>{placeholderText}</div>
                    )}
                </div>
            </div>
        </section>
    );
};
