import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@genie-light/database";
import * as XLSX from "xlsx";
import { getAdminDataLocal } from "@/lib/auth-server";
import { handleApiError } from "@/lib/error-handler";

export const dynamic = "force-dynamic";

// Normalize column headers to handle various spellings and case variations
function getRowValue(row: Record<string, any>, possibleKeys: string[]): any {
  const rowKeys = Object.keys(row);
  for (const key of possibleKeys) {
    const matchedKey = rowKeys.find(
      (rk) => rk.trim().toLowerCase() === key.toLowerCase()
    );
    if (matchedKey !== undefined && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      const val = row[matchedKey];
      if (typeof val === "string") {
        return val.trim();
      }
      return val;
    }
  }
  return undefined;
}

function parseBool(val: any, defaultVal = true): boolean {
  if (val === undefined || val === null || val === "") return defaultVal;
  if (typeof val === "boolean") return val;
  const str = String(val).trim().toLowerCase();
  return str === "yes" || str === "true" || str === "1" || str === "y";
}

function parseNum(val: any): number | null {
  if (val === undefined || val === null || val === "") return null;
  const cleaned = String(val).replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseIntNum(val: any): number | null {
  if (val === undefined || val === null || val === "") return null;
  const cleaned = String(val).replace(/[^0-9-]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAdminDataLocal();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No Excel file provided in 'file' form field." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });

    // Choose target sheet: "Products & Variations" or "Products" or the first available sheet
    const sheetName =
      workbook.SheetNames.find(
        (name) =>
          name.toLowerCase().includes("products & variations") ||
          name.toLowerCase().includes("product")
      ) || workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      return NextResponse.json(
        { success: false, error: "The Excel file contains no valid sheets." },
        { status: 400 }
      );
    }

    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (rawRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "The selected sheet is empty. Please add rows or use the template." },
        { status: 400 }
      );
    }

    // Preload brands & categories
    const allBrands = await prisma.brand.findMany();
    const allCategories = await prisma.category.findMany();

    const brandMap = new Map<string, typeof allBrands[0]>();
    for (const b of allBrands) {
      brandMap.set(b.name.toLowerCase().trim(), b);
      if (b.slug) brandMap.set(b.slug.toLowerCase().trim(), b);
    }

    const categoryMap = new Map<string, typeof allCategories[0]>();
    for (const c of allCategories) {
      categoryMap.set(c.name.toLowerCase().trim(), c);
      categoryMap.set(c.slug.toLowerCase().trim(), c);
    }

    // Default brand/category fallback if nothing matched
    let fallbackBrand = allBrands[0];
    if (!fallbackBrand) {
      fallbackBrand = await prisma.brand.create({
        data: {
          name: "Genie Light",
          slug: "genie-light",
          isOfficial: true,
        },
      });
      brandMap.set("genie light", fallbackBrand);
    }

    let fallbackCategory = allCategories[0];
    if (!fallbackCategory) {
      fallbackCategory = await prisma.category.create({
        data: {
          name: "General Lighting",
          slug: "general-lighting",
        },
      });
      categoryMap.set("general lighting", fallbackCategory);
    }

    // Group rows by Product Name
    interface ParsedRow {
      rowIdx: number;
      productName: string;
      brandName: string;
      categoryName: string;
      shortDesc: string;
      description: string;
      featured: boolean;
      productActive: boolean;
      images: string[];
      sku: string;
      modelNumber: string;
      wattage: number | null;
      luminousFlux: number | null;
      colorTemperature: number | null;
      cri: number | null;
      beamAngle: string;
      ipRating: string;
      inputVoltage: string;
      dimensions: string;
      otherDetails: string;
      price: number;
      salePrice: number | null;
      stock: number;
      datasheetUrl: string;
      variationActive: boolean;
    }

    const productGroups = new Map<string, ParsedRow[]>();
    const warnings: string[] = [];
    const errors: string[] = [];

    let totalValidRows = 0;

    rawRows.forEach((row, idx) => {
      const rowNumber = idx + 2; // +1 for 0-index, +1 for header row
      const productName = getRowValue(row, [
        "Product Name",
        "product_name",
        "Product",
        "name",
        "Commercial Product Name",
      ]);

      if (!productName || String(productName).trim().length === 0) {
        // Skip empty row or row without product name
        return;
      }

      const prodKey = String(productName).trim();
      const sku = getRowValue(row, ["SKU", "sku", "Variant SKU", "Part Number", "Item Code"]) || "";
      const priceRaw = getRowValue(row, ["Price (EGP)", "Price", "price", "Cost"]);
      const price = parseNum(priceRaw) ?? 0;

      const imgRaw = getRowValue(row, ["Images", "image_urls", "Image URLs", "Photo", "Image"]) || "";
      const images = String(imgRaw)
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const parsed: ParsedRow = {
        rowIdx: rowNumber,
        productName: prodKey,
        brandName: getRowValue(row, ["Brand", "brand_name", "Brand Name", "Manufacturer"]) || "",
        categoryName: getRowValue(row, ["Category", "category_name", "Category Name", "Taxonomy"]) || "",
        shortDesc: getRowValue(row, ["Short Description", "short_desc", "Summary"]) || "",
        description:
          getRowValue(row, ["Description", "description", "Full Description", "Details"]) ||
          `${prodKey} commercial architectural luminaire.`,
        featured: parseBool(getRowValue(row, ["Featured", "is_featured", "Feature"]), false),
        productActive: parseBool(getRowValue(row, ["Product Active", "active", "Status"]), true),
        images,
        sku: String(sku).trim(),
        modelNumber: String(getRowValue(row, ["Model Number", "model_number", "Model"]) || "").trim(),
        wattage: parseNum(getRowValue(row, ["Wattage (W)", "Wattage", "wattage", "Watts", "Power"])),
        luminousFlux: parseIntNum(
          getRowValue(row, ["Luminous Flux (lm)", "Luminous Flux", "Flux", "Lumens", "lm"])
        ),
        colorTemperature: parseIntNum(
          getRowValue(row, ["CCT (Kelvin)", "CCT", "Kelvin", "color_temperature", "Color Temperature"])
        ),
        cri: parseIntNum(getRowValue(row, ["CRI", "Ra", "Color Rendering Index"])),
        beamAngle: String(getRowValue(row, ["Beam Angle", "Beam", "beam_angle"]) || "").trim(),
        ipRating: String(getRowValue(row, ["IP Rating", "IP", "ip_rating"]) || "IP65").trim(),
        inputVoltage: String(getRowValue(row, ["Input Voltage", "Voltage", "input_voltage"]) || "220-240V").trim(),
        dimensions: String(getRowValue(row, ["Dimensions", "Size", "dimensions"]) || "").trim(),
        otherDetails: String(getRowValue(row, ["Other Details", "Notes", "Special Details"]) || "").trim(),
        price,
        salePrice: parseNum(
          getRowValue(row, ["Sale Price (EGP)", "Sale Price", "Discount Price", "discount_price"])
        ),
        stock: parseIntNum(getRowValue(row, ["Stock", "Quantity", "stock_quantity", "Inventory"])) ?? 0,
        datasheetUrl: String(getRowValue(row, ["Datasheet URL", "Datasheet", "datasheet_url", "PDF"]) || "").trim(),
        variationActive: parseBool(getRowValue(row, ["Variation Active", "Variant Active"]), true),
      };

      if (!productGroups.has(prodKey)) {
        productGroups.set(prodKey, []);
      }
      productGroups.get(prodKey)!.push(parsed);
      totalValidRows++;
    });

    if (productGroups.size === 0) {
      return NextResponse.json(
        { success: false, error: "No valid product rows found in the uploaded file." },
        { status: 400 }
      );
    }

    let productsCreated = 0;
    let productsUpdated = 0;
    let subProductsCreated = 0;
    let subProductsUpdated = 0;

    // Process each product group
    for (const [productName, rows] of productGroups.entries()) {
      try {
        const firstRow = rows[0];

        // 1. Resolve Brand
        let resolvedBrand = fallbackBrand;
        if (firstRow.brandName) {
          const key = firstRow.brandName.toLowerCase().trim();
          if (brandMap.has(key)) {
            resolvedBrand = brandMap.get(key)!;
          } else {
            // Auto-create brand
            const brandSlug = firstRow.brandName
              .toLowerCase()
              .replace(/[^\w\s-]/g, "")
              .replace(/\s+/g, "-");

            resolvedBrand = await prisma.brand.create({
              data: {
                name: firstRow.brandName,
                slug: brandSlug,
                isOfficial: true,
              },
            });
            brandMap.set(key, resolvedBrand);
          }
        }

        // 2. Resolve Category
        let resolvedCategory = fallbackCategory;
        if (firstRow.categoryName) {
          const key = firstRow.categoryName.toLowerCase().trim();
          if (categoryMap.has(key)) {
            resolvedCategory = categoryMap.get(key)!;
          } else {
            // Auto-create category
            const catSlug = firstRow.categoryName
              .toLowerCase()
              .replace(/[^\w\s-]/g, "")
              .replace(/\s+/g, "-");

            resolvedCategory = await prisma.category.create({
              data: {
                name: firstRow.categoryName,
                slug: catSlug,
              },
            });
            categoryMap.set(key, resolvedCategory);
          }
        }

        // 3. Find or create parent product
        const slug = productName
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");

        let existingProduct = await prisma.product.findUnique({
          where: { slug },
          include: { images: true, subProducts: true },
        });

        if (!existingProduct) {
          existingProduct = await prisma.product.findFirst({
            where: { name: { equals: productName, mode: "insensitive" } },
            include: { images: true, subProducts: true },
          });
        }

        let productId: string;

        if (existingProduct) {
          productId = existingProduct.id;
          await prisma.product.update({
            where: { id: productId },
            data: {
              shortDesc: firstRow.shortDesc || existingProduct.shortDesc,
              description: firstRow.description || existingProduct.description,
              brandId: resolvedBrand.id,
              categoryId: resolvedCategory.id,
              featured: firstRow.featured,
              active: firstRow.productActive,
            },
          });
          productsUpdated++;

          // If new images provided that don't exist yet
          if (firstRow.images.length > 0) {
            const existingUrls = new Set(existingProduct.images.map((img) => img.url));
            const newImages = firstRow.images.filter((url) => !existingUrls.has(url));
            if (newImages.length > 0) {
              await prisma.productImage.createMany({
                data: newImages.map((url, orderIdx) => ({
                  productId,
                  url,
                  order: existingProduct.images.length + orderIdx,
                })),
              });
            }
          }
        } else {
          // Create new product
          const created = await prisma.product.create({
            data: {
              name: productName,
              slug,
              shortDesc: firstRow.shortDesc || null,
              description: firstRow.description,
              brandId: resolvedBrand.id,
              categoryId: resolvedCategory.id,
              featured: firstRow.featured,
              active: firstRow.productActive,
              createdById: user ? user.name : undefined,
              images: {
                create: firstRow.images.map((url, order) => ({
                  url,
                  order,
                })),
              },
            },
          });
          productId = created.id;
          productsCreated++;
        }

        // 4. Process each child variation row
        const seriesCode = productName
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 6);

        const brandCode =
          resolvedBrand.name
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 4) || "GL";

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const autoSku =
            row.sku ||
            `${brandCode}-${seriesCode}-${row.wattage || 0}W-${row.colorTemperature || 4000}K-${row.ipRating || "IP65"}-${i + 1}`;

          const existingSub = await prisma.subProduct.findUnique({
            where: { sku: autoSku },
          });

          if (existingSub) {
            await prisma.subProduct.update({
              where: { sku: autoSku },
              data: {
                productId,
                modelNumber: row.modelNumber || existingSub.modelNumber,
                price: row.price,
                discountPrice: row.salePrice,
                stockQuantity: row.stock,
                wattage: row.wattage,
                luminousFlux: row.luminousFlux,
                colorTemperature: row.colorTemperature,
                cri: row.cri,
                beamAngle: row.beamAngle || existingSub.beamAngle,
                ipRating: row.ipRating || existingSub.ipRating,
                inputVoltage: row.inputVoltage || existingSub.inputVoltage,
                dimensions: row.dimensions || existingSub.dimensions,
                otherDetails: row.otherDetails || existingSub.otherDetails,
                datasheetUrl: row.datasheetUrl || existingSub.datasheetUrl,
                active: row.variationActive,
              },
            });
            subProductsUpdated++;
          } else {
            await prisma.subProduct.create({
              data: {
                productId,
                sku: autoSku,
                modelNumber: row.modelNumber || null,
                price: row.price,
                discountPrice: row.salePrice,
                stockQuantity: row.stock,
                wattage: row.wattage,
                luminousFlux: row.luminousFlux,
                colorTemperature: row.colorTemperature,
                cri: row.cri,
                beamAngle: row.beamAngle || null,
                ipRating: row.ipRating || "IP65",
                inputVoltage: row.inputVoltage || "220-240V",
                dimensions: row.dimensions || null,
                otherDetails: row.otherDetails || null,
                datasheetUrl: row.datasheetUrl || null,
                active: row.variationActive,
                createdById: user ? user.name : null,
              },
            });
            subProductsCreated++;
          }
        }
      } catch (err: any) {
        errors.push(`Error processing product "${productName}": ${err.message || String(err)}`);
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalRows: totalValidRows,
        productsCreated,
        productsUpdated,
        subProductsCreated,
        subProductsUpdated,
      },
      warnings,
      errors,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
