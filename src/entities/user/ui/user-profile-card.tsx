import type { UserProfile } from '../api/types';
import {UserAvatar} from "@/entities/user/ui/use-avatar.tsx";

type UserProfileCardProps = {
    user: UserProfile;
};

const getDisplayValue = (value: string | null | undefined) => {
    if (!value) {
        return 'Не указано';
    }

    return value;
};

export const UserProfileCard = ({ user }: UserProfileCardProps) => {
    return (
        <div>
            <UserAvatar />

            <div>
                <div>
                    <div>Имя</div>
                    <div>{getDisplayValue(user.name)}</div>
                </div>

                <div>
                    <div>Фамилия</div>
                    <div>{getDisplayValue(user.surname)}</div>
                </div>

                <div>
                    <div>Дата рождения</div>
                    <div>{getDisplayValue(user.dateOfBirth)}</div>
                </div>

                <div>
                    <div>Телефон</div>
                    <div>{getDisplayValue(user.phone)}</div>
                </div>

                <div>
                    <div>Почта</div>
                    <div>{getDisplayValue(user.email)}</div>
                </div>

                <div>
                    <div>Пароль</div>
                    <div>********</div>
                </div>
            </div>
        </div>
    );
};