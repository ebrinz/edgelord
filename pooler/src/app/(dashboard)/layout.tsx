"use client";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[calc(100vh-var(--layout-header-height-mobile))] md:h-[calc(100vh-var(--layout-header-height-desktop))] flex flex-col md:flex-row bg-bg">

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="md:pt-[var(--layout-content-padding)] px-[var(--layout-content-padding)]">
          {children}
        </div>
      </div>
    </div>
  );
}
