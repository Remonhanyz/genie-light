"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProducts = getAllProducts;
exports.getFeaturedProducts = getFeaturedProducts;
exports.getCatalogProducts = getCatalogProducts;
exports.getProductBySlug = getProductBySlug;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.forceDeleteProduct = forceDeleteProduct;
exports.archiveProduct = archiveProduct;
exports.getProductStats = getProductStats;
exports.countSubProductsByCreator = countSubProductsByCreator;
const database_1 = require("@genie-light/database");
async function getAllProducts(filter = {}) {
    const where = {};
    if (filter.categoryId)
        where.categoryId = filter.categoryId;
    if (filter.brandId)
        where.brandId = filter.brandId;
    if (filter.featured !== undefined)
        where.featured = filter.featured;
    if (filter.isFeatured !== undefined)
        where.featured = filter.isFeatured;
    if (filter.active !== undefined) {
        where.active = filter.active;
    }
    else if (filter.isArchived !== undefined) {
        where.active = !filter.isArchived;
    }
    else if (!filter.includeArchived) {
        where.active = true;
    }
    if (filter.search) {
        where.OR = [
            { name: { contains: filter.search, mode: "insensitive" } },
            { description: { contains: filter.search, mode: "insensitive" } },
            {
                subProducts: {
                    some: { sku: { contains: filter.search, mode: "insensitive" } },
                },
            },
        ];
    }
    return database_1.prisma.product.findMany({
        where,
        include: {
            brand: true,
            category: true,
            images: { orderBy: { order: "asc" } },
            subProducts: { orderBy: { price: "asc" } },
            _count: { select: { subProducts: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}
async function getFeaturedProducts() {
    return database_1.prisma.product.findMany({
        where: { featured: true, active: true },
        include: {
            brand: true,
            category: true,
            images: { orderBy: { order: "asc" }, take: 1 },
            subProducts: { where: { active: true }, orderBy: { price: "asc" } },
        },
        orderBy: { createdAt: "desc" },
    });
}
async function getCatalogProducts(params) {
    const { categoryId, brandId, minWattage, maxWattage, minLumens, maxLumens, cct, ipRating, search, page = 1, limit = 20, } = params;
    const skip = (page - 1) * limit;
    const subProductWhere = { active: true };
    if (minWattage !== undefined || maxWattage !== undefined) {
        subProductWhere.wattage = {};
        if (minWattage !== undefined)
            subProductWhere.wattage.gte = minWattage;
        if (maxWattage !== undefined)
            subProductWhere.wattage.lte = maxWattage;
    }
    if (minLumens !== undefined || maxLumens !== undefined) {
        subProductWhere.luminousFlux = {};
        if (minLumens !== undefined)
            subProductWhere.luminousFlux.gte = minLumens;
        if (maxLumens !== undefined)
            subProductWhere.luminousFlux.lte = maxLumens;
    }
    if (cct && cct.length > 0) {
        subProductWhere.colorTemperature = { in: cct };
    }
    if (ipRating && ipRating.length > 0) {
        subProductWhere.ipRating = { in: ipRating };
    }
    const productWhere = {
        active: true,
        subProducts: {
            some: subProductWhere,
        },
    };
    if (categoryId)
        productWhere.categoryId = categoryId;
    if (brandId)
        productWhere.brandId = brandId;
    if (search) {
        productWhere.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            {
                subProducts: {
                    some: {
                        OR: [
                            { sku: { contains: search, mode: "insensitive" } },
                            { modelNumber: { contains: search, mode: "insensitive" } },
                        ],
                    },
                },
            },
        ];
    }
    const [products, total] = await Promise.all([
        database_1.prisma.product.findMany({
            where: productWhere,
            include: {
                brand: true,
                category: true,
                images: { orderBy: { order: "asc" } },
                subProducts: {
                    where: subProductWhere,
                    orderBy: { price: "asc" },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        database_1.prisma.product.count({ where: productWhere }),
    ]);
    return {
        products,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}
async function getProductBySlug(slug) {
    return database_1.prisma.product.findUnique({
        where: { slug },
        include: {
            brand: true,
            category: {
                include: { parent: true },
            },
            images: { orderBy: { order: "asc" } },
            subProducts: {
                where: { active: true },
                orderBy: { wattage: "asc" },
            },
        },
    });
}
async function getProductById(id) {
    return database_1.prisma.product.findUnique({
        where: { id },
        include: {
            brand: true,
            category: true,
            images: { orderBy: { order: "asc" } },
            subProducts: true,
            createdBy: {
                select: { id: true, name: true, email: true, role: true },
            },
        },
    });
}
async function createProduct(data) {
    const slug = data.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
    // Fallback to first brand if none provided
    let brandId = data.brandId;
    if (!brandId) {
        const firstBrand = await database_1.prisma.brand.findFirst();
        if (firstBrand)
            brandId = firstBrand.id;
    }
    return database_1.prisma.product.create({
        data: {
            name: data.name,
            slug,
            description: data.description,
            shortDesc: data.shortDesc || null,
            brandId: brandId,
            categoryId: data.categoryId,
            featured: data.featured ?? false,
            active: data.active ?? true,
            createdById: data.createdById || null,
            images: data.images && data.images.length > 0
                ? {
                    create: data.images.map((url, order) => ({ url, order })),
                }
                : undefined,
        },
        include: {
            brand: true,
            category: true,
            images: true,
            subProducts: true,
        },
    });
}
async function updateProduct(id, data) {
    const updateData = {};
    if (data.name) {
        updateData.name = data.name;
        updateData.slug = data.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
    }
    if (data.description !== undefined)
        updateData.description = data.description;
    if (data.shortDesc !== undefined)
        updateData.shortDesc = data.shortDesc;
    if (data.brandId !== undefined)
        updateData.brandId = data.brandId;
    if (data.categoryId !== undefined)
        updateData.categoryId = data.categoryId;
    if (data.featured !== undefined)
        updateData.featured = data.featured;
    if (data.active !== undefined)
        updateData.active = data.active;
    if (data.images && data.images.length > 0) {
        // Replace images
        await database_1.prisma.productImage.deleteMany({ where: { productId: id } });
        updateData.images = {
            create: data.images.map((url, order) => ({ url, order })),
        };
    }
    return database_1.prisma.product.update({
        where: { id },
        data: updateData,
        include: {
            brand: true,
            category: true,
            images: true,
            subProducts: true,
        },
    });
}
async function deleteProduct(id) {
    return database_1.prisma.product.update({
        where: { id },
        data: { active: false },
    });
}
async function forceDeleteProduct(id) {
    return database_1.prisma.product.delete({
        where: { id },
    });
}
async function archiveProduct(id, active = false) {
    return database_1.prisma.product.update({
        where: { id },
        data: { active },
    });
}
async function getProductStats() {
    const [totalProducts, totalSubProducts, outOfStockCount] = await Promise.all([
        database_1.prisma.product.count(),
        database_1.prisma.subProduct.count(),
        database_1.prisma.subProduct.count({ where: { stockQuantity: { lte: 0 } } }),
    ]);
    return {
        totalProducts,
        totalSubProducts,
        outOfStockCount,
    };
}
async function countSubProductsByCreator(userId) {
    return database_1.prisma.subProduct.count({
        where: { createdById: userId },
    });
}
//# sourceMappingURL=product.js.map