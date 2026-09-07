"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryTree = getCategoryTree;
exports.getAllCategories = getAllCategories;
exports.getCategoryById = getCategoryById;
exports.getCategoryBySlug = getCategoryBySlug;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const database_1 = require("@genie-light/database");
async function getCategoryTree() {
    return database_1.prisma.category.findMany({
        where: { parentId: null },
        include: {
            children: {
                include: {
                    _count: { select: { products: true } },
                },
            },
            _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
    });
}
async function getAllCategories() {
    return database_1.prisma.category.findMany({
        include: {
            parent: true,
            _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
    });
}
async function getCategoryById(id) {
    return database_1.prisma.category.findUnique({
        where: { id },
        include: {
            children: true,
            parent: true,
        },
    });
}
async function getCategoryBySlug(slug) {
    return database_1.prisma.category.findUnique({
        where: { slug },
        include: {
            children: true,
            parent: true,
            products: {
                where: { active: true },
                include: {
                    brand: true,
                    images: { take: 1 },
                    subProducts: { where: { active: true } },
                },
            },
        },
    });
}
async function createCategory(name, image) {
    const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
    return database_1.prisma.category.create({
        data: {
            name,
            slug,
            imageUrl: image || null,
        },
    });
}
async function updateCategory(id, name, image) {
    const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
    return database_1.prisma.category.update({
        where: { id },
        data: {
            name,
            slug,
            ...(image !== undefined ? { imageUrl: image } : {}),
        },
    });
}
async function deleteCategory(id) {
    return database_1.prisma.category.delete({
        where: { id },
    });
}
//# sourceMappingURL=category.js.map