"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Create a context to store the active path state
const ActivePathContext = createContext<string | null>(null);

// Provider component to wrap around the entire dashboard layout
export function ActivePathProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState<string | null>(null);

  useEffect(() => {
    // Update the active path when pathname changes
    setActivePath(pathname);
    console.log("ActivePathProvider pathname:", pathname);
  }, [pathname]);

  return (
    <ActivePathContext.Provider value={activePath}>
      {children}
    </ActivePathContext.Provider>
  );
}

// Hook to consume the active path value
export function useActivePath() {
  const context = useContext(ActivePathContext);
  return context;
}
