export declare function getOfficialBrands(): Promise<({
    _count: {
        products: number;
    };
} & {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    description: string | null;
    isOfficial: boolean;
})[]>;
export declare function getAllBrands(): Promise<({
    _count: {
        products: number;
    };
} & {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    description: string | null;
    isOfficial: boolean;
})[]>;
export declare function getBrandById(id: string): Promise<({
    _count: {
        products: number;
    };
} & {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    description: string | null;
    isOfficial: boolean;
}) | null>;
export declare function getBrandBySlug(slug: string): Promise<({
    products: ({
        category: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            imageUrl: string | null;
            parentId: string | null;
        };
        images: {
            order: number;
            id: string;
            url: string;
            productId: string;
            alt: string | null;
        }[];
        subProducts: {
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
        }[];
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
    })[];
} & {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    description: string | null;
    isOfficial: boolean;
}) | null>;
export declare function createBrand(data: {
    name: string;
    slug?: string;
    logoUrl?: string | null;
    description?: string | null;
    isOfficial?: boolean;
}): Promise<{
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    description: string | null;
    isOfficial: boolean;
}>;
export declare function updateBrand(id: string, data: {
    name?: string;
    slug?: string;
    logoUrl?: string | null;
    description?: string | null;
    isOfficial?: boolean;
}): Promise<{
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    description: string | null;
    isOfficial: boolean;
}>;
export declare function deleteBrand(id: string): Promise<{
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    description: string | null;
    isOfficial: boolean;
}>;
//# sourceMappingURL=brand.d.ts.map