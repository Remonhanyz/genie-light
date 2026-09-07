import { NextRequest, NextResponse } from "next/server";
import { getAllBrands, createBrand } from "@genie-light/queries";
import { handleApiError } from "@/lib/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const brands = await getAllBrands();
    return NextResponse.json(brands);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, logoUrl, description, isOfficial } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Brand name is required." },
        { status: 400 }
      );
    }

    const brand = await createBrand({
      name: name.trim(),
      logoUrl,
      description,
      isOfficial: isOfficial ?? true,
    });

    return NextResponse.json({ success: true, brand }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
