import { prisma } from "@genie-light/database";

export async function getOfficialBrands() {
  return prisma.brand.findMany({
    where: { isOfficial: true },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getAllBrands() {
  return prisma.brand.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getBrandById(id: string) {
  return prisma.brand.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true } },
    },
  });
}

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({
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

export async function createBrand(data: {
  name: string;
  slug?: string;
  logoUrl?: string | null;
  description?: string | null;
  isOfficial?: boolean;
}) {
  const slug =
    data.slug ||
    data.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  return prisma.brand.create({
    data: {
      name: data.name,
      slug,
      logoUrl: data.logoUrl || null,
      description: data.description || null,
      isOfficial: data.isOfficial ?? true,
    },
  });
}

export async function updateBrand(
  id: string,
  data: {
    name?: string;
    slug?: string;
    logoUrl?: string | null;
    description?: string | null;
    isOfficial?: boolean;
  }
) {
  const updateData: any = { ...data };
  if (data.name && !data.slug) {
    updateData.slug = data.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  return prisma.brand.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteBrand(id: string) {
  return prisma.brand.delete({
    where: { id },
  });
}
