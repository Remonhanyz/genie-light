import { NextRequest, NextResponse } from "next/server";
import { getAllCaseStudies, createCaseStudy } from "@genie-light/queries";
import { handleApiError } from "@/lib/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await getAllCaseStudies();
    return NextResponse.json(projects);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      client,
      sector,
      location,
      summary,
      challenges,
      solutions,
      standards,
      featured,
      images,
    } = body;

    if (!title || !client || !sector || !location || !challenges || !solutions) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields (title, client, sector, location, challenges, solutions).",
        },
        { status: 400 }
      );
    }

    const project = await createCaseStudy({
      title,
      client,
      sector,
      location,
      summary: summary || title,
      challenges,
      solutions,
      standards,
      featured,
      images,
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
