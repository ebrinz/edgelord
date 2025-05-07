"use client";

// Dashboard session protection logic added below

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/createClient';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/dashboard/overview');
      } else {
        setChecking(false);
      }
    };
    checkSession();
  }, [router, supabase.auth]);

  if (checking) return null;

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
