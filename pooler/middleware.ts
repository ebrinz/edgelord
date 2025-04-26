import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => {
          return req.cookies.get(name)?.value;
        },
        set: (name, value, options) => {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove: (name, options) => {
          res.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        },
      },
    },
  );

  try {
    // Always revalidate the user session with Supabase Auth
    const { data } = await supabase.auth.getUser();

    // --- Session length controls ---
    // Supabase session/token expiration is controlled from the Supabase project dashboard:
    // Go to Authentication > Policies > JWT Expiry (in seconds)
    // This determines how long a user stays logged in before needing to re-authenticate.
    // You can also set refresh token rotation and lifetime in the Supabase dashboard for even tighter control.

    // Protected routes that require authentication
    // Add more paths here as your app grows
    const protectedRoutes = [
      "/repositories",
      "/profile",
      "/files", // Example: protect files
      "/settings", // Example: protect settings
      // '/admin', // Example: protect admin area (see role logic below)
    ];
    const isProtectedRoute = protectedRoutes.some((route) =>
      req.nextUrl.pathname.startsWith(route),
    );

    if (isProtectedRoute) {
      if (!data.user) {
        console.log("No user found for protected route:", req.nextUrl.pathname);
        const redirectUrl = new URL("/login", req.url);
        redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // --- Role-based logic stub ---
    // You can implement role-based redirects or logic here in the future
    // For example, restrict /admin to only users with 'admin' role:
    // if (req.nextUrl.pathname.startsWith('/admin')) {
    //   if (!data.user || !data.user.user_metadata?.role || data.user.user_metadata.role !== 'admin') {
    //     return NextResponse.redirect(new URL('/not-authorized', req.url));
    //   }
    // }

    // Handle auth routes and root path - prevent authenticated users from accessing login/signup
    // Also redirect authenticated users from root path directly to repositories
    const redirectRoutes = ["/login", "/signup", "/"];
    const isRedirectRoute = redirectRoutes.some(
      (route) => req.nextUrl.pathname === route,
    );

    if (isRedirectRoute && data.user) {
      return NextResponse.redirect(new URL("/repositories", req.url));
    }
  } catch (err) {
    console.error("Middleware error:", err);
    // Don't try to modify the response on error
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public directory
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
