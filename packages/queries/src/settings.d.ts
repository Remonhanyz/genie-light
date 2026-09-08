export interface SystemSettings {
    storeName: string;
    currency: string;
    contactEmail: string;
    contactPhone: string;
    codShippingFee?: number;
    maintenanceMode?: boolean;
    [key: string]: any;
}
export declare function getSystemSettings(): Promise<SystemSettings>;
export declare function updateSystemSettings(data: Partial<SystemSettings>): Promise<SystemSettings>;
//# sourceMappingURL=settings.d.ts.map