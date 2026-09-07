import { Role } from "@genie-light/database";
export interface UserFilter {
    role?: string;
    search?: string;
}
export declare function getUserById(id: string): Promise<({
    addresses: {
        id: string;
        title: string;
        governorate: string;
        userId: string;
        city: string;
        streetAddress: string;
        buildingFloor: string | null;
        isDefault: boolean;
    }[];
    orders: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deliveryFee: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        orderNumber: string;
        userId: string;
        addressId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        adminNotes: string | null;
    }[];
} & {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    passwordHash: string;
    phone: string | null;
    company: string | null;
    role: import(".prisma/client").$Enums.Role;
}) | null>;
export declare function getUserByEmail(email: string): Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    passwordHash: string;
    phone: string | null;
    company: string | null;
    role: import(".prisma/client").$Enums.Role;
} | null>;
export declare function getAllUsers(filter?: UserFilter): Promise<{
    id: string;
    name: string;
    _count: {
        orders: number;
        createdProducts: number;
        createdSubProducts: number;
    };
    createdAt: Date;
    updatedAt: Date;
    email: string;
    phone: string | null;
    company: string | null;
    role: import(".prisma/client").$Enums.Role;
}[]>;
export declare function getUsers(role?: Role, page?: number, limit?: number): Promise<{
    users: {
        id: string;
        name: string;
        _count: {
            orders: number;
            createdProducts: number;
            createdSubProducts: number;
        };
        createdAt: Date;
        email: string;
        phone: string | null;
        company: string | null;
        role: import(".prisma/client").$Enums.Role;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare function updateUserAdmin(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    role?: Role;
}): Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    passwordHash: string;
    phone: string | null;
    company: string | null;
    role: import(".prisma/client").$Enums.Role;
}>;
export declare function deleteUserAdmin(id: string): Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    passwordHash: string;
    phone: string | null;
    company: string | null;
    role: import(".prisma/client").$Enums.Role;
}>;
export declare function forceDeleteUserAdmin(id: string): Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    passwordHash: string;
    phone: string | null;
    company: string | null;
    role: import(".prisma/client").$Enums.Role;
}>;
export declare function getUserStats(): Promise<{
    totalUsers: number;
    totalAdmins: number;
    totalDataEntry: number;
    totalCustomers: number;
    teamRedCount: number;
    teamBlueCount: number;
}>;
export declare function getTeamScores(): Promise<{
    RED: number;
    BLUE: number;
}>;
//# sourceMappingURL=user.d.ts.map