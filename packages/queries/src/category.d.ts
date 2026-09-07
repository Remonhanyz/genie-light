export declare function getCategoryTree(): Promise<({
    _count: {
        products: number;
    };
    children: ({
        _count: {
            products: number;
        };
    } & {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        imageUrl: string | null;
        parentId: string | null;
    })[];
} & {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    parentId: string | null;
})[]>;
export declare function getAllCategories(): Promise<({
    _count: {
        products: number;
    };
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
})[]>;
export declare function getCategoryById(id: string): Promise<({
    parent: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        imageUrl: string | null;
        parentId: string | null;
    } | null;
    children: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        imageUrl: string | null;
        parentId: string | null;
    }[];
} & {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    parentId: string | null;
}) | null>;
export declare function getCategoryBySlug(slug: string): Promise<({
    products: ({
        brand: {
            id: string;
            name: string;
            slug: string;
            logoUrl: string | null;
            description: string | null;
            isOfficial: boolean;
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
    parent: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        imageUrl: string | null;
        parentId: string | null;
    } | null;
    children: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        imageUrl: string | null;
        parentId: string | null;
    }[];
} & {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    parentId: string | null;
}) | null>;
export declare function createCategory(name: string, image?: string | null): Promise<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    parentId: string | null;
}>;
export declare function updateCategory(id: string, name: string, image?: string | null): Promise<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    parentId: string | null;
}>;
export declare function deleteCategory(id: string): Promise<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    parentId: string | null;
}>;
//# sourceMappingURL=category.d.ts.map