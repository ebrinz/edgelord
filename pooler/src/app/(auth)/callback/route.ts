import { createServerComponentClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  // If there's an error during the OAuth process
  if (error) {
    console.error("Auth error:", error, error_description);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error_description || error)}`,
        request.url,
      ),
    );
  }

  // If we have a code, exchange it for a session
  if (code) {
    try {
      const supabase = await createServerComponentClient();

      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Session exchange error:", error.message);
        return NextResponse.redirect(
          new URL(
            `/login?error=${encodeURIComponent(error.message)}`,
            request.url,
          ),
        );
      }

      // Verify that we have a session
      if (!data?.session) {
        console.error("No session data returned from exchangeCodeForSession");
        return NextResponse.redirect(
          new URL("/login?error=Authentication+failed", request.url),
        );
      }

      // Verify session by checking if we can access it
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        console.error(
          "Failed to verify session after exchange:",
          sessionError?.message,
        );
        return NextResponse.redirect(
          new URL("/login?error=Session+verification+failed", request.url),
        );
      }

      // Success! Redirect to repositories with a response that includes the cookies
      const response = NextResponse.redirect(
        new URL("/repositories", request.url),
      );

      // Success! Redirect to repositories
      return response;
    } catch (err) {
      console.error("Unexpected error during auth callback:", err);
      return NextResponse.redirect(
        new URL("/login?error=An+unexpected+error+occurred", request.url),
      );
    }
  }

  // If no code or error, this is an unexpected state
  return NextResponse.redirect(new URL("/login", request.url));
}
