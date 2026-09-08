import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "@genie-light/queries";
import { getAdminDataLocal } from "@/lib/auth-server";
import { handleApiError } from "@/lib/error-handler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAdminDataLocal();
    if (user && user.role === "DATA_ENTRY") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Data Entry specialists cannot access user accounts." },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || undefined;
    const search = searchParams.get("search") || undefined;

    const users = await getAllUsers({ role, search });
    return NextResponse.json(users);
  } catch (error) {
    return handleApiError(error);
  }
}
