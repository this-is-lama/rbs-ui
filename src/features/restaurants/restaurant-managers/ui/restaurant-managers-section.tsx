import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/app/providers/language';
import {
    addRestaurantManager,
    getRestaurantManagers,
    removeRestaurantManager,
} from '@/entities/restaurant/api/management.ts';
import type { RestaurantManager } from '@/entities/restaurant/model/types.ts';
import { lookupUserByEmail } from '@/entities/user/api/lookup-user-by-email.ts';
import type { RestaurantLookupUser } from '@/entities/user/model/types.ts';
import { resolveIntlLocale } from '@/shared/config/language.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { useConfirmDialog } from '@/shared/ui/confirm-dialog/use-confirm-dialog.ts';
import styles from './restaurant-managers-section.module.scss';

type RestaurantManagersSectionProps = {
    restaurantId: string;
};

const formatRoleLabel = (role: string, language: 'ru' | 'en') => {
    switch (role) {
        case 'ROLE_ADMIN':
            return language === 'en' ? 'Administrator' : 'Администратор';
        case 'ROLE_MANAGER':
            return language === 'en' ? 'Manager' : 'Менеджер';
        default:
            return language === 'en' ? 'User' : 'Пользователь';
    }
};

const getFullName = (
    user: Pick<RestaurantManager, 'name' | 'surname'>,
    language: 'ru' | 'en',
) => {
    return [user.name, user.surname].filter(Boolean).join(' ').trim()
        || (language === 'en' ? 'No name' : 'Без имени');
};

const getLookupFullName = (user: RestaurantLookupUser, language: 'ru' | 'en') => {
    return [user.name, user.surname].filter(Boolean).join(' ').trim()
        || (language === 'en' ? 'No name' : 'Без имени');
};

export const RestaurantManagersSection = ({
                                              restaurantId,
                                          }: RestaurantManagersSectionProps) => {
    const { language } = useLanguage();
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
    const copy = language === 'en'
        ? {
            active: 'Active',
            add: 'Add manager',
            addLoading: 'Adding...',
            assigned: 'Assigned',
            disabled: 'Disabled',
            emailLabel: 'User email',
            emailMissing: 'Email not specified',
            empty: 'This restaurant has no managers yet',
            find: 'Find user',
            findLoading: 'Searching...',
            inputRequired: 'Enter email',
            loadError: 'Failed to load restaurant managers',
            loading: 'Loading managers...',
            lookupError: 'A user with this email was not found',
            managerAdded: 'Manager added',
            managerRemoved: 'Manager removed',
            noAccessDescription: 'The user will lose access to managing this restaurant.',
            remove: 'Remove',
            removeConfirm: 'Remove manager',
            removeConfirmTitle: 'Remove manager?',
            removeError: 'Failed to remove manager',
            removeLoading: 'Removing...',
            roleUserHint: 'Find a user by email and assign them to this restaurant.',
            title: 'Managers',
        }
        : {
            active: 'Активен',
            add: 'Добавить менеджера',
            addLoading: 'Добавление...',
            assigned: 'Назначен',
            disabled: 'Отключён',
            emailLabel: 'Email пользователя',
            emailMissing: 'Email не указан',
            empty: 'У этого ресторана пока нет менеджеров',
            find: 'Найти пользователя',
            findLoading: 'Поиск...',
            inputRequired: 'Укажите email',
            loadError: 'Не удалось загрузить менеджеров ресторана',
            loading: 'Загрузка менеджеров...',
            lookupError: 'Пользователь с таким email не найден',
            managerAdded: 'Менеджер добавлен',
            managerRemoved: 'Менеджер удалён',
            noAccessDescription: 'Пользователь потеряет доступ к управлению этим рестораном.',
            remove: 'Удалить',
            removeConfirm: 'Удалить менеджера',
            removeConfirmTitle: 'Удалить менеджера?',
            removeError: 'Не удалось удалить менеджера',
            removeLoading: 'Удаление...',
            roleUserHint: 'Найдите пользователя по email и привяжите его к этому ресторану.',
            title: 'Менеджеры',
        };
    const dateFormatter = new Intl.DateTimeFormat(resolveIntlLocale(language), {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    const loadManagers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await getRestaurantManagers(restaurantId);
            setManagers(response);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, copy.loadError));
            setManagers([]);
        } finally {
            setIsLoading(false);
        }
    }, [copy.loadError, restaurantId]);

    useEffect(() => {
        void loadManagers();
    }, [loadManagers]);

    const handleLookup = async () => {
        const normalizedEmail = email.trim();

        if (!normalizedEmail) {
            setError(copy.inputRequired);
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
            setError(getApiErrorMessage(requestError, copy.lookupError));
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
            setSuccessMessage(copy.managerAdded);
        } catch (requestError) {
            setError(getApiErrorMessage(
                requestError,
                language === 'en' ? 'Failed to add manager' : 'Не удалось добавить менеджера',
            ));
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemove = async (managerId: string) => {
        const isConfirmed = await confirmDialog({
            title: copy.removeConfirmTitle,
            description: copy.noAccessDescription,
            confirmText: copy.removeConfirm,
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
            setSuccessMessage(copy.managerRemoved);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, copy.removeError));
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{copy.title}</h2>
                <p className={styles.description}>
                    {copy.roleUserHint}
                </p>
            </div>

            <div className={styles.lookupRow}>
                <div className={styles.field}>
                    <label htmlFor="manager-email" className={styles.label}>{copy.emailLabel}</label>
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
                    {isLookupLoading ? copy.findLoading : copy.find}
                </button>
            </div>

            {lookupResult ? (
                <article className={styles.lookupCard}>
                    <div className={styles.lookupTop}>
                        <div>
                            <h3 className={styles.name}>{getLookupFullName(lookupResult, language)}</h3>
                            <div className={styles.meta}>{lookupResult.email}</div>
                        </div>

                        <button
                            type="button"
                            className={styles.actionButton}
                            onClick={() => void handleAdd()}
                            disabled={isAdding}
                        >
                            {isAdding ? copy.addLoading : copy.add}
                        </button>
                    </div>

                    <div className={styles.chips}>
                        <span className={`${styles.chip} ${styles.chipRole}`}>
                            {formatRoleLabel(lookupResult.role, language)}
                        </span>
                        <span
                            className={`${styles.chip} ${
                                lookupResult.enabled ? styles.chipStateActive : styles.chipStateInactive
                            }`}
                        >
                            {lookupResult.enabled ? copy.active : copy.disabled}
                        </span>
                    </div>
                </article>
            ) : null}

            {error ? <div className={styles.error}>{error}</div> : null}
            {successMessage ? <div className={styles.success}>{successMessage}</div> : null}

            {isLoading ? (
                <div className={styles.state}>{copy.loading}</div>
            ) : managers.length > 0 ? (
                <div className={styles.list}>
                    {managers.map((manager) => (
                        <article key={manager.id} className={styles.managerCard}>
                            <div className={styles.managerTop}>
                                <div>
                                    <h3 className={styles.name}>{getFullName(manager, language)}</h3>
                                    <div className={styles.meta}>{manager.email || copy.emailMissing}</div>
                                </div>

                                <button
                                    type="button"
                                    className={styles.removeButton}
                                    onClick={() => void handleRemove(manager.id)}
                                    disabled={removingId === manager.id}
                                >
                                    {removingId === manager.id ? copy.removeLoading : copy.remove}
                                </button>
                            </div>

                            <div className={styles.chips}>
                                <span className={`${styles.chip} ${styles.chipRole}`}>
                                    {formatRoleLabel(manager.role, language)}
                                </span>
                                <span
                                    className={`${styles.chip} ${
                                        manager.enabled ? styles.chipStateActive : styles.chipStateInactive
                                    }`}
                                >
                                    {manager.enabled ? copy.active : copy.disabled}
                                </span>
                                <span className={styles.chip}>
                                    {copy.assigned}: {dateFormatter.format(new Date(manager.assignedAt))}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className={styles.state}>{copy.empty}</div>
            )}
        </section>
    );
};
