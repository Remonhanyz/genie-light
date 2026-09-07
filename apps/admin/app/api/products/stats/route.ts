import { NextResponse } from "next/server";
import { prisma } from "@genie-light/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalProducts, totalSubProducts] = await Promise.all([
      prisma.product.count(),
      prisma.subProduct.count(),
    ]);

    return NextResponse.json({
      totalProducts,
      totalSubProducts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch catalog statistics", totalProducts: 0, totalSubProducts: 0 },
      { status: 500 }
    );
  }
}
