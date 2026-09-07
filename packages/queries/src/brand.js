"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOfficialBrands = getOfficialBrands;
exports.getAllBrands = getAllBrands;
exports.getBrandById = getBrandById;
exports.getBrandBySlug = getBrandBySlug;
exports.createBrand = createBrand;
exports.updateBrand = updateBrand;
exports.deleteBrand = deleteBrand;
const database_1 = require("@genie-light/database");
async function getOfficialBrands() {
    return database_1.prisma.brand.findMany({
        where: { isOfficial: true },
        include: {
            _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
    });
}
async function getAllBrands() {
    return database_1.prisma.brand.findMany({
        include: {
            _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
    });
}
async function getBrandById(id) {
    return database_1.prisma.brand.findUnique({
        where: { id },
        include: {
            _count: { select: { products: true } },
        },
    });
}
async function getBrandBySlug(slug) {
    return database_1.prisma.brand.findUnique({
        where: { slug },
        include: {
            products: {
                where: { active: true },
                include: {
                    category: true,
                    images: { take: 1 },
                    subProducts: { where: { active: true } },
                },
            },
        },
    });
}
async function createBrand(data) {
    const slug = data.slug ||
        data.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
    return database_1.prisma.brand.create({
        data: {
            name: data.name,
            slug,
            logoUrl: data.logoUrl || null,
            description: data.description || null,
            isOfficial: data.isOfficial ?? true,
        },
    });
}
async function updateBrand(id, data) {
    const updateData = { ...data };
    if (data.name && !data.slug) {
        updateData.slug = data.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
    }
    return database_1.prisma.brand.update({
        where: { id },
        data: updateData,
    });
}
async function deleteBrand(id) {
    return database_1.prisma.brand.delete({
        where: { id },
    });
}
//# sourceMappingURL=brand.js.map