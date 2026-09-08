import { NextRequest, NextResponse } from "next/server";
import { getProductById, deleteProduct, forceDeleteProduct } from "@genie-light/queries";
import { prisma } from "@genie-light/database";
import { handleApiError } from "@/lib/error-handler";
import { deleteFromStorage } from "@/lib/storage";

type Params = { id: string };

export async function GET(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    const currentProduct = await getProductById(id);
    if (!currentProduct) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      shortDesc,
      brandId,
      categoryId,
      featured,
      active,
      images,
      subProducts = [],
    } = body;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update parent details
      const updateData: any = {};
      if (name) {
        updateData.name = name;
        updateData.slug = name
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
      }
      if (description !== undefined) updateData.description = description;
      if (shortDesc !== undefined) updateData.shortDesc = shortDesc;
      if (brandId !== undefined) updateData.brandId = brandId;
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (featured !== undefined) updateData.featured = !!featured;
      if (active !== undefined) updateData.active = !!active;

      // Update images if provided
      if (Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        updateData.images = {
          create: images.map((url: string, order: number) => ({ url, order })),
        };
      }

      await tx.product.update({
        where: { id },
        data: updateData,
      });

      // 2. Sync subProducts if provided
      if (Array.isArray(subProducts) && subProducts.length > 0) {
        const existingSubProducts = await tx.subProduct.findMany({
          where: { productId: id },
          select: { id: true, sku: true },
        });
        const existingIds = new Set(existingSubProducts.map((sp) => sp.id));
        const incomingIds = new Set(subProducts.filter((sp: any) => sp.id).map((sp: any) => sp.id));

        // Delete removed variants
        for (const existing of existingSubProducts) {
          if (!incomingIds.has(existing.id)) {
            await tx.subProduct.delete({ where: { id: existing.id } });
          }
        }

        // Upsert variants
        for (const sp of subProducts) {
          const w = sp.wattage ? Number(sp.wattage) : null;
          const k = sp.colorTemperature ? Number(sp.colorTemperature) : null;
          const ip = sp.ipRating || "IP65";

          const variantData = {
            sku: sp.sku?.trim() || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
          };

          if (sp.id && existingIds.has(sp.id)) {
            await tx.subProduct.update({
              where: { id: sp.id },
              data: variantData,
            });
          } else {
            await tx.subProduct.create({
              data: {
                ...variantData,
                productId: id,
              },
            });
          }
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          brand: true,
          category: true,
          images: true,
          subProducts: true,
        },
      });
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const isForce = searchParams.get("force") === "true";

    const product = await getProductById(id);
    if (product && Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img?.url) {
          await deleteFromStorage(img.url);
        }
      }
    }

    if (isForce) {
      await forceDeleteProduct(id);
    } else {
      await deleteProduct(id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
