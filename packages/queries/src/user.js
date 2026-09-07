"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = getUserById;
exports.getUserByEmail = getUserByEmail;
exports.getAllUsers = getAllUsers;
exports.getUsers = getUsers;
exports.updateUserAdmin = updateUserAdmin;
exports.deleteUserAdmin = deleteUserAdmin;
exports.forceDeleteUserAdmin = forceDeleteUserAdmin;
exports.getUserStats = getUserStats;
exports.getTeamScores = getTeamScores;
const database_1 = require("@genie-light/database");
async function getUserById(id) {
    return database_1.prisma.user.findUnique({
        where: { id },
        include: {
            addresses: true,
            orders: {
                take: 5,
                orderBy: { createdAt: "desc" },
            },
        },
    });
}
async function getUserByEmail(email) {
    return database_1.prisma.user.findUnique({
        where: { email },
    });
}
async function getAllUsers(filter = {}) {
    const where = {};
    if (filter.role) {
        where.role = filter.role;
    }
    if (filter.search) {
        where.OR = [
            { name: { contains: filter.search, mode: "insensitive" } },
            { email: { contains: filter.search, mode: "insensitive" } },
            { phone: { contains: filter.search, mode: "insensitive" } },
        ];
    }
    return database_1.prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    orders: true,
                    createdProducts: true,
                    createdSubProducts: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}
async function getUsers(role, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = role ? { role } : {};
    const [users, total] = await Promise.all([
        database_1.prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                company: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        orders: true,
                        createdProducts: true,
                        createdSubProducts: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        database_1.prisma.user.count({ where }),
    ]);
    return {
        users,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}
async function updateUserAdmin(id, data) {
    return database_1.prisma.user.update({
        where: { id },
        data,
    });
}
async function deleteUserAdmin(id) {
    return database_1.prisma.user.delete({
        where: { id },
    });
}
async function forceDeleteUserAdmin(id) {
    return database_1.prisma.user.delete({
        where: { id },
    });
}
async function getUserStats() {
    const [totalUsers, totalAdmins, totalDataEntry, totalCustomers] = await Promise.all([
        database_1.prisma.user.count(),
        database_1.prisma.user.count({ where: { role: database_1.Role.ADMIN } }),
        database_1.prisma.user.count({ where: { role: database_1.Role.DATA_ENTRY } }),
        database_1.prisma.user.count({ where: { role: database_1.Role.CUSTOMER } }),
    ]);
    return {
        totalUsers,
        totalAdmins,
        totalDataEntry,
        totalCustomers,
        teamRedCount: 0,
        teamBlueCount: 0,
    };
}
async function getTeamScores() {
    return {
        RED: 0,
        BLUE: 0,
    };
}
//# sourceMappingURL=user.js.map