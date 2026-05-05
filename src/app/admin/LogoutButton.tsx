"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-2 p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-bold text-sm"
    >
      <LogOut size={18} />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}
