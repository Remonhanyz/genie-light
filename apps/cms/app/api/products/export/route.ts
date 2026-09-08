import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@genie-light/database";
import * as XLSX from "xlsx";
import { handleApiError } from "@/lib/error-handler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const search = searchParams.get("search") || undefined;

    const products = await prisma.product.findMany({
      where: {
        ...(brandId ? { brandId } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
                { subProducts: { some: { sku: { contains: search, mode: "insensitive" } } } },
              ],
            }
          : {}),
      },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { order: "asc" } },
        subProducts: { orderBy: { sku: "asc" } },
      },
      orderBy: { name: "asc" },
    });

    const flatRows: any[] = [];
    const summaryRows: any[] = [];

    for (const p of products) {
      const imgList = p.images.map((img) => img.url).join(", ");
      const totalStock = p.subProducts.reduce((sum, sp) => sum + sp.stockQuantity, 0);
      const prices = p.subProducts.map((sp) => Number(sp.price)).filter((pr) => !isNaN(pr));
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      summaryRows.push({
        "Product ID": p.id,
        "Product Name": p.name,
        "Slug": p.slug,
        "Brand": p.brand?.name || "",
        "Category": p.category?.name || "",
        "Total Variations": p.subProducts.length,
        "Total Stock": totalStock,
        "Price Range (EGP)": prices.length > 0 ? `${minPrice} - ${maxPrice}` : "N/A",
        "Featured": p.featured ? "Yes" : "No",
        "Active": p.active ? "Yes" : "No",
        "Created At": p.createdAt.toISOString().split("T")[0],
      });

      if (p.subProducts.length === 0) {
        flatRows.push({
          "Product Name": p.name,
          "Brand": p.brand?.name || "",
          "Category": p.category?.name || "",
          "Short Description": p.shortDesc || "",
          "Description": p.description || "",
          "Featured": p.featured ? "Yes" : "No",
          "Product Active": p.active ? "Yes" : "No",
          "Images": imgList,
          "SKU": "",
          "Model Number": "",
          "Wattage (W)": "",
          "Luminous Flux (lm)": "",
          "CCT (Kelvin)": "",
          "CRI": "",
          "Beam Angle": "",
          "IP Rating": "",
          "Input Voltage": "",
          "Dimensions": "",
          "Other Details": "",
          "Price (EGP)": "",
          "Sale Price (EGP)": "",
          "Stock": "",
          "Datasheet URL": "",
          "Variation Active": "",
        });
      } else {
        for (const sp of p.subProducts) {
          flatRows.push({
            "Product Name": p.name,
            "Brand": p.brand?.name || "",
            "Category": p.category?.name || "",
            "Short Description": p.shortDesc || "",
            "Description": p.description || "",
            "Featured": p.featured ? "Yes" : "No",
            "Product Active": p.active ? "Yes" : "No",
            "Images": imgList,
            "SKU": sp.sku,
            "Model Number": sp.modelNumber || "",
            "Wattage (W)": sp.wattage ?? "",
            "Luminous Flux (lm)": sp.luminousFlux ?? "",
            "CCT (Kelvin)": sp.colorTemperature ?? "",
            "CRI": sp.cri ?? "",
            "Beam Angle": sp.beamAngle || "",
            "IP Rating": sp.ipRating || "",
            "Input Voltage": sp.inputVoltage || "",
            "Dimensions": sp.dimensions || "",
            "Other Details": sp.otherDetails || "",
            "Price (EGP)": Number(sp.price),
            "Sale Price (EGP)": sp.discountPrice ? Number(sp.discountPrice) : "",
            "Stock": sp.stockQuantity,
            "Datasheet URL": sp.datasheetUrl || "",
            "Variation Active": sp.active ? "Yes" : "No",
          });
        }
      }
    }

    const wb = XLSX.utils.book_new();

    const wsFlat = XLSX.utils.json_to_sheet(flatRows);
    wsFlat["!cols"] = [
      { wch: 35 }, // Product Name
      { wch: 15 }, // Brand
      { wch: 25 }, // Category
      { wch: 35 }, // Short Description
      { wch: 45 }, // Description
      { wch: 10 }, // Featured
      { wch: 14 }, // Product Active
      { wch: 30 }, // Images
      { wch: 25 }, // SKU
      { wch: 25 }, // Model Number
      { wch: 12 }, // Wattage
      { wch: 18 }, // Luminous Flux
      { wch: 14 }, // CCT
      { wch: 8 },  // CRI
      { wch: 12 }, // Beam Angle
      { wch: 12 }, // IP Rating
      { wch: 14 }, // Input Voltage
      { wch: 22 }, // Dimensions
      { wch: 35 }, // Other Details
      { wch: 14 }, // Price (EGP)
      { wch: 16 }, // Sale Price (EGP)
      { wch: 10 }, // Stock
      { wch: 35 }, // Datasheet URL
      { wch: 16 }, // Variation Active
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary["!cols"] = [
      { wch: 36 },
      { wch: 35 },
      { wch: 30 },
      { wch: 15 },
      { wch: 25 },
      { wch: 16 },
      { wch: 12 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 14 },
    ];

    XLSX.utils.book_append_sheet(wb, wsFlat, "Products & Variations");
    XLSX.utils.book_append_sheet(wb, wsSummary, "Parent Products Summary");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const dateStr = new Date().toISOString().split("T")[0];
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="genie-light-catalog-${dateStr}.xlsx"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
