"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <div className={cn("min-h-screen", !isLoginPage && "md:pl-64")}>
      {children}
    </div>
  );
}
