"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClientComponentClient();

    // Get initial session
    supabase.auth.getSession();

    // Listen for auth state changes (login, logout, refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // No-op
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Optionally, provide user context here for children
  return <>{children}</>;
}
