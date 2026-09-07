import { prisma } from "@genie-light/database";

export interface CatalogFilterParams {
  categoryId?: string;
  brandId?: string;
  minWattage?: number;
  maxWattage?: number;
  minLumens?: number;
  maxLumens?: number;
  cct?: number[];
  ipRating?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductFilter {
  categoryId?: string;
  brandId?: string;
  search?: string;
  active?: boolean;
  featured?: boolean;
  isOnSale?: boolean;
  isFeatured?: boolean;
  isArchived?: boolean;
  includeArchived?: boolean;
}

export async function getAllProducts(filter: ProductFilter = {}) {
  const where: any = {};
  if (filter.categoryId) where.categoryId = filter.categoryId;
  if (filter.brandId) where.brandId = filter.brandId;
  if (filter.featured !== undefined) where.featured = filter.featured;
  if (filter.isFeatured !== undefined) where.featured = filter.isFeatured;
  
  if (filter.active !== undefined) {
    where.active = filter.active;
  } else if (filter.isArchived !== undefined) {
    where.active = !filter.isArchived;
  } else if (!filter.includeArchived) {
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

  return prisma.product.findMany({
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

export async function getFeaturedProducts() {
  return prisma.product.findMany({
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

export async function getCatalogProducts(params: CatalogFilterParams) {
  const {
    categoryId,
    brandId,
    minWattage,
    maxWattage,
    minLumens,
    maxLumens,
    cct,
    ipRating,
    search,
    page = 1,
    limit = 20,
  } = params;

  const skip = (page - 1) * limit;

  const subProductWhere: any = { active: true };
  if (minWattage !== undefined || maxWattage !== undefined) {
    subProductWhere.wattage = {};
    if (minWattage !== undefined) subProductWhere.wattage.gte = minWattage;
    if (maxWattage !== undefined) subProductWhere.wattage.lte = maxWattage;
  }
  if (minLumens !== undefined || maxLumens !== undefined) {
    subProductWhere.luminousFlux = {};
    if (minLumens !== undefined) subProductWhere.luminousFlux.gte = minLumens;
    if (maxLumens !== undefined) subProductWhere.luminousFlux.lte = maxLumens;
  }
  if (cct && cct.length > 0) {
    subProductWhere.colorTemperature = { in: cct };
  }
  if (ipRating && ipRating.length > 0) {
    subProductWhere.ipRating = { in: ipRating };
  }

  const productWhere: any = {
    active: true,
    subProducts: {
      some: subProductWhere,
    },
  };

  if (categoryId) productWhere.categoryId = categoryId;
  if (brandId) productWhere.brandId = brandId;
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
    prisma.product.findMany({
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
    prisma.product.count({ where: productWhere }),
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

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
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

export async function getProductById(id: string) {
  return prisma.product.findUnique({
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

export async function createProduct(data: {
  name: string;
  description: string;
  shortDesc?: string | null;
  brandId?: string;
  categoryId: string;
  featured?: boolean;
  active?: boolean;
  createdById?: string;
  images?: string[];
  price?: number;
}) {
  const slug = data.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

  // Fallback to first brand if none provided
  let brandId = data.brandId;
  if (!brandId) {
    const firstBrand = await prisma.brand.findFirst();
    if (firstBrand) brandId = firstBrand.id;
  }

  return prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      shortDesc: data.shortDesc || null,
      brandId: brandId!,
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

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    description?: string;
    shortDesc?: string | null;
    brandId?: string;
    categoryId?: string;
    featured?: boolean;
    active?: boolean;
    images?: string[];
  }
) {
  const updateData: any = {};
  if (data.name) {
    updateData.name = data.name;
    updateData.slug = data.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  if (data.description !== undefined) updateData.description = data.description;
  if (data.shortDesc !== undefined) updateData.shortDesc = data.shortDesc;
  if (data.brandId !== undefined) updateData.brandId = data.brandId;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.featured !== undefined) updateData.featured = data.featured;
  if (data.active !== undefined) updateData.active = data.active;

  if (data.images && data.images.length > 0) {
    // Replace images
    await prisma.productImage.deleteMany({ where: { productId: id } });
    updateData.images = {
      create: data.images.map((url, order) => ({ url, order })),
    };
  }

  return prisma.product.update({
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

export async function deleteProduct(id: string) {
  return prisma.product.update({
    where: { id },
    data: { active: false },
  });
}

export async function forceDeleteProduct(id: string) {
  return prisma.product.delete({
    where: { id },
  });
}

export async function archiveProduct(id: string, active = false) {
  return prisma.product.update({
    where: { id },
    data: { active },
  });
}

export async function getProductStats() {
  const [totalProducts, totalSubProducts, outOfStockCount] = await Promise.all([
    prisma.product.count(),
    prisma.subProduct.count(),
    prisma.subProduct.count({ where: { stockQuantity: { lte: 0 } } }),
  ]);

  return {
    totalProducts,
    totalSubProducts,
    outOfStockCount,
  };
}

export async function countSubProductsByCreator(userId: string) {
  return prisma.subProduct.count({
    where: { createdById: userId },
  });
}
