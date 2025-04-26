import type { Metadata } from "next";
import "./globals.css";

// Import components
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";


export const metadata: Metadata = {
  title: "Technolabe",
  description: "A modern platform for developers to share code and collaborate",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/hack-font@3/build/web/hack.css"
        />
      </head>
      <body className="flex flex-col h-screen">
        <AuthProvider>
          <ThemeProvider>
            <Header />
            <main className="relative z-0 pt-[var(--layout-header-height-mobile)] md:pt-[var(--layout-header-height-desktop)] md:pl-0 flex-grow h-[calc(100vh-var(--layout-header-height-mobile))] md:h-[calc(100vh-var(--layout-header-height-desktop))]">
              {children}
            </main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
