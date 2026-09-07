import { NextRequest, NextResponse } from "next/server";
import { getAllOrders } from "@genie-light/queries";
import { prisma, OrderStatus, PaymentMethod } from "@genie-light/database";
import { getAdminDataLocal } from "@/lib/auth-server";
import { handleApiError } from "@/lib/error-handler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAdminDataLocal();
    if (user && user.role === "DATA_ENTRY") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Data Entry specialists cannot access customer orders." },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") as OrderStatus) || undefined;
    const userId = searchParams.get("userId") || undefined;
    const search = searchParams.get("search") || undefined;

    const orders = await getAllOrders({ status, userId, search });
    return NextResponse.json(orders);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAdminDataLocal();
    if (user && user.role === "DATA_ENTRY") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Data Entry specialists cannot create or modify customer orders." },
        { status: 403 }
      );
    }
    const body = await request.json();
    const {
      userId,
      addressId,
      items,
      paymentMethod = "COD",
      deliveryFee = 60,
      notes,
    } = body;

    if (!userId || !addressId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required order fields (userId, addressId, items)" },
        { status: 400 }
      );
    }

    const subProductIds = items.map((i: any) => i.subProductId);
    const dbSubProducts = await prisma.subProduct.findMany({
      where: { id: { in: subProductIds } },
      include: { product: true },
    });
    const subProductsMap = new Map(dbSubProducts.map((sp) => [sp.id, sp]));

    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const sp = subProductsMap.get(item.subProductId);
      if (!sp) {
        return NextResponse.json(
          { success: false, error: `SubProduct ID ${item.subProductId} not found` },
          { status: 400 }
        );
      }
      const qty = parseInt(item.quantity, 10) || 1;
      const unitPrice = Number(sp.discountPrice ?? sp.price);
      const totalPrice = unitPrice * qty;
      subtotal += totalPrice;

      const specsSummary = [
        sp.wattage ? `${sp.wattage}W` : null,
        sp.colorTemperature ? `${sp.colorTemperature}K` : null,
        sp.luminousFlux ? `${sp.luminousFlux}lm` : null,
        sp.ipRating,
      ]
        .filter(Boolean)
        .join(" | ");

      orderItemsData.push({
        subProductId: sp.id,
        sku: sp.sku,
        productName: sp.product.name,
        specsSummary: specsSummary || sp.sku,
        unitPrice,
        quantity: qty,
        totalPrice,
      });
    }

    const orderNumber = `GL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = subtotal + Number(deliveryFee);

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId,
          status: OrderStatus.PENDING,
          paymentMethod: (paymentMethod as PaymentMethod) || PaymentMethod.COD,
          subtotal,
          deliveryFee: Number(deliveryFee),
          total,
          notes: notes || null,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Decrement stock
      for (const item of orderItemsData) {
        await tx.subProduct.update({
          where: { id: item.subProductId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return createdOrder;
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
