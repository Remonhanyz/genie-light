import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@genie-light/queries";
import { prisma } from "@genie-light/database";
import { getAdminDataLocal } from "@/lib/auth-server";
import { handleApiError } from "@/lib/error-handler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const brandId = searchParams.get("brandId") || undefined;
    const search = searchParams.get("search") || undefined;
    const isFeaturedParam = searchParams.get("isFeatured");
    const isFeatured = isFeaturedParam !== null ? isFeaturedParam === "true" : undefined;

    const products = await getAllProducts({
      categoryId,
      brandId,
      search,
      isFeatured,
      includeArchived: true,
    });
    return NextResponse.json(products);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAdminDataLocal();
    const body = await request.json();
    const {
      name,
      description,
      shortDesc,
      brandId,
      categoryId,
      featured = false,
      active = true,
      images = [],
      subProducts = [],
    } = body;

    if (!name || !description || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Product name, category, and description are required." },
        { status: 400 }
      );
    }

    // Resolve brand
    let resolvedBrandId = brandId;
    let brandName = "GL";
    if (!resolvedBrandId) {
      const firstBrand = await prisma.brand.findFirst();
      if (firstBrand) {
        resolvedBrandId = firstBrand.id;
        brandName = firstBrand.name.toUpperCase().slice(0, 3);
      }
    } else {
      const b = await prisma.brand.findUnique({ where: { id: resolvedBrandId } });
      if (b) brandName = b.name.toUpperCase().slice(0, 3);
    }

    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    // Prepare child variants
    const seriesCode = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);

    const subProductsToCreate = subProducts.map((sp: any, idx: number) => {
      const w = sp.wattage ? Number(sp.wattage) : null;
      const k = sp.colorTemperature ? Number(sp.colorTemperature) : null;
      const ip = sp.ipRating || "IP65";

      // Suggested SKU format: [BRAND]-[SERIES]-[WATTAGE]W-[CCT]K-[IP]
      const autoSku = sp.sku?.trim()
        ? sp.sku.trim()
        : `${brandName}-${seriesCode}-${w || 0}W-${k || 4000}K-${ip}-${idx + 1}`;

      return {
        sku: autoSku,
        modelNumber: sp.modelNumber || null,
        price: Number(sp.price) || 0,
        discountPrice: sp.discountPrice ? Number(sp.discountPrice) : null,
        stockQuantity: parseInt(sp.stockQuantity, 10) || 0,
        wattage: w,
        luminousFlux: sp.luminousFlux ? parseInt(sp.luminousFlux, 10) : null,
        colorTemperature: k,
        cri: sp.cri ? parseInt(sp.cri, 10) : null,
        beamAngle: sp.beamAngle || null,
        ipRating: ip,
        inputVoltage: sp.inputVoltage || "220-240V",
        dimensions: sp.dimensions || null,
        otherDetails: sp.otherDetails || null,
        datasheetUrl: sp.datasheetUrl || null,
        active: sp.active ?? true,
        createdById: user ? user.name : null, // audit attribution
      };
    });

    const product = await prisma.$transaction(async (tx) => {
      const createdParent = await tx.product.create({
        data: {
          name,
          slug,
          shortDesc: shortDesc || null,
          description,
          brandId: resolvedBrandId,
          categoryId,
          featured: !!featured,
          active: !!active,
          createdById: undefined,
          images: {
            create: (Array.isArray(images) ? images : []).map((url: string, order: number) => ({
              url,
              order,
            })),
          },
          subProducts: {
            create: subProductsToCreate,
          },
        },
        include: {
          brand: true,
          category: true,
          images: true,
          subProducts: true,
        },
      });

      return createdParent;
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
