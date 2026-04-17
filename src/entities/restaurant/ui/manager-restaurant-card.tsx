import { generatePath } from 'react-router-dom';
import type { ManagerRestaurantCard as ManagerRestaurantCardType } from '@/entities/restaurant/model/types.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { RestaurantCard } from './restaurant-card.tsx';

type ManagerRestaurantCardProps = {
    restaurant: ManagerRestaurantCardType;
};

export const ManagerRestaurantCard = ({ restaurant }: ManagerRestaurantCardProps) => {
    const editPath = generatePath(RoutePaths.MY_RESTAURANT_EDIT, { id: restaurant.id });

    return <RestaurantCard restaurant={restaurant} editPath={editPath} isDimmed={!restaurant.active} />;
};
