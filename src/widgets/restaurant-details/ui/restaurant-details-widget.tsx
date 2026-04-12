import { useParams } from 'react-router-dom';
import { Footer } from '@/widgets/footer/Footer.tsx';
import { useRestaurantDetails } from '../model/use-restaurant-details.ts';
import { RestaurantBookingModal } from './components/restaurant-booking-modal.tsx';
import { RestaurantGallery } from './components/restaurant-gallery.tsx';
import { RestaurantInfoSection } from './components/restaurant-info-section.tsx';
import { RestaurantMenuSection } from './components/restaurant-menu-section.tsx';
import { RestaurantSchemeSection } from './components/restaurant-scheme-section.tsx';
import styles from './restaurant-details-widget.module.scss';

export const RestaurantDetailsWidget = () => {
    const { id } = useParams<{ id: string }>();
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
        notPlacedTables,
        bookingCartCount,
        handleAddDish,
        handleDecreaseDish,
        handleBookingAdded,
    } = useRestaurantDetails(id);

    if (isLoading) {
        return (
            <div className={`container ${styles.page}`}>
                <div className={styles.stateBlock}>Загрузка страницы ресторана...</div>
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
                <div className={styles.stateBlock}>{'\u0420\u0435\u0441\u0442\u043e\u0440\u0430\u043d \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d'}</div>
            </div>
        );
    }

    return (
        <>
            <div className={`container ${styles.page}`}>
                <RestaurantGallery restaurantName={restaurant.name} galleryPhotos={galleryPhotos} />

                <RestaurantInfoSection
                    restaurant={restaurant}
                    todayWeekDay={todayWeekDay}
                    workingHours={workingHours}
                />

                <RestaurantMenuSection
                    dishCategories={dishCategories}
                    selectedCategory={selectedCategory}
                    totalCartCount={totalCartCount}
                    totalCartAmount={totalCartAmount}
                    visibleDishes={visibleDishes}
                    cartCounts={cartCounts}
                    onSelectCategory={setSelectedCategory}
                    onAddDish={handleAddDish}
                    onDecreaseDish={handleDecreaseDish}
                />

                <RestaurantSchemeSection
                    restaurantName={restaurant.name}
                    schemePhoto={schemePhoto}
                    placedTables={placedTables}
                    notPlacedTables={notPlacedTables}
                    bookingCartCount={bookingCartCount}
                    onSelectTable={setSelectedTable}
                />

                {selectedTable ? (
                    <RestaurantBookingModal
                        restaurant={restaurant}
                        table={selectedTable}
                        schemePhotoUrl={schemePhoto?.publicUrl ?? null}
                        onClose={() => setSelectedTable(null)}
                        onAdded={handleBookingAdded}
                    />
                ) : null}
            </div>

            <Footer />
        </>
    );
};
