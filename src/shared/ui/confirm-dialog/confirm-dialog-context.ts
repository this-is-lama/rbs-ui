import { createContext } from 'react';

type ConfirmDialogTone = 'danger' | 'primary';

export type ConfirmDialogOptions = {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    tone?: ConfirmDialogTone;
};

export type NormalizedConfirmDialogOptions = {
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    tone: ConfirmDialogTone;
};

export type ConfirmDialogContextValue = {
    confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
};

export const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null);
