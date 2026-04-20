import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import { RestaurantManagerActions } from '@/features/restaurants/restaurant-manager-actions';
import { RestaurantManagersSection } from '@/features/restaurants/restaurant-managers';
import { getRestaurantSchemeImageUrl } from '@/entities/restaurant/lib';
import { RestaurantOrderConflictModal } from '@/shared/ui/restaurant-order-conflict-modal';
import { useRestaurantOrderGuard } from '@/shared/lib/restaurant-order';
import { Footer } from '@/widgets/footer';
import { useRestaurantDetails } from '../../model/use-restaurant-details.ts';
import { RestaurantBookingModal } from '../restaurant-booking-modal';
import { RestaurantGallery } from '../restaurant-gallery';
import { RestaurantInfoSection } from '../restaurant-info-section';
import { RestaurantMenuSection } from '../restaurant-menu-section';
import { RestaurantSchemeSection } from '../restaurant-scheme-section';
import styles from './restaurant-details-widget.module.scss';

export const RestaurantDetailsWidget = () => {
    const { id } = useParams<{ id: string }>();
    const { language } = useLanguage();
    const [isPhotoManagerOpen, setIsPhotoManagerOpen] = useState(false);
    const {
        restaurant,
        isLoading,
        error,
        selectedCategory,
        setSelectedCategory,
        selectedTable,
        setSelectedTable,
        todayWeekDay,
        workingHours,
        galleryPhotos,
        schemePhoto,
        visibleDishes,
        dishCategories,
        cartCounts,
        totalCartCount,
        totalCartAmount,
        placedTables,
        canManageRestaurant,
        reloadRestaurant,
        handleAddDish,
        handleDecreaseDish,
        handleBookingAdded,
    } = useRestaurantDetails(id);
    const {
        conflict,
        guardRestaurantOrder,
        cancelRestaurantSwitch,
        confirmRestaurantSwitch,
    } = useRestaurantOrderGuard();

    if (isLoading) {
        return (
            <div className={`container ${styles.page}`}>
                <div className={styles.stateBlock}>
                    {language === 'en' ? 'Loading restaurant page...' : 'Загрузка страницы ресторана...'}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`container ${styles.page}`}>
                <div className={styles.stateBlock}>{error}</div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className={`container ${styles.page}`}>
                <div className={styles.stateBlock}>
                    {language === 'en' ? 'Restaurant not found' : 'Ресторан не найден'}
                </div>
            </div>
        );
    }

    const handleOpenPhotoManager = () => {
        setIsPhotoManagerOpen(true);
        document.getElementById('restaurant-photos')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <>
            <div className={`container ${styles.page}`}>
                {canManageRestaurant ? (
                    <RestaurantManagerActions
                        restaurantId={restaurant.id}
                        onAddPhoto={handleOpenPhotoManager}
                    />
                ) : null}

                <RestaurantGallery
                    restaurantId={restaurant.id}
                    restaurantName={restaurant.name}
                    galleryPhotos={galleryPhotos}
                    canManageRestaurant={canManageRestaurant}
                    isPhotoManagerOpen={isPhotoManagerOpen}
                    onPhotoManagerOpenChange={setIsPhotoManagerOpen}
                    onPhotosChanged={reloadRestaurant}
                />

                <RestaurantInfoSection
                    restaurant={restaurant}
                    todayWeekDay={todayWeekDay}
                    workingHours={workingHours}
                />

                {canManageRestaurant ? (
                    <RestaurantManagersSection restaurantId={restaurant.id} />
                ) : null}

                <RestaurantMenuSection
                    restaurantId={restaurant.id}
                    dishCategories={dishCategories}
                    selectedCategory={selectedCategory}
                    totalCartCount={totalCartCount}
                    totalCartAmount={totalCartAmount}
                    visibleDishes={visibleDishes}
                    cartCounts={cartCounts}
                    onSelectCategory={setSelectedCategory}
                    onAddDish={(dish) => {
                        guardRestaurantOrder({
                            restaurantId: restaurant.id,
                            restaurantName: restaurant.name,
                            onAccept: () => handleAddDish(dish),
                        });
                    }}
                    onDecreaseDish={handleDecreaseDish}
                    canManageRestaurant={canManageRestaurant}
                />

                <RestaurantSchemeSection
                    restaurantId={restaurant.id}
                    restaurantName={restaurant.name}
                    schemePhoto={schemePhoto}
                    placedTables={placedTables}
                    canManageRestaurant={canManageRestaurant}
                    onSelectTable={setSelectedTable}
                />

                {selectedTable ? (
                    <RestaurantBookingModal
                        restaurant={restaurant}
                        table={selectedTable}
                        schemePhotoUrl={getRestaurantSchemeImageUrl(schemePhoto?.publicUrl ?? null)}
                        onClose={() => setSelectedTable(null)}
                        onAdded={handleBookingAdded}
                        onRequestAddToOrder={(onAccept) => {
                            guardRestaurantOrder({
                                restaurantId: restaurant.id,
                                restaurantName: restaurant.name,
                                onAccept,
                            });
                        }}
                    />
                ) : null}

            </div>

            <Footer />

            {conflict ? (
                <RestaurantOrderConflictModal
                    currentRestaurantName={conflict.currentRestaurantName}
                    nextRestaurantName={conflict.nextRestaurantName}
                    onCancel={cancelRestaurantSwitch}
                    onConfirm={confirmRestaurantSwitch}
                />
            ) : null}
        </>
    );
};
