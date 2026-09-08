"use server";

/**
 * Server action: sign in via the REST API auth route.
 * Returns an error string on failure, or undefined on success (redirects client-side).
 */
export async function signIn(data: {
  email: string;
  password: string;
}): Promise<string | undefined> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3001");

    const res = await fetch(`${baseUrl}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Login failed" }));
      return body?.error ?? "Invalid credentials";
    }

    return undefined;
  } catch {
    return "Network error. Please try again.";
  }
}
