import { OrderStatus } from "@genie-light/database";
export interface OrderFilter {
    status?: OrderStatus;
    userId?: string;
    search?: string;
}
export declare function getAllOrders(filter?: OrderFilter): Promise<({
    user: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        company: string | null;
    };
    address: {
        id: string;
        title: string;
        governorate: string;
        userId: string;
        city: string;
        streetAddress: string;
        buildingFloor: string | null;
        isDefault: boolean;
    };
    items: {
        id: string;
        sku: string;
        orderId: string;
        subProductId: string;
        productName: string;
        specsSummary: string;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        quantity: number;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
    }[];
} & {
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
})[]>;
export declare function getOrders(status?: OrderStatus, page?: number, limit?: number): Promise<{
    orders: ({
        user: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            company: string | null;
        };
        address: {
            id: string;
            title: string;
            governorate: string;
            userId: string;
            city: string;
            streetAddress: string;
            buildingFloor: string | null;
            isDefault: boolean;
        };
        items: {
            id: string;
            sku: string;
            orderId: string;
            subProductId: string;
            productName: string;
            specsSummary: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
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
    })[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare function getOrderById(id: string): Promise<({
    user: {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        phone: string | null;
        company: string | null;
        role: import(".prisma/client").$Enums.Role;
    };
    address: {
        id: string;
        title: string;
        governorate: string;
        userId: string;
        city: string;
        streetAddress: string;
        buildingFloor: string | null;
        isDefault: boolean;
    };
    items: ({
        subProduct: {
            product: {
                brand: {
                    id: string;
                    name: string;
                    slug: string;
                    logoUrl: string | null;
                    description: string | null;
                    isOfficial: boolean;
                };
            } & {
                id: string;
                name: string;
                slug: string;
                description: string;
                active: boolean;
                featured: boolean;
                createdAt: Date;
                updatedAt: Date;
                shortDesc: string | null;
                brandId: string;
                categoryId: string;
                createdById: string | null;
            };
        } & {
            id: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            ipRating: string | null;
            modelNumber: string | null;
            sku: string;
            productId: string;
            discountPrice: import("@prisma/client/runtime/library").Decimal | null;
            stockQuantity: number;
            wattage: number | null;
            luminousFlux: number | null;
            colorTemperature: number | null;
            cri: number | null;
            beamAngle: string | null;
            inputVoltage: string | null;
            dimensions: string | null;
            otherDetails: string | null;
            datasheetUrl: string | null;
        };
    } & {
        id: string;
        sku: string;
        orderId: string;
        subProductId: string;
        productName: string;
        specsSummary: string;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        quantity: number;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
    })[];
} & {
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
}) | null>;
export declare function updateOrderStatus(id: string, status: OrderStatus, adminNotes?: string): Promise<{
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
}>;
export declare function updateOrderDetails(id: string, data: {
    status?: OrderStatus;
    adminNotes?: string;
    notes?: string;
}): Promise<{
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
}>;
export declare function getSalesStats(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    shippingOrders: number;
}>;
export declare function getWeeklySalesTrend(): Promise<{
    day: string;
    sales: number;
}[]>;
//# sourceMappingURL=order.d.ts.map