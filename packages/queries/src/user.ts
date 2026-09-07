import { prisma, Role } from "@genie-light/database";

export interface UserFilter {
  role?: string;
  search?: string;
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
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

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getAllUsers(filter: UserFilter = {}) {
  const where: any = {};
  if (filter.role) {
    where.role = filter.role as Role;
  }
  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search, mode: "insensitive" } },
      { email: { contains: filter.search, mode: "insensitive" } },
      { phone: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  return prisma.user.findMany({
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

export async function getUsers(role?: Role, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where = role ? { role } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
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
    prisma.user.count({ where }),
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

export async function updateUserAdmin(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    role?: Role;
  }
) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function deleteUserAdmin(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}

export async function forceDeleteUserAdmin(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}

export async function getUserStats() {
  const [totalUsers, totalAdmins, totalDataEntry, totalCustomers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.user.count({ where: { role: Role.DATA_ENTRY } }),
    prisma.user.count({ where: { role: Role.CUSTOMER } }),
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

export async function getTeamScores() {
  return {
    RED: 0,
    BLUE: 0,
  };
}
