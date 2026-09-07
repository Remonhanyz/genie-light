import { NextRequest, NextResponse } from "next/server";
import { uploadToStorage, deleteFromStorage } from "@/lib/storage";
import { handleApiError } from "@/lib/error-handler";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit per image

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "No files provided for upload." }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (typeof file === "string" || !file.name) continue;

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `File '${file.name}' exceeds maximum allowed size of 5MB.` },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `File '${file.name}' has an unsupported format (${file.type}).` },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const url = await uploadToStorage(buffer, file.name, file.type);
      uploadedUrls.push(url);
    }

    return NextResponse.json({ success: true, urls: uploadedUrls }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ success: false, error: "Image URL is required for deletion." }, { status: 400 });
    }

    await deleteFromStorage(url);
    return NextResponse.json({ success: true, message: "Image deleted successfully from storage." });
  } catch (error) {
    return handleApiError(error);
  }
}

