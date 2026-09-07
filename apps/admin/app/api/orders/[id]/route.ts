import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderDetails } from "@genie-light/queries";
import { getAdminDataLocal } from "@/lib/auth-server";
import { handleApiError } from "@/lib/error-handler";

type Params = { id: string };

export async function GET(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const user = await getAdminDataLocal();
    if (user && user.role === "DATA_ENTRY") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Data Entry specialists cannot access customer orders." },
        { status: 403 }
      );
    }
    const { id } = await context.params;
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const user = await getAdminDataLocal();
    if (user && user.role === "DATA_ENTRY") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Data Entry specialists cannot modify customer orders." },
        { status: 403 }
      );
    }
    const { id } = await context.params;
    const body = await request.json();
    const { status, address } = body;

    const updateData: any = {};
    if (status) {
      if (!["PENDING", "SHIPPING", "DELIVERED"].includes(status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status value provided" },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (address !== undefined) {
      updateData.address = address;
    }

    const order = await updateOrderDetails(id, updateData);
    return NextResponse.json({ success: true, order });
  } catch (error) {
    return handleApiError(error);
  }
}
