import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePathSegments = resolvedParams.path || [];
    if (filePathSegments.length === 0) {
      return NextResponse.json({ error: "File path required" }, { status: 400 });
    }

    const relativePath = filePathSegments.join("/");
    const ext = path.extname(relativePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const cwd = process.cwd();
    const candidatePaths = [
      // When cwd is apps/cms
      path.resolve(cwd, "..", "web", "public", "assets", relativePath),
      path.resolve(cwd, "public", "assets", relativePath),
      // When cwd is project root
      path.resolve(cwd, "apps", "web", "public", "assets", relativePath),
      path.resolve(cwd, "apps", "cms", "public", "assets", relativePath),
      path.resolve(cwd, "public", "assets", relativePath),
    ];

    for (const fullPath of candidatePaths) {
      try {
        const fileBuffer = await fs.readFile(fullPath);
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch {
        // Continue checking next candidate path
      }
    }

    return NextResponse.json({ error: "Asset file not found" }, { status: 404 });
  } catch (error) {
    console.error("[Assets API Error]:", error);
    return NextResponse.json({ error: "Internal server error reading asset" }, { status: 500 });
  }
}
