import { NextRequest, NextResponse } from "next/server";
import { updateDeliveryFee } from "@genie-light/queries";
import { getAdminDataLocal } from "@/lib/auth-server";
import { handleApiError } from "@/lib/error-handler";

type Params = { id: string };

export async function PUT(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const user = await getAdminDataLocal();
    if (!user || user.role === "DATA_ENTRY") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Data Entry specialists cannot modify delivery fees." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { deliveryFee, estimatedDays, active } = body;

    const zone = await updateDeliveryFee(
      id,
      parseFloat(deliveryFee),
      estimatedDays,
      active
    );

    return NextResponse.json({ success: true, zone });
  } catch (error) {
    return handleApiError(error);
  }
}
