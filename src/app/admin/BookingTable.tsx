"use client";

import { useState } from "react";
import { ArrowUpRight, Calendar, FileText, X, Download, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Ad = any; // We'll use any for simplicity, or define the proper type if needed

export default function BookingTable({ ads }: { ads: Ad[] }) {
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  const openModal = (ad: Ad) => setSelectedAd(ad);
  const closeModal = () => setSelectedAd(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Ad Details</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {ads.map((ad) => (
              <tr key={ad.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#249cff]/10 group-hover:text-[#249cff] transition-colors">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{ad.type.replace("_", " ")}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{ad.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-slate-900">{ad.user.email}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">ID: {ad.userId.slice(-6)}</p>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Calendar size={14} className="text-slate-300" />
                    {new Date(ad.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    To {new Date(ad.endDate).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-8 py-6 text-sm font-black text-slate-900">
                  ₹{ad.cost.toLocaleString()}
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                    ad.status === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    <div className={cn("w-1 h-1 rounded-full", ad.status === "PAID" ? "bg-emerald-500" : "bg-amber-500")} />
                    {ad.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                   <button 
                    onClick={() => openModal(ad)}
                    className="px-4 py-2 rounded-xl bg-slate-50 text-slate-500 font-bold text-xs hover:bg-[#249cff] hover:text-white transition-all flex items-center gap-2"
                   >
                     View Details <ArrowUpRight size={14} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Overlay */}
      {selectedAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Order Details</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  ID: {selectedAd.id}
                </p>
              </div>
              <button 
                onClick={closeModal}
                className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {/* Top Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                  <span className={cn(
                    "inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                    selectedAd.status === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {selectedAd.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Amount</p>
                  <p className="text-lg font-black text-slate-900">₹{selectedAd.cost}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Customer Email</p>
                  <p className="text-sm font-bold text-slate-700">{selectedAd.user?.email}</p>
                </div>
              </div>

              {/* Advertisement Specifics */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
                <div className="grid grid-cols-2 gap-6 border-b border-slate-200 pb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ad Type</p>
                    <p className="text-sm font-bold text-slate-900">{selectedAd.type.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Category</p>
                    <p className="text-sm font-bold text-slate-900">{selectedAd.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Start Date</p>
                    <p className="text-sm font-bold text-slate-900">{new Date(selectedAd.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">End Date</p>
                    <p className="text-sm font-bold text-slate-900">{new Date(selectedAd.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Conditional Content based on Ad Type */}
                {selectedAd.type === "CLASSIFIED_TEXT" ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Advertisement Text ({selectedAd.wordCount} words)</p>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                      {selectedAd.content}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Design Specifications</p>
                      <span className="text-xs font-bold text-slate-600 bg-slate-200 px-3 py-1 rounded-full">
                        {selectedAd.width}cm × {selectedAd.length}cm
                      </span>
                    </div>
                    {selectedAd.fileUrl ? (
                       <a 
                         href={selectedAd.fileUrl.replace("dl=0", "raw=1")}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-[#249cff] transition-all group"
                       >
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Maximize2 size={20} />
                           </div>
                           <div>
                             <p className="text-sm font-bold text-slate-900">View Design File</p>
                             <p className="text-xs font-medium text-slate-400">Click to open full size</p>
                           </div>
                         </div>
                         <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#249cff] group-hover:text-white transition-all">
                           <ArrowUpRight size={18} />
                         </div>
                       </a>
                    ) : (
                      <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-600 text-sm font-bold flex items-center justify-center">
                        No design file uploaded
                      </div>
                    )}
                  </div>
                )}

                {selectedAd.gstNumber && (
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">GST Number</p>
                    <p className="text-sm font-mono font-bold text-slate-700">{selectedAd.gstNumber}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
               <button 
                onClick={closeModal}
                className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
               >
                 Close Details
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
