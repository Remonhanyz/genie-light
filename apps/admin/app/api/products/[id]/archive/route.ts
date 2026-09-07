import { NextRequest, NextResponse } from "next/server";
import { archiveProduct, getProductById } from "@genie-light/queries";
import { handleApiError } from "@/lib/error-handler";

type Params = { id: string };

export async function POST(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const isArchived = body.isArchived !== undefined ? Boolean(body.isArchived) : true;

    const existing = await getProductById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const product = await archiveProduct(id, isArchived);
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return handleApiError(error);
  }
}
