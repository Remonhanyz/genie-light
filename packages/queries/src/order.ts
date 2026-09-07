import { prisma, OrderStatus, PaymentMethod } from "@genie-light/database";

export interface OrderFilter {
  status?: OrderStatus;
  userId?: string;
  search?: string;
}

export async function getAllOrders(filter: OrderFilter = {}) {
  const where: any = {};
  if (filter.status) where.status = filter.status;
  if (filter.userId) where.userId = filter.userId;
  if (filter.search) {
    where.OR = [
      { orderNumber: { contains: filter.search, mode: "insensitive" } },
      { user: { name: { contains: filter.search, mode: "insensitive" } } },
      { user: { email: { contains: filter.search, mode: "insensitive" } } },
    ];
  }

  return prisma.order.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, company: true } },
      address: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrders(status?: OrderStatus, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
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
    prisma.order.count({ where }),
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

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
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

export async function updateOrderStatus(id: string, status: OrderStatus, adminNotes?: string) {
  return prisma.order.update({
    where: { id },
    data: {
      status,
      ...(adminNotes ? { adminNotes } : {}),
    },
  });
}

export async function updateOrderDetails(
  id: string,
  data: {
    status?: OrderStatus;
    adminNotes?: string;
    notes?: string;
  }
) {
  return prisma.order.update({
    where: { id },
    data,
  });
}

export async function getSalesStats() {
  const [orders, totalOrders, pendingOrders, shippingOrders] = await Promise.all([
    prisma.order.findMany({ select: { total: true, status: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  return {
    totalRevenue,
    totalOrders,
    pendingOrders,
    shippingOrders,
  };
}

export async function getWeeklySalesTrend() {
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
