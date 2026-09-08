import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, createCategory } from "@genie-light/queries";
import { handleApiError } from "@/lib/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, image } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Category name is required." },
        { status: 400 }
      );
    }

    const category = await createCategory(name.trim(), image);
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
