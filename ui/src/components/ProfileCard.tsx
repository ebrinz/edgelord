import React from "react";
import type { User } from "@supabase/supabase-js";
import { useTheme } from "@/components/ThemeProvider";

interface ProfileCardProps {
  user: User;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const bg = isDark ? "#18181b" : "#fff";
  const border = isDark ? "1.5px solid #333" : "1.5px solid #e5e7eb";
  const color = isDark ? "#f3f3f3" : "#18181b";
  const subColor = isDark ? "#a1a1aa" : "#666";

  return (
    <div
      style={{
        width: "100%",
        margin: "2rem 0",
        padding: "2.5rem 1.5rem",
        borderRadius: 20,
        border,
        background: bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box",
        boxShadow: isDark
          ? "0 2px 16px rgba(0,0,0,0.28)"
          : "0 2px 16px rgba(0,0,0,0.08)",
        color,
        transition: "background 0.2s, color 0.2s, border 0.2s"
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: isDark ? "#27272a" : "#f3f3f3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          marginBottom: 20,
          color: isDark ? "#f3f3f3" : "#18181b"
        }}
      >
        {user.email?.[0]?.toUpperCase() || "U"}
      </div>
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>{user.user_metadata?.full_name || user.email}</h2>
      <p style={{ color: subColor, margin: "10px 0 0 0", fontSize: 18 }}>{user.email}</p>
      {user.user_metadata?.avatar_url && (
        <img
          src={user.user_metadata.avatar_url}
          alt="Avatar"
          style={{ width: 72, height: 72, borderRadius: "50%", marginTop: 20, border: isDark ? "2px solid #333" : "2px solid #e5e7eb" }}
        />
      )}
    </div>
  );
};

export default ProfileCard;
