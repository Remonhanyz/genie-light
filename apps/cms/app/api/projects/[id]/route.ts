import { NextRequest, NextResponse } from "next/server";
import { getCaseStudyById, updateCaseStudy, deleteCaseStudy } from "@genie-light/queries";
import { handleApiError } from "@/lib/error-handler";

type Params = { id: string };

export async function GET(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    const project = await getCaseStudyById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: "Case study not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const project = await updateCaseStudy(id, body);
    return NextResponse.json({ success: true, project });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    await deleteCaseStudy(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
