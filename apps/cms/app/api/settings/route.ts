import { NextRequest, NextResponse } from "next/server";
import { getSystemSettings, updateSystemSettings } from "@genie-light/queries";
import { handleApiError } from "@/lib/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { codShippingFee, factionCodeFee } = body;

    const updated = await updateSystemSettings({
      codShippingFee: codShippingFee !== undefined ? parseFloat(codShippingFee) : undefined,
      factionCodeFee: factionCodeFee !== undefined ? parseFloat(factionCodeFee) : undefined,
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
