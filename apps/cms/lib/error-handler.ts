import { NextResponse } from "next/server";

export enum ErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  CONFLICT_ERROR = "CONFLICT_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
}

export class AppError extends Error {
  constructor(
    public override message: string,
    public type: ErrorType = ErrorType.SERVER_ERROR,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function handleApiError(error: unknown) {
  console.error("[Dashboard API Error]:", error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        type: error.type,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as any).code;
    const meta = (error as any).meta;

    if (code === "P2002") {
      const field = meta?.target?.[0] || "field";
      return NextResponse.json(
        {
          success: false,
          error: `A record with this ${field} already exists.`,
          type: ErrorType.CONFLICT_ERROR,
        },
        { status: 409 }
      );
    }

    if (code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          error: "Record not found.",
          type: ErrorType.NOT_FOUND_ERROR,
        },
        { status: 404 }
      );
    }

    if (code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete this record because it is linked to existing customer orders or faction codes. Archive it instead or use Hard Delete.",
          type: ErrorType.CONFLICT_ERROR,
        },
        { status: 409 }
      );
    }
  }

  // Generic fallback error
  const message = error instanceof Error ? error.message : "An unexpected server error occurred";
  return NextResponse.json(
    {
      success: false,
      error: message,
      type: ErrorType.SERVER_ERROR,
    },
    { status: 500 }
  );
}
