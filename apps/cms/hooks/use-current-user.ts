"use client";

import { useEffect, useState } from "react";

export interface CurrentUser {
  name: string;
  email: string;
  role: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth");
        if (res.ok) {
          const data = await res.json();
          if (data.user && isMounted) {
            setUser(data.user);
          }
        }
      } catch {
        // user unauthenticated or network failure
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    user,
    role: user?.role,
    isDataEntry: user?.role === "DATA_ENTRY",
    isAdmin: user?.role === "ADMIN",
    loading,
  };
}
