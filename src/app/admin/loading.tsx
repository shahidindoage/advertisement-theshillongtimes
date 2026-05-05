import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="relative flex flex-col items-center">
        {/* Background pulsing glow */}
        <div className="absolute inset-0 bg-[#249cff]/20 blur-3xl rounded-full w-32 h-32 animate-pulse" />
        
        {/* The loader icon */}
        <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-6 z-10">
          <Loader2 className="animate-spin text-[#249cff]" size={40} strokeWidth={2.5} />
        </div>
        
        {/* Text */}
        <h2 className="text-2xl font-black text-slate-900 tracking-tight z-10">
          Loading <span className="text-[#249cff]">Dashboard</span>
        </h2>
        <p className="text-slate-500 font-medium mt-2 z-10 max-w-xs text-center">
          Securely fetching admin data...
        </p>

        {/* Loading bar */}
        <div className="w-48 h-1.5 bg-slate-200 rounded-full mt-8 overflow-hidden z-10">
          <div className="h-full bg-[#249cff] rounded-full w-1/2 animate-[progress_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
      
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
