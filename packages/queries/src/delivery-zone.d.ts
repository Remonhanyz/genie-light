export declare function getAllDeliveryZones(): Promise<{
    id: string;
    active: boolean;
    governorate: string;
    deliveryFee: import("@prisma/client/runtime/library").Decimal;
    estimatedDays: string;
}[]>;
export declare function getActiveDeliveryZones(): Promise<{
    id: string;
    active: boolean;
    governorate: string;
    deliveryFee: import("@prisma/client/runtime/library").Decimal;
    estimatedDays: string;
}[]>;
export declare function getDeliveryZoneByGovernorate(governorate: string): Promise<{
    id: string;
    active: boolean;
    governorate: string;
    deliveryFee: import("@prisma/client/runtime/library").Decimal;
    estimatedDays: string;
} | null>;
export declare function updateDeliveryFee(id: string, deliveryFee: number, estimatedDays: string, active?: boolean): Promise<{
    id: string;
    active: boolean;
    governorate: string;
    deliveryFee: import("@prisma/client/runtime/library").Decimal;
    estimatedDays: string;
}>;
export declare function upsertDeliveryZone(data: {
    governorate: string;
    deliveryFee: number;
    estimatedDays: string;
    active?: boolean;
}): Promise<{
    id: string;
    active: boolean;
    governorate: string;
    deliveryFee: import("@prisma/client/runtime/library").Decimal;
    estimatedDays: string;
}>;
//# sourceMappingURL=delivery-zone.d.ts.map