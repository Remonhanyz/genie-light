"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeaturedCaseStudies = getFeaturedCaseStudies;
exports.getAllCaseStudies = getAllCaseStudies;
exports.getCaseStudyById = getCaseStudyById;
exports.getCaseStudyBySlug = getCaseStudyBySlug;
exports.createCaseStudy = createCaseStudy;
exports.updateCaseStudy = updateCaseStudy;
exports.deleteCaseStudy = deleteCaseStudy;
const database_1 = require("@genie-light/database");
async function getFeaturedCaseStudies() {
    return database_1.prisma.projectCaseStudy.findMany({
        where: { featured: true },
        include: {
            images: { orderBy: { order: "asc" } },
        },
        orderBy: { createdAt: "desc" },
    });
}
async function getAllCaseStudies() {
    return database_1.prisma.projectCaseStudy.findMany({
        include: {
            images: { orderBy: { order: "asc" } },
            _count: { select: { images: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}
async function getCaseStudyById(id) {
    return database_1.prisma.projectCaseStudy.findUnique({
        where: { id },
        include: {
            images: { orderBy: { order: "asc" } },
        },
    });
}
async function getCaseStudyBySlug(slug) {
    return database_1.prisma.projectCaseStudy.findUnique({
        where: { slug },
        include: {
            images: { orderBy: { order: "asc" } },
        },
    });
}
async function createCaseStudy(data) {
    const slug = data.slug ||
        data.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
    return database_1.prisma.projectCaseStudy.create({
        data: {
            title: data.title,
            slug,
            client: data.client,
            sector: data.sector,
            location: data.location,
            summary: data.summary,
            challenges: data.challenges,
            solutions: data.solutions,
            standards: data.standards || null,
            featured: data.featured ?? false,
            images: data.images && data.images.length > 0
                ? {
                    create: data.images.map((img, idx) => ({
                        url: img.url,
                        caption: img.caption || null,
                        order: img.order ?? idx,
                    })),
                }
                : undefined,
        },
        include: {
            images: true,
        },
    });
}
async function updateCaseStudy(id, data) {
    const updateData = { ...data };
    if (data.title && !data.slug) {
        updateData.slug = data.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
    }
    if (data.images) {
        await database_1.prisma.projectImage.deleteMany({ where: { caseStudyId: id } });
        if (data.images.length > 0) {
            updateData.images = {
                create: data.images.map((img, idx) => ({
                    url: img.url,
                    caption: img.caption || null,
                    order: img.order ?? idx,
                })),
            };
        }
        else {
            delete updateData.images;
        }
    }
    return database_1.prisma.projectCaseStudy.update({
        where: { id },
        data: updateData,
        include: {
            images: true,
        },
    });
}
async function deleteCaseStudy(id) {
    return database_1.prisma.projectCaseStudy.delete({
        where: { id },
    });
}
//# sourceMappingURL=case-study.js.map