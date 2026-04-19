import { useCallback, useEffect, useState } from 'react';
import {
    addRestaurantManager,
    getRestaurantManagers,
    removeRestaurantManager,
} from '@/entities/restaurant/api/management.ts';
import type { RestaurantManager } from '@/entities/restaurant/model/types.ts';
import { lookupUserByEmail } from '@/entities/user/api/lookup-user-by-email.ts';
import type { RestaurantLookupUser } from '@/entities/user/model/types.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { useConfirmDialog } from '@/shared/ui/confirm-dialog/ConfirmDialogProvider.tsx';
import styles from './restaurant-managers-section.module.scss';

type RestaurantManagersSectionProps = {
    restaurantId: string;
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const formatRoleLabel = (role: string) => {
    switch (role) {
        case 'ROLE_ADMIN':
            return 'Администратор';
        case 'ROLE_MANAGER':
            return 'Менеджер';
        default:
            return 'Пользователь';
    }
};

const getFullName = (user: Pick<RestaurantManager, 'name' | 'surname'>) => {
    return [user.name, user.surname].filter(Boolean).join(' ').trim() || 'Без имени';
};

const getLookupFullName = (user: RestaurantLookupUser) => {
    return [user.name, user.surname].filter(Boolean).join(' ').trim() || 'Без имени';
};

export const RestaurantManagersSection = ({
                                              restaurantId,
                                          }: RestaurantManagersSectionProps) => {
    const [managers, setManagers] = useState<RestaurantManager[]>([]);
    const [email, setEmail] = useState('');
    const [lookupResult, setLookupResult] = useState<RestaurantLookupUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLookupLoading, setIsLookupLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const confirmDialog = useConfirmDialog();

    const loadManagers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await getRestaurantManagers(restaurantId);
            setManagers(response);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось загрузить менеджеров ресторана'));
            setManagers([]);
        } finally {
            setIsLoading(false);
        }
    }, [restaurantId]);

    useEffect(() => {
        void loadManagers();
    }, [loadManagers]);

    const handleLookup = async () => {
        const normalizedEmail = email.trim();

        if (!normalizedEmail) {
            setError('Укажите email');
            return;
        }

        try {
            setIsLookupLoading(true);
            setError('');
            setSuccessMessage('');
            const response = await lookupUserByEmail(normalizedEmail);
            setLookupResult(response);
        } catch (requestError) {
            setLookupResult(null);
            setError(getApiErrorMessage(requestError, 'Пользователь с таким email не найден'));
        } finally {
            setIsLookupLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!lookupResult) {
            return;
        }

        try {
            setIsAdding(true);
            setError('');
            setSuccessMessage('');
            await addRestaurantManager(restaurantId, lookupResult.id);
            await loadManagers();
            setEmail('');
            setLookupResult(null);
            setSuccessMessage('Менеджер добавлен');
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось добавить менеджера'));
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemove = async (managerId: string) => {
        const isConfirmed = await confirmDialog({
            title: 'Удалить менеджера?',
            description: 'Пользователь потеряет доступ к управлению этим рестораном.',
            confirmText: 'Удалить менеджера',
        });

        if (!isConfirmed) {
            return;
        }

        try {
            setRemovingId(managerId);
            setError('');
            setSuccessMessage('');
            await removeRestaurantManager(restaurantId, managerId);
            await loadManagers();
            setSuccessMessage('Менеджер удалён');
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось удалить менеджера'));
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Менеджеры</h2>
                <p className={styles.description}>
                    Найдите пользователя по email и привяжите его к этому ресторану.
                </p>
            </div>

            <div className={styles.lookupRow}>
                <div className={styles.field}>
                    <label htmlFor="manager-email" className={styles.label}>Email пользователя</label>
                    <input
                        id="manager-email"
                        type="email"
                        className={styles.input}
                        value={email}
                        placeholder="someone@example.com"
                        onChange={(event) => {
                            setEmail(event.target.value);
                            setLookupResult(null);
                            setError('');
                            setSuccessMessage('');
                        }}
                    />
                </div>

                <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => void handleLookup()}
                    disabled={isLookupLoading}
                >
                    {isLookupLoading ? 'Поиск...' : 'Найти пользователя'}
                </button>
            </div>

            {lookupResult ? (
                <article className={styles.lookupCard}>
                    <div className={styles.lookupTop}>
                        <div>
                            <h3 className={styles.name}>{getLookupFullName(lookupResult)}</h3>
                            <div className={styles.meta}>{lookupResult.email}</div>
                        </div>

                        <button
                            type="button"
                            className={styles.actionButton}
                            onClick={() => void handleAdd()}
                            disabled={isAdding}
                        >
                            {isAdding ? 'Добавление...' : 'Добавить менеджера'}
                        </button>
                    </div>

                    <div className={styles.chips}>
                        <span className={`${styles.chip} ${styles.chipRole}`}>
                            {formatRoleLabel(lookupResult.role)}
                        </span>
                        <span
                            className={`${styles.chip} ${
                                lookupResult.enabled ? styles.chipStateActive : styles.chipStateInactive
                            }`}
                        >
                            {lookupResult.enabled ? 'Активен' : 'Отключён'}
                        </span>
                    </div>
                </article>
            ) : null}

            {error ? <div className={styles.error}>{error}</div> : null}
            {successMessage ? <div className={styles.success}>{successMessage}</div> : null}

            {isLoading ? (
                <div className={styles.state}>Загрузка менеджеров...</div>
            ) : managers.length > 0 ? (
                <div className={styles.list}>
                    {managers.map((manager) => (
                        <article key={manager.id} className={styles.managerCard}>
                            <div className={styles.managerTop}>
                                <div>
                                    <h3 className={styles.name}>{getFullName(manager)}</h3>
                                    <div className={styles.meta}>{manager.email || 'Email не указан'}</div>
                                </div>

                                <button
                                    type="button"
                                    className={styles.removeButton}
                                    onClick={() => void handleRemove(manager.id)}
                                    disabled={removingId === manager.id}
                                >
                                    {removingId === manager.id ? 'Удаление...' : 'Удалить'}
                                </button>
                            </div>

                            <div className={styles.chips}>
                                <span className={`${styles.chip} ${styles.chipRole}`}>
                                    {formatRoleLabel(manager.role)}
                                </span>
                                <span
                                    className={`${styles.chip} ${
                                        manager.enabled ? styles.chipStateActive : styles.chipStateInactive
                                    }`}
                                >
                                    {manager.enabled ? 'Активен' : 'Отключён'}
                                </span>
                                <span className={styles.chip}>
                                    Назначен: {dateFormatter.format(new Date(manager.assignedAt))}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className={styles.state}>У этого ресторана пока нет менеджеров</div>
            )}
        </section>
    );
};
