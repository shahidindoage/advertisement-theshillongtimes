import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Receipt, 
  User,
  Tag,
  Hash,
  IndianRupee,
  ExternalLink,
  Upload,
  ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const order = await prisma.ad.findUnique({
    where: { id },
  });

  if (!order) {
    notFound();
  }

  if (order.userId !== session.user.id) {
    redirect("/orders");
  }

  const detailItems = [
    { label: "Ad Category", value: order.category, icon: <Tag size={18} /> },
    { label: "Ad Type", value: order.type.replace("_", " "), icon: <FileText size={18} /> },
    order.type === "CLASSIFIED_TEXT" 
      ? { label: "Word Count", value: `${order.wordCount} Words`, icon: <Hash size={18} /> }
      : { label: "Dimensions", value: `${order.width}cm x ${order.length}cm`, icon: <Hash size={18} /> },
    { label: "GST Number", value: order.gstNumber || "N/A", icon: <Receipt size={18} /> },
    { label: "Total Cost", value: `₹${order.cost}`, icon: <IndianRupee size={18} /> },
    { label: "Status", value: order.status, icon: order.status === "PAID" ? <CheckCircle2 size={18} /> : <Clock size={18} />, highlight: true },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pt-12 pb-4">
      <Link 
        href="/orders" 
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm mb-8 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to My Orders
      </Link>

      <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-6 sm:p-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-300 bg-slate-50 px-3 py-1 rounded-full">
                  Order ID: #{order.id.slice(-12).toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Booking Details</h1>
            </div>
            <div className={cn(
              "px-6 py-3 rounded-2xl flex items-center gap-3 font-bold text-sm shadow-sm",
              order.status === "PAID" 
                ? "bg-green-50 text-green-700 border border-green-100" 
                : "bg-amber-50 text-amber-700 border border-amber-100"
            )}>
              {order.status === "PAID" ? <CheckCircle2 size={20} /> : <Clock size={20} />}
              Payment {order.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-10">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#249cff]">Booking Information</h3>
                <div className="grid grid-cols-1 gap-6">
                  {detailItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                        <p className={cn(
                          "text-base font-bold",
                          item.highlight ? (order.status === "PAID" ? "text-green-600" : "text-amber-600") : "text-slate-900"
                        )}>
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#249cff]">Display Dates</h3>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">From</p>
                    <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Calendar size={14} className="text-indigo-400" />
                      {order.startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">To</p>
                    <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Calendar size={14} className="text-indigo-400" />
                      {order.endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#249cff]">
                {order.type === "CLASSIFIED_TEXT" ? "Advertisement Content" : "Ad Design File"}
              </h3>
              <div className="relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#249cff] rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  {order.type === "CLASSIFIED_TEXT" ? <FileText size={16} /> : <Upload size={16} />}
                </div>
                {order.type === "CLASSIFIED_TEXT" ? (
                  <div className="p-8 bg-white border-2 border-slate-50 rounded-[2rem] min-h-[200px] shadow-inner shadow-slate-100 flex items-center justify-center text-center">
                    <p className="text-lg font-medium text-slate-700 leading-relaxed italic">
                      &quot;{order.content}&quot;
                    </p>
                  </div>
                ) : (
                  <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] min-h-[200px] flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#249cff] shadow-sm">
                      <ImageIcon size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Design File Attached</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest truncate max-w-[200px]">
                        {order.fileUrl?.split('/').pop()?.split('?')[0] || "Download to view"}
                      </p>
                    </div>
                    <a 
                      href={order.fileUrl || "#"} 
                      target="_blank" 
                      className="mt-2 px-6 py-3 bg-[#249cff] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-blue-600 transition-all active:scale-95"
                    >
                      <ExternalLink size={14} /> View / Download File
                    </a>
                  </div>
                )}
              </div>
              <div className="p-4 flex items-center gap-3 text-xs text-slate-400">
                <Clock size={14} />
                Booked on {order.createdAt.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-white text-center sm:text-left">
            <button className="w-full sm:w-auto bg-transparent text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/10">
             {/* <ExternalLink size={18} /> Order Summary */}
          </button>
            <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 bg-[#249cff] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-900/40">
              <Receipt size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Total Amount Paid</p>
              <p className="text-2xl font-black">₹{order.cost}.00</p>
            </div>
          </div>
          
        
        </div>
      </div>
      
      <footer className="mt-12 py-8  text-center">
        <p className="text-sm text-slate-400 font-medium">
          Copyright © 2026 - The Shillong Times. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
