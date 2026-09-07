import { prisma } from "@genie-light/database";

export async function getCategoryTree() {
  return prisma.category.findMany({
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

export async function getAllCategories() {
  return prisma.category.findMany({
    include: {
      parent: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      children: true,
      parent: true,
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
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

export async function createCategory(name: string, image?: string | null) {
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

  return prisma.category.create({
    data: {
      name,
      slug,
      imageUrl: image || null,
    },
  });
}

export async function updateCategory(id: string, name: string, image?: string | null) {
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

  return prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
      ...(image !== undefined ? { imageUrl: image } : {}),
    },
  });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({
    where: { id },
  });
}
