"use client";
import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import ProfileCard from "@/components/ProfileCard";
import type { User } from "@supabase/supabase-js";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClientComponentClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ textAlign: "center", marginTop: 48 }}>Loading profile...</div>;
  if (!user) return <div style={{ textAlign: "center", marginTop: 48 }}>No user found.</div>;

  return <ProfileCard user={user} />;
};

export default ProfilePage;
