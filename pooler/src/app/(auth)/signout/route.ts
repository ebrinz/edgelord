import { createServerComponentClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerComponentClient();

    await supabase.auth.signOut();

    // Use origin from request instead of environment variable
    const url = new URL("/", request.url);

    return NextResponse.redirect(url, {
      status: 302,
    });
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}
