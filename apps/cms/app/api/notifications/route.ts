import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@genie-light/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const [orders, lowStockSubProducts] = await Promise.all([
      // Fetch only the 40 most recent orders
      prisma.order.findMany({
        take: 40,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          paymentMethod: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),

      // Fetch child variants with stockQuantity <= 5
      prisma.subProduct.findMany({
        where: {
          stockQuantity: {
            lte: 5,
          },
          active: true,
        },
        take: 40,
        orderBy: {
          stockQuantity: "asc",
        },
        select: {
          id: true,
          sku: true,
          modelNumber: true,
          stockQuantity: true,
          product: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Map low stock sub-products to format expected by UI
    const mappedLowStock = lowStockSubProducts.map((sp) => ({
      id: sp.id,
      name: `${sp.product.name} (${sp.sku})`,
      inventory: sp.stockQuantity,
      category: sp.product.category,
    }));

    // Map orders to format expected by UI
    const mappedOrders = orders.map((o) => ({
      id: o.id,
      status: o.status,
      totalAmount: Number(o.total),
      paymentType: o.paymentMethod,
      createdAt: o.createdAt,
      user: {
        username: o.user.name,
      },
    }));

    return NextResponse.json({
      success: true,
      orders: mappedOrders,
      lowStockProducts: mappedLowStock,
    });
  } catch (error: any) {
    console.error("Notifications API error:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        orders: [],
        lowStockProducts: [],
        error: "Failed to fetch notifications",
      },
      { status: 500 }
    );
  }
}
