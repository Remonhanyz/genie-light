import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@genie-light/database";
import { handleApiError } from "@/lib/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [subProductsWithDatasheet, missingDatasheetsCount] = await Promise.all([
      prisma.subProduct.findMany({
        where: {
          datasheetUrl: { not: null },
          active: true,
        },
        include: {
          product: {
            include: { brand: true, category: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.subProduct.count({
        where: {
          datasheetUrl: null,
          active: true,
        },
      }),
    ]);

    return NextResponse.json({
      datasheets: subProductsWithDatasheet,
      totalLinked: subProductsWithDatasheet.length,
      missingDatasheetsCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
