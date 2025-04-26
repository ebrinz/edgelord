import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createServerComponentClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name) => {
        const cookie = cookieStore.get(name);
        return cookie?.value;
      },
      set: (name, value, options) => {
        try {
          cookieStore.set({
            name,
            value,
            ...options,
            // Ensure secure and SameSite settings for auth cookies
            ...(name.includes("auth")
              ? {
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "lax",
                  path: "/",
                }
              : {}),
          });
        } catch (error) {
          console.error(`Failed to set cookie ${name}:`, error);
        }
      },
      remove: (name, options) => {
        try {
          cookieStore.delete({
            name,
            ...options,
            // Ensure path is set for deletion
            path: "/",
          });
        } catch (error) {
          console.error(`Failed to remove cookie ${name}:`, error);
        }
      },
    },
  });
};
