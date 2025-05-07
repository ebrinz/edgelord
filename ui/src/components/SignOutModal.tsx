"use client";

import { useState } from "react";

type SignOutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SignOutModal({ isOpen, onClose }: SignOutModalProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      // Submit the form programmatically
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/signout";
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Error signing out:", error);
      setIsSigningOut(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-lg shadow-lg w-full max-w-md relative panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-text mb-4 text-glow">
            Sign Out
          </h2>

          <div className="mb-6">
            <p className="text-text-secondary mb-2">
              {"Are you sure you want to sign out?"}
            </p>
            <p className="text-text-muted text-sm">
              You&apos;ll need to sign in again to access your repositories and
              settings.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded text-text-secondary hover:bg-surface-hover hover:border-border-hover transition-all duration-200"
              disabled={isSigningOut}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 bg-transparent border border-primary text-primary rounded hover:bg-primary hover:text-surface hover:shadow-[0_0_5px_rgba(0,178,204,0.5)] transition-all duration-200"
              disabled={isSigningOut}
            >
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
