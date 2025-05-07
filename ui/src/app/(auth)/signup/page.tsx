"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/createClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  // [password state removed for waiting list flow]
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          // If session exists, redirect to repositories
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkSession();

    // Handle click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        router.push("/dashboard");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [router, supabase.auth]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Prevent duplicate emails: check if email already exists
      const { data: existing, error: selectError } = await supabase
        .from("waiting_list")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (selectError) throw selectError;
      if (existing) {
        setError("This email is already on the waiting list.");
        setLoading(false);
        return;
      }

      // Insert new email
      const { error } = await supabase.from("waiting_list").insert([{ email }]);

      if (error) {
        throw error;
      }

      // Analytics: log to console, or send to analytics service here
      // e.g., window.gtag?.('event', 'waiting_list_signup', { email });
      // (Replace with your analytics platform as needed)
      console.log("Waiting list signup:", email);

      setSuccess("You have been added to the waiting list!");
      setEmail("");
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div
        ref={formRef}
        className="max-w-md w-full space-y-8 panel p-8 rounded-lg shadow-lg"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-text text-glow-strong">
            Waiting list for Pooler
          </h2>
        </div>
        {/* Success page: Only show success message and button if signup succeeded */}
        {success ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="bg-success/10 border border-success text-success px-4 py-3 rounded w-full text-center">
              {success}
            </div>
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={() => router.push("/dashboard")}
            >
              Return to Home
            </button>
          </div>
        ) : (
          <>
            {/* Error message */}
            {error && (
              <div className="bg-accent/10 border border-accent text-accent px-4 py-3 rounded">
                {error}
              </div>
            )}
            <form className="mt-8 space-y-6" onSubmit={handleSignup}>
              <div className="space-y-4 rounded-md">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-text-secondary mb-1"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input w-full"
                    placeholder="Email address"
                  />
                </div>
                {/* [password input removed for waiting list flow] */}
              </div>
              <div>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? "Signing up..." : "Sign up"}
                </button>
              </div>
            </form>
            <div className="mt-4 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
