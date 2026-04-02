import { apiClient } from '@/shared/api/base';
import type {RegisterRequest} from './types.ts';

export const registerUser = async (data: RegisterRequest): Promise<string> => {
    const response = await apiClient.post<string>('/api/v1/auth/register', data);
    return response.data;
};