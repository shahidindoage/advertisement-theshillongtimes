import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter,
  ArrowUpRight,
  FileText,
  Calendar,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import LogoutButton from "./LogoutButton"; 
import BookingTable from "./BookingTable";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session");
  
  if (!isAdmin) {
    redirect("/admin/login");
  }

  const ads = await prisma.ad.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const stats = [
    { 
      label: "Total Revenue", 
      value: `₹${ads.reduce((acc, ad) => acc + (ad.status === "PAID" ? ad.cost : 0), 0).toLocaleString()}`, 
      icon: <IndianRupee size={20} />,
      color: "bg-emerald-50 text-emerald-600"
    },
    { 
      label: "Total Bookings", 
      value: ads.length, 
      icon: <ShoppingBag size={20} />,
      color: "bg-blue-50 text-blue-600"
    },
    { 
      label: "Paid Ads", 
      value: ads.filter(ad => ad.status === "PAID").length, 
      icon: <CheckCircle2 size={20} />,
      color: "bg-indigo-50 text-indigo-600"
    },
    { 
      label: "Pending Payment", 
      value: ads.filter(ad => ad.status === "PENDING").length, 
      icon: <Clock size={20} />,
      color: "bg-amber-50 text-amber-600"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 bg-[#249cff] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <LayoutDashboard size={24} />
              </div>
              Admin Dashboard
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Manage and monitor all advertisement bookings</p>
          </div>
          
          <div className="flex items-center gap-3">
             {/* <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search bookings..." 
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-full md:w-64"
                />
             </div> */}
             {/* <LogoutButton /> */}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", stat.color)}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Ads Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
             <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Bookings</h2>
             {/* <button className="text-sm font-bold text-[#249cff] hover:underline">View All Records</button> */}
          </div>
          
          <BookingTable ads={ads.slice(0, 10)} />
          
          {ads.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">No bookings yet</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">When customers book advertisements, they will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
