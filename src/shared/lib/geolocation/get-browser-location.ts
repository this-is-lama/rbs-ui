export type BrowserLocation = {
    latitude: number;
    longitude: number;
};

export const getBrowserLocation = async (): Promise<BrowserLocation | null> => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return null;
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            () => {
                resolve(null);
            },
            {
                enableHighAccuracy: false,
                timeout: 3000,
                maximumAge: 5 * 60 * 1000,
            },
        );
    });
};
