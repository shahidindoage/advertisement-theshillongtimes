"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  FileText, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  CreditCard, 
  ArrowLeft, 
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import PaymentProcessingOverlay from "@/components/ui/PaymentProcessingOverlay";
import { useRazorpay } from "@/lib/useRazorpay";

const CATEGORIES = [
  "Admission",
  "Business",
  "Coaching",
  "For Sale",
  "Job",
  "Miscellaneous",
  "PG/Hostel",
  "Public Notice",
  "Situation Vacant",
  "Tolet",
  "Training",
  "Tuition"
];

const COST_PER_WORD = 14;

export default function ClassifiedTextBooking() {
  const { data: session } = useSession();
  const router = useRouter();
  const { initiatePayment } = useRazorpay();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    category: "",
    content: "",
    gstNumber: "",
    startDate: "",
    endDate: "",
  });

  const wordCount = useMemo(() => {
    const words = formData.content.trim().split(/\s+/).filter(w => w.length > 0);
    return words.length;
  }, [formData.content]);

  const duration = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  }, [formData.startDate, formData.endDate]);

  const bonusDays = useMemo(() => {
    // Only apply bonus if duration is a multiple of 3 (3, 6, 9, etc.)
    return (duration > 0 && duration % 3 === 0) ? (duration / 3) : 0;
  }, [duration]);

  const totalDays = duration + bonusDays;

  const extendedEndDate = useMemo(() => {
    if (!formData.endDate || bonusDays === 0) return formData.endDate;
    const date = new Date(formData.endDate);
    date.setDate(date.getDate() + bonusDays);
    return date.toISOString().split("T")[0];
  }, [formData.endDate, bonusDays]);

  const totalCost = wordCount * COST_PER_WORD;
  const gstAmount = Math.round(totalCost * 0.18);
  const finalAmount = totalCost + gstAmount;

  const nextStep = () => {
    if (step === 1) {
      if (!formData.category) return setError("Please select a category");
      if (wordCount < 7 || wordCount > 50) return setError("Content must be between 7 and 50 words");
      setError("");
    }
    if (step === 2) {
      if (!formData.startDate || !formData.endDate) return setError("Please select both dates");
      if (new Date(formData.startDate) > new Date(formData.endDate)) return setError("End date must be after start date");
      setError("");
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // Step 1: Save ad as PENDING, get adId
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          endDate: extendedEndDate,
          type: "CLASSIFIED_TEXT",
          wordCount,
          cost: finalAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save ad");

      setLoading(false);

      // Step 2: Open Razorpay checkout
      initiatePayment({
        adId: data.adId,
        amount: finalAmount,
        email: session?.user?.email || "",
        name: session?.user?.name || "Customer",
        description: `Classified Text Ad – ${formData.category}`,
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => router.push("/thank-you"), 1500);
        },
        onError: (msg) => setError(msg),
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: "Ad Details", icon: <FileText size={18} /> },
    { id: 2, name: "Select Dates", icon: <CalendarIcon size={18} /> },
    { id: 3, name: "Summary", icon: <CheckCircle2 size={18} /> },
    { id: 4, name: "Payment", icon: <CreditCard size={18} /> },
  ];

  return (
    <>
      <PaymentProcessingOverlay isProcessing={loading} isSuccess={isSuccess} />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2 relative z-10">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  step >= s.id ? "bg-[#249cff] text-white" : "bg-slate-200 text-slate-500"
                )}
              >
                {s.icon}
              </div>
              <span className={cn(
                "text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:block",
                step >= s.id ? "text-[#249cff]" : "text-slate-400"
              )}>
                {s.name}
              </span>
            </div>
          ))}
          {/* Connector Line */}
          <div className="absolute top-[84px] left-1/2 -translate-x-1/2 h-0.5 bg-slate-100 w-full max-w-6xl -z-0">
            <div 
              className="h-full bg-[#249cff] transition-all duration-500" 
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        {step < 4 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Form Content */}
            <div className="space-y-6">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-slate-700">Ad Content</label>
                      <span className={cn(
                        "text-xs font-bold",
                        wordCount >= 7 && wordCount <= 50 ? "text-green-600" : "text-red-500"
                      )}>
                        {wordCount} / 50 words (Min 7)
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                      placeholder="Type your ad content here..."
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">GST Number (Optional)</label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>

                  <div className="p-5 bg-indigo-50 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-indigo-900/60 font-medium">Base Amount:</span>
                      <span className="text-indigo-900 font-bold">₹{totalCost}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-indigo-100 pb-3">
                      <span className="text-indigo-900/60 font-medium">GST (18%):</span>
                      <span className="text-indigo-900 font-bold">₹{gstAmount}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-indigo-900 font-black uppercase tracking-wider text-xs">Total Estimated:</span>
                      <span className="text-2xl font-black text-indigo-600">₹{finalAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Start Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">End Date</label>
                      <input
                        type="date"
                        min={formData.startDate || new Date().toISOString().split("T")[0]}
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                  {duration > 0 && (
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-indigo-600" size={18} />
                        <div>
                          <p className="text-sm font-bold text-indigo-900">Duration: {duration} Days</p>
                          {bonusDays > 0 && (
                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">
                              + {bonusDays} BONUS DAYS INCLUDED
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 font-medium">Publishing Until</p>
                        <p className="text-sm font-black text-slate-900">{extendedEndDate}</p>
                      </div>
                    </div>
                  )}
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                      <span className="font-bold block mb-1">Bonus Offer:</span> 
                      Get 1 EXTRA DAY free for every 3 days paid! (Applies only to durations of 3, 6, 9, 12... days).
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Review Your Booking</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div className="space-y-1">
                      <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Paid Duration</p>
                      <p className="text-slate-900 font-bold">{duration} Days</p>
                    </div>

                    {bonusDays > 0 && (
                      <div className="space-y-1">
                        <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Bonus Days</p>
                        <p className="text-green-600 font-bold">+{bonusDays} Days (Free)</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Publication Period</p>
                      <p className="text-slate-900 font-bold">{formData.startDate} to {extendedEndDate} ( {totalDays} days )</p>
                    </div>
                    <div className="space-y-1">
                      {/* <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Total insertations</p>
                      <p className="text-[#249cff] font-black uppercase">{totalDays} insertions</p> */}
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Ad Content</p>
                      <p className="text-slate-900 font-medium p-4 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed italic">
                        &quot;{formData.content}&quot;
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Word Count</p>
                      <p className="text-slate-900 font-bold">{wordCount} Words</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">GST Number</p>
                      <p className="text-slate-900 font-bold">{formData.gstNumber || "N/A"}</p>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-900 rounded-3xl space-y-4 text-white shadow-xl shadow-slate-200">
                    <div className="flex justify-between items-center text-sm opacity-80">
                      <span>Base Amount</span>
                      <span className="font-bold">₹{totalCost}.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm opacity-80 border-b border-white/10 pb-4">
                      <span>GST (18%)</span>
                      <span className="font-bold">₹{gstAmount}.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-black uppercase tracking-widest text-xs">Total Payable</span>
                      <span className="text-3xl font-black">₹{finalAmount}.00</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Ad Preview (Persistent for Steps 1-3) */}
            <div className="flex flex-col h-fit lg:sticky lg:top-8 animate-in fade-in duration-700">
              <div className="bg-[#f3f4f6] border border-slate-200 rounded-t-2xl p-4 text-center">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">AD Preview</h3>
              </div>
              <div className="bg-[#333333] p-3 text-center">
                <p className="text-white font-bold uppercase tracking-widest text-[10px]">
                  {formData.category || "Select Category"}
                </p>
              </div>
              <div className="bg-white border-x border-slate-200 min-h-[180px] p-8 flex items-start justify-start shadow-inner">
                <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap break-words w-full text-sm">
                  {formData.content || "Your ad content will appear here..."}
                </p>
              </div>
              <div className="bg-[#f3f4f6] border border-slate-200 rounded-b-2xl p-4 text-center">
                <p className="text-[9px] text-slate-400 font-medium leading-normal italic">
                  Font size in the preview is not as per scale. Actual word/lines may vary based on selected enhancements. 
                  Management has the right to edit any Grammatical changes.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Step 4: Payment (Full Width) */}
            {/* Razorpay Secure Payment Card */}
            <div className="bg-gradient-to-br from-[#249cff]/5 to-slate-50 border border-[#249cff]/20 rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-5 border border-slate-100">
                <ShieldCheck className="text-[#249cff]" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Secure Payment via Razorpay</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-sm leading-relaxed">
                Click <strong>&quot;Pay Now&quot;</strong> to open the secure Razorpay checkout. You can pay via UPI, Cards, Net Banking, or Wallets.
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                256-bit SSL Encrypted · Powered by Razorpay
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-4">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Total Amount</span>
                <span className="text-2xl text-slate-900 font-black tracking-tight">₹{finalAmount}.00</span>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-1">
                {["UPI", "Cards", "Net Banking"].map((method) => (
                  <div key={method} className="text-center py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{method}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-12 flex justify-between gap-4">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
            >
              <ArrowLeft size={18} /> Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-70 disabled:scale-100"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Pay Now"}
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
