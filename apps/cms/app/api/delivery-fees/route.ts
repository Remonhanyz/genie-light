import { NextRequest, NextResponse } from "next/server";
import { getAllDeliveryZones, upsertDeliveryZone } from "@genie-light/queries";
import { getAdminDataLocal } from "@/lib/auth-server";
import { handleApiError } from "@/lib/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAdminDataLocal();
    if (user && user.role === "DATA_ENTRY") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Data Entry specialists cannot view or configure shipping fees." },
        { status: 403 }
      );
    }
    const zones = await getAllDeliveryZones();
    return NextResponse.json(zones);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAdminDataLocal();
    if (!user || user.role === "DATA_ENTRY") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Data Entry specialists cannot modify delivery fees." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { governorate, deliveryFee, estimatedDays, active } = body;

    if (!governorate || deliveryFee === undefined || !estimatedDays) {
      return NextResponse.json(
        { success: false, error: "Governorate, delivery fee, and estimated days are required." },
        { status: 400 }
      );
    }

    const zone = await upsertDeliveryZone({
      governorate,
      deliveryFee: parseFloat(deliveryFee),
      estimatedDays,
      active,
    });

    return NextResponse.json({ success: true, zone });
  } catch (error) {
    return handleApiError(error);
  }
}
