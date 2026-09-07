import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || process.env.PAYLOAD_SECRET || "genie-light-super-secret-key-32-chars-long"
);

const COOKIE_NAME = "genie-light-admin-token";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export { COOKIE_NAME };
