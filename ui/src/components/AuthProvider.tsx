"use client";

import { useEffect, useState } from "react";
// import { useRouter } from 'next/navigation'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Function to refresh session
    const refreshSession = async () => {
      try {
        // Use the server-side refresh endpoint that handles cookies properly
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for cookies
          body: JSON.stringify({}), // Always send a valid JSON body
        });
        if (res.status === 401) {
          // Not authenticated: clear user state, redirect to login, etc.
          setUser(null);
          // Optionally, redirect to login or landing page
          // window.location.href = "/login";
          return;
        }
        if (!res.ok) {
          // Handle other errors if needed
          return;
        }
      } catch (error) {
        console.error("Error refreshing session:", error);
      }
    };

    // Refresh the session when the component mounts
    refreshSession();

    // Set up an interval to refresh the session periodically
    const intervalId = setInterval(refreshSession, 10 * 60 * 1000); // Every 10 minutes

    return () => clearInterval(intervalId);
  }, []);

  // TEMP: Use user state to suppress unused var lint error
  // In the future, use this state to provide auth context or conditional UI
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const userIsLoggedIn = !!user;

  return <>{children}</>;
}
