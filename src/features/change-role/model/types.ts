import type {UserRole} from "@/entities/user";

export interface ChangeRoleRequest {
    email: string;
    role: UserRole;
}

export type ChangeRoleResponse = string;