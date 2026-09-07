export interface CatalogFilterParams {
    categoryId?: string;
    brandId?: string;
    minWattage?: number;
    maxWattage?: number;
    minLumens?: number;
    maxLumens?: number;
    cct?: number[];
    ipRating?: string[];
    search?: string;
    page?: number;
    limit?: number;
}
export interface ProductFilter {
    categoryId?: string;
    brandId?: string;
    search?: string;
    active?: boolean;
    featured?: boolean;
    isOnSale?: boolean;
    isFeatured?: boolean;
    isArchived?: boolean;
    includeArchived?: boolean;
}
export declare function getAllProducts(filter?: ProductFilter): Promise<({
    brand: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
        description: string | null;
        isOfficial: boolean;
    };
    category: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        imageUrl: string | null;
        parentId: string | null;
    };
    _count: {
        subProducts: number;
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
})[]>;
export declare function getFeaturedProducts(): Promise<({
    brand: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
        description: string | null;
        isOfficial: boolean;
    };
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
})[]>;
export declare function getCatalogProducts(params: CatalogFilterParams): Promise<{
    products: ({
        brand: {
            id: string;
            name: string;
            slug: string;
            logoUrl: string | null;
            description: string | null;
            isOfficial: boolean;
        };
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
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare function getProductBySlug(slug: string): Promise<({
    brand: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
        description: string | null;
        isOfficial: boolean;
    };
    category: {
        parent: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            imageUrl: string | null;
            parentId: string | null;
        } | null;
    } & {
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
}) | null>;
export declare function getProductById(id: string): Promise<({
    brand: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
        description: string | null;
        isOfficial: boolean;
    };
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
    createdBy: {
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    } | null;
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
}) | null>;
export declare function createProduct(data: {
    name: string;
    description: string;
    shortDesc?: string | null;
    brandId?: string;
    categoryId: string;
    featured?: boolean;
    active?: boolean;
    createdById?: string;
    images?: string[];
    price?: number;
}): Promise<{
    brand: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
        description: string | null;
        isOfficial: boolean;
    };
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
}>;
export declare function updateProduct(id: string, data: {
    name?: string;
    description?: string;
    shortDesc?: string | null;
    brandId?: string;
    categoryId?: string;
    featured?: boolean;
    active?: boolean;
    images?: string[];
}): Promise<{
    brand: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
        description: string | null;
        isOfficial: boolean;
    };
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
}>;
export declare function deleteProduct(id: string): Promise<{
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
}>;
export declare function forceDeleteProduct(id: string): Promise<{
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
}>;
export declare function archiveProduct(id: string, active?: boolean): Promise<{
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
}>;
export declare function getProductStats(): Promise<{
    totalProducts: number;
    totalSubProducts: number;
    outOfStockCount: number;
}>;
export declare function countSubProductsByCreator(userId: string): Promise<number>;
//# sourceMappingURL=product.d.ts.map