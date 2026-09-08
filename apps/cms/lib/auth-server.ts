import { cookies } from "next/headers";
import { prisma } from "@genie-light/database";
import { verifyJWT, COOKIE_NAME } from "./auth";

export async function getAdminDataLocal() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const decoded = await verifyJWT(token);
  if (!decoded) return null;
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { name: true, email: true, role: true },
  });
  if (!user) return null;
  return { name: user.name, email: user.email, role: user.role, picture: null };
}
