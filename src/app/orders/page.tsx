import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function OrdersPage() {
  const session = await auth();

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const orders = await prisma.ad.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 pt-12 pb-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          {/* <ShoppingBag className="text-[#249cff]" /> */}
          My Orders
        </h1>
        <p className="text-slate-500 mt-2">Manage and track your advertisement bookings</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-200 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
            <ShoppingBag size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No bookings yet</h3>
          <p className="text-slate-500 mt-2 mb-8 max-w-xs">You haven&apos;t placed any advertisement bookings yet.</p>
          <a
            href="/book/classified-text"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
          >
            Create Your First Ad
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <Link
              href={`/orders/${order.id}`}
              key={order.id}
              className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 block"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center sm:items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    order.status === "PAID" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {order.status === "PAID" ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">#{order.id.slice(-8).toUpperCase()}</span>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full",
                        order.status === "PAID" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {order.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{order.type.replace("_", " ")} AD</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight truncate max-w-[200px]">
                      {order.type === "CLASSIFIED_TEXT" ? order.content : `${order.width}cm x ${order.length}cm Design`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Amount</p>
                    <p className="text-sm font-black text-slate-900">₹{order.cost}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Start Date</p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-300" />
                      {order.startDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="hidden sm:block space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">End Date</p>
                    <p className="text-sm font-medium text-slate-500">
                      {order.endDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button className="p-2 text-slate-300 group-hover:text-indigo-600 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <footer className="mt-20 py-8  text-center">
        <p className="text-sm text-slate-400 font-medium">
          Copyright © 2026- The Shillong Times. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
