import { NextRequest, NextResponse } from "next/server";
import { updateUserAdmin, deleteUserAdmin, forceDeleteUserAdmin } from "@genie-light/queries";
import { handleApiError } from "@/lib/error-handler";

type Params = { id: string };

export async function PUT(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { role, username, name, email, phone, company } = body;

    const user = await updateUserAdmin(id, {
      role,
      name: name || username,
      email,
      phone,
      company,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const isForce = searchParams.get("force") === "true";

    if (isForce) {
      await forceDeleteUserAdmin(id);
    } else {
      await deleteUserAdmin(id);
    }

    return NextResponse.json({ success: true, force: isForce });
  } catch (error) {
    return handleApiError(error);
  }
}
