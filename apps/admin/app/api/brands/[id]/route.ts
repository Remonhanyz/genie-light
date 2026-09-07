import { NextRequest, NextResponse } from "next/server";
import { getBrandById, updateBrand, deleteBrand } from "@genie-light/queries";
import { handleApiError } from "@/lib/error-handler";

type Params = { id: string };

export async function GET(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    const brand = await getBrandById(id);
    if (!brand) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }
    return NextResponse.json(brand);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, logoUrl, description, isOfficial } = body;

    const brand = await updateBrand(id, {
      name,
      logoUrl,
      description,
      isOfficial,
    });

    return NextResponse.json({ success: true, brand });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    await deleteBrand(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
