"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = getAllOrders;
exports.getOrders = getOrders;
exports.getOrderById = getOrderById;
exports.updateOrderStatus = updateOrderStatus;
exports.updateOrderDetails = updateOrderDetails;
exports.getSalesStats = getSalesStats;
exports.getWeeklySalesTrend = getWeeklySalesTrend;
const database_1 = require("@genie-light/database");
async function getAllOrders(filter = {}) {
    const where = {};
    if (filter.status)
        where.status = filter.status;
    if (filter.userId)
        where.userId = filter.userId;
    if (filter.search) {
        where.OR = [
            { orderNumber: { contains: filter.search, mode: "insensitive" } },
            { user: { name: { contains: filter.search, mode: "insensitive" } } },
            { user: { email: { contains: filter.search, mode: "insensitive" } } },
        ];
    }
    return database_1.prisma.order.findMany({
        where,
        include: {
            user: { select: { id: true, name: true, email: true, phone: true, company: true } },
            address: true,
            items: true,
        },
        orderBy: { createdAt: "desc" },
    });
}
async function getOrders(status, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};
    const [orders, total] = await Promise.all([
        database_1.prisma.order.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true, phone: true, company: true } },
                address: true,
                items: true,
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        database_1.prisma.order.count({ where }),
    ]);
    return {
        orders,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}
async function getOrderById(id) {
    return database_1.prisma.order.findUnique({
        where: { id },
        include: {
            user: true,
            address: true,
            items: {
                include: {
                    subProduct: {
                        include: {
                            product: {
                                include: { brand: true },
                            },
                        },
                    },
                },
            },
        },
    });
}
async function updateOrderStatus(id, status, adminNotes) {
    return database_1.prisma.order.update({
        where: { id },
        data: {
            status,
            ...(adminNotes ? { adminNotes } : {}),
        },
    });
}
async function updateOrderDetails(id, data) {
    return database_1.prisma.order.update({
        where: { id },
        data,
    });
}
async function getSalesStats() {
    const [orders, totalOrders, pendingOrders, shippingOrders] = await Promise.all([
        database_1.prisma.order.findMany({ select: { total: true, status: true } }),
        database_1.prisma.order.count(),
        database_1.prisma.order.count({ where: { status: database_1.OrderStatus.PENDING } }),
        database_1.prisma.order.count({ where: { status: database_1.OrderStatus.SHIPPED } }),
    ]);
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    return {
        totalRevenue,
        totalOrders,
        pendingOrders,
        shippingOrders,
    };
}
async function getWeeklySalesTrend() {
    return [
        { day: "Sat", sales: 4200 },
        { day: "Sun", sales: 7800 },
        { day: "Mon", sales: 12500 },
        { day: "Tue", sales: 9400 },
        { day: "Wed", sales: 15300 },
        { day: "Thu", sales: 18900 },
        { day: "Fri", sales: 6100 },
    ];
}
//# sourceMappingURL=order.js.map