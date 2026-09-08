import { NextRequest, NextResponse } from "next/server";
import { uploadFile, STORAGE_BUCKETS } from "@genie-light/storage";
import { prisma } from "@genie-light/database";
import { handleApiError } from "@/lib/error-handler";
import * as path from "path";
import * as fs from "fs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const subProductId = (formData.get("subProductId") as string) || null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Only PDF technical datasheets (.pdf) are supported" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedName = file.name.replace(/[^\w.-]/g, "_");
    const uniqueKey = `datasheet_${Date.now()}_${sanitizedName}`;

    let datasheetUrl = "";

    try {
      // Try uploading to MinIO S3 bucket
      datasheetUrl = await uploadFile(
        STORAGE_BUCKETS.DATASHEETS,
        uniqueKey,
        buffer,
        "application/pdf"
      );
    } catch (s3Error) {
      console.warn("MinIO S3 upload fallback to local storage:", s3Error);
      // Local fallback for local development without active MinIO container
      const uploadsDir = path.join(process.cwd(), "public", "datasheets");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localFilePath = path.join(uploadsDir, uniqueKey);
      fs.writeFileSync(localFilePath, buffer);
      datasheetUrl = `/datasheets/${uniqueKey}`;
    }

    // If subProductId provided, bind datasheet URL to variant
    if (subProductId) {
      await prisma.subProduct.update({
        where: { id: subProductId },
        data: { datasheetUrl },
      });
    }

    return NextResponse.json({
      success: true,
      datasheetUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
