"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentProcessingOverlayProps {
  isProcessing: boolean;
  isSuccess?: boolean;
}

export default function PaymentProcessingOverlay({ isProcessing, isSuccess = false }: PaymentProcessingOverlayProps) {
  const [animationData, setAnimationData] = useState<any>(null);
  const [loadingError, setLoadingError] = useState(false);

  useEffect(() => {
    // Fetch the locally provided Lottie animation from the public folder
    fetch("/loading.json")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load Lottie");
        return res.json();
      })
      .then(data => setAnimationData(data))
      .catch(() => {
        // Fallback to true if Lottie fails so we show our beautiful CSS alternative
        setLoadingError(true);
      });
  }, []);

  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background blur */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"></div>

      {/* Main Card */}
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        
        {/* Lottie or CSS Fallback */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
          {/* Pulsing glow behind the animation */}
          <div className="absolute inset-0 bg-[#249cff]/20 blur-2xl rounded-full animate-pulse" />
          
          {isSuccess ? (
             <div className="relative z-10 w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center animate-bounce duration-1000 shadow-xl shadow-emerald-500/20">
               <CheckCircle2 size={48} strokeWidth={3} />
             </div>
          ) : animationData && !loadingError ? (
            <div className="relative z-10 w-full h-full">
              <Lottie animationData={animationData} loop={true} />
            </div>
          ) : (
            // Beautiful CSS Fallback if Lottie JSON isn't available
            <div className="relative z-10 w-24 h-24 bg-blue-50 border-2 border-blue-100 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Loader2 className="animate-spin text-[#249cff]" size={40} strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* Text Details */}
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          {isSuccess ? "Payment Successful!" : "Processing Payment"}
        </h2>
        
        <p className="text-slate-500 font-medium leading-relaxed mb-8">
          {isSuccess 
            ? "Your advertisement has been booked. Redirecting you shortly..."
            : "Please wait while we securely process your transaction and generate your booking details."}
        </p>

        {/* Secure Badge */}
        {!isSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Secure 256-bit Encryption</span>
          </div>
        )}
      </div>
    </div>
  );
}
