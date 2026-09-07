import { NextRequest, NextResponse } from "next/server";
import { prisma, Role } from "@genie-light/database";
import * as crypto from "crypto";
import { signJWT, COOKIE_NAME } from "@/lib/auth";
import { handleApiError } from "@/lib/error-handler";

export const dynamic = "force-dynamic";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// GET: Check if admin exists (needs setup check) or return authenticated user profile
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const { verifyJWT } = await import("@/lib/auth");
      const decoded = await verifyJWT(token);
      if (decoded) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { name: true, email: true, role: true },
        });
        if (user) {
          return NextResponse.json({
            user: { name: user.name, email: user.email, role: user.role },
          });
        }
      }
    }

    const adminCount = await prisma.user.count({
      where: { role: Role.ADMIN },
    });
    return NextResponse.json({ needsSetup: adminCount === 0 });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Bootstrapping (Create First Admin)
export async function POST(request: NextRequest) {
  try {
    const adminCount = await prisma.user.count({
      where: { role: Role.ADMIN },
    });

    if (adminCount > 0) {
      return NextResponse.json(
        { success: false, error: "Setup mode is disabled. Admins already exist." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, email, password, phone } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: username || "Genie Admin",
        email,
        phone: phone || null,
        passwordHash,
        role: Role.ADMIN,
      },
    });

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({ success: true, user });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT: Admin & Data Entry Sign In
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || (user.role !== Role.ADMIN && user.role !== Role.DATA_ENTRY)) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials or unauthorized." },
        { status: 401 }
      );
    }

    const inputHash = hashPassword(password);
    if (user.passwordHash !== inputHash) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE: Sign Out
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
