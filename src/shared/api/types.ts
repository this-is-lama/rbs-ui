export interface ApiErrorResponse {
    message: string;
    status?: number;
    errorCode?: string;
    timestamp?: string;
    path?: string;
    details?: string[];
}