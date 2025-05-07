import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "./createServerClient";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerSupabaseClient({
    get: (key: string) => request.cookies.get(key)?.value,
    set: (key: string, value: string, options?: Record<string, unknown>) => {
      response.cookies.set(key, value, options);
    },
  });
  // Always revalidate the user on the server
  await supabase.auth.getUser();
  return response;
}
