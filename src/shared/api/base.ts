import axios from 'axios';
import { tokenStorage } from '../lib/token-storage/token-storage';

export const apiClient = axios.create({
    baseURL: 'http://localhost:8083',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = tokenStorage.getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});