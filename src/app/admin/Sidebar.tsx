"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, ShoppingBag, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Users", href: "/admin/users", icon: <Users size={20} /> },
    { name: "Orders", href: "/admin/orders", icon: <ShoppingBag size={20} /> },
    
  ];

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  if (pathname === "/admin/login") {
    return null;
  }

  return (
    <aside className="w-64 bg-slate-900 min-h-screen text-slate-300 flex-col fixed left-0 top-0 hidden md:flex z-50">
      <div className="p-6">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
          {/* <div className="w-8 h-8 bg-[#249cff] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <LayoutDashboard size={18} />
          </div> */}
          Admin Panel
        </h2>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                isActive 
                  ? "bg-[#249cff] text-white shadow-md shadow-blue-500/10" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 font-bold hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
