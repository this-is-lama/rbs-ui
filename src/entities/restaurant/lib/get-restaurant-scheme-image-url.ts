const defaultRestaurantSchemeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" fill="none">
  <rect width="1920" height="1080" fill="white"/>
  <rect x="1" y="1" width="1918" height="1078" rx="24" stroke="#E5E7EB" stroke-width="2"/>
</svg>
`.trim();

export const DEFAULT_RESTAURANT_SCHEME_IMAGE_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(defaultRestaurantSchemeSvg)}`;

export const getRestaurantSchemeImageUrl = (schemePhotoUrl?: string | null) => {
    return schemePhotoUrl?.trim() || DEFAULT_RESTAURANT_SCHEME_IMAGE_URL;
};
