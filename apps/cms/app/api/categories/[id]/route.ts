import { NextRequest, NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@genie-light/queries";
import { handleApiError } from "@/lib/error-handler";

type Params = { id: string };

export async function PUT(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, image } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Category name is required." },
        { status: 400 }
      );
    }

    const category = await updateCategory(id, name.trim(), image);
    return NextResponse.json({ success: true, category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
