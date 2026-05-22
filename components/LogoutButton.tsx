"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/") },
    });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
