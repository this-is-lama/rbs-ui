import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type PropsWithChildren,
} from 'react';
import styles from './ConfirmDialogProvider.module.scss';

type ConfirmDialogTone = 'danger' | 'primary';

export type ConfirmDialogOptions = {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    tone?: ConfirmDialogTone;
};

type NormalizedConfirmDialogOptions = {
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    tone: ConfirmDialogTone;
};

type ConfirmDialogContextValue = {
    confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
};

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null);

const normalizeOptions = (options: ConfirmDialogOptions): NormalizedConfirmDialogOptions => {
    return {
        title: options.title,
        description: options.description ?? '',
        confirmText: options.confirmText ?? 'Подтвердить',
        cancelText: options.cancelText ?? 'Отмена',
        tone: options.tone ?? 'danger',
    };
};

export const ConfirmDialogProvider = ({ children }: PropsWithChildren) => {
    const resolverRef = useRef<((value: boolean) => void) | null>(null);
    const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
    const [dialogOptions, setDialogOptions] = useState<NormalizedConfirmDialogOptions | null>(null);

    const closeDialog = useCallback((value: boolean) => {
        const resolve = resolverRef.current;
        resolverRef.current = null;
        setDialogOptions(null);
        resolve?.(value);
    }, []);

    const confirm = useCallback((options: ConfirmDialogOptions) => {
        if (resolverRef.current) {
            resolverRef.current(false);
            resolverRef.current = null;
        }

        return new Promise<boolean>((resolve) => {
            resolverRef.current = resolve;
            setDialogOptions(normalizeOptions(options));
        });
    }, []);

    useEffect(() => {
        if (!dialogOptions) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const timeoutId = window.setTimeout(() => {
            confirmButtonRef.current?.focus();
        }, 0);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeDialog(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.clearTimeout(timeoutId);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [closeDialog, dialogOptions]);

    useEffect(() => {
        return () => {
            resolverRef.current?.(false);
            resolverRef.current = null;
        };
    }, []);

    const value = useMemo<ConfirmDialogContextValue>(() => ({
        confirm,
    }), [confirm]);

    return (
        <ConfirmDialogContext.Provider value={value}>
            {children}

            {dialogOptions ? (
                <div className={styles.overlay} onClick={() => closeDialog(false)}>
                    <div
                        className={styles.dialog}
                        onClick={(event) => event.stopPropagation()}
                        role="alertdialog"
                        aria-modal="true"
                        aria-label={dialogOptions.title}
                    >
                        <div className={styles.header}>
                            <span
                                className={`${styles.badge} ${
                                    dialogOptions.tone === 'danger'
                                        ? styles.badgeDanger
                                        : styles.badgePrimary
                                }`}
                            >
                                {dialogOptions.tone === 'danger' ? 'Подтвердите удаление' : 'Подтвердите действие'}
                            </span>

                            <h2 className={styles.title}>{dialogOptions.title}</h2>

                            {dialogOptions.description ? (
                                <p className={styles.description}>{dialogOptions.description}</p>
                            ) : null}
                        </div>

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => closeDialog(false)}
                            >
                                {dialogOptions.cancelText}
                            </button>

                            <button
                                ref={confirmButtonRef}
                                type="button"
                                className={`${styles.confirmButton} ${
                                    dialogOptions.tone === 'danger'
                                        ? styles.confirmButtonDanger
                                        : styles.confirmButtonPrimary
                                }`}
                                onClick={() => closeDialog(true)}
                            >
                                {dialogOptions.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </ConfirmDialogContext.Provider>
    );
};

export const useConfirmDialog = () => {
    const context = useContext(ConfirmDialogContext);

    if (!context) {
        throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
    }

    return context.confirm;
};
