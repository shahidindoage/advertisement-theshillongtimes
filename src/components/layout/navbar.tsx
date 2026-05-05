"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Newspaper, LogOut, User as UserIcon, Menu, X, ShoppingBag, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="Logo"
                width={200}
                className="h-10 w-auto sm:h-12 object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {session ? (
              <>
                {(session.user as any).role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#249cff] transition-all"
                  >
                    <LayoutDashboard size={18} />
                    Admin
                  </Link>
                )}
                <Link
                  href="/orders"
                  className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#249cff] transition-all"
                >
                  <ShoppingBag size={18} />
                  My Orders
                </Link>
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl shadow-sm">
                  <UserIcon size={14} className="text-[#249cff]" />
                  <span className="font-bold">{session.user?.email}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-500 transition-all px-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-sm font-bold text-slate-600 hover:text-[#249cff] transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#249cff] text-white px-6 py-2.5 rounded-2xl text-sm font-black hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-100"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar / Overlay Menu */}
      <div className={cn(
        "fixed inset-0 z-40 md:hidden transition-all duration-500",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}>
        {/* Backdrop */}
        <div 
          className={cn(
            "absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={toggleMenu}
        />
        
        {/* Menu Content */}
        <div className={cn(
          "absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl transition-transform duration-500 ease-out transform p-8",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Navigation</span>
              <button onClick={toggleMenu} className="p-2 rounded-lg hover:bg-slate-50"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              {session ? (
                <>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 rounded-full bg-[#249cff] flex items-center justify-center text-white">
                        <UserIcon size={16} />
                      </div>
                      <span className="text-xs font-black text-slate-900 uppercase truncate">Account</span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 truncate ml-11">{session.user?.email}</p>
                  </div>

                  {(session.user as any).role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={toggleMenu}
                      className="flex items-center gap-4 text-base font-bold text-slate-900 hover:text-[#249cff] p-2 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#249cff]">
                        <LayoutDashboard size={20} />
                      </div>
                      Admin Panel
                    </Link>
                  )}

                  <Link
                    href="/orders"
                    onClick={toggleMenu}
                    className="flex items-center gap-4 text-base font-bold text-slate-900 hover:text-[#249cff] p-2 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#249cff]">
                      <ShoppingBag size={20} />
                    </div>
                    My Orders
                  </Link>

                  <button
                    onClick={() => {
                      toggleMenu();
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center gap-4 text-base font-bold text-red-500 hover:bg-red-50 p-2 rounded-2xl transition-all w-full"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                      <LogOut size={20} />
                    </div>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={toggleMenu}
                    className="flex items-center gap-4 text-base font-bold text-slate-900 p-2 transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={toggleMenu}
                    className="flex items-center justify-center w-full bg-[#249cff] text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-100"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <div className="mt-auto pt-8 border-t border-slate-50">
               <img src="/logo.png" alt="Logo" className="h-8 w-auto opacity-50 grayscale" />
               <p className="text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-widest leading-relaxed">
                 The Shillong Times<br/>Advertisement Portal
               </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
