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
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";


const CATEGORIES = [
  "Matrimonial",
  "Property",
  "Recruitment",
  "Business",
  "Education",
  "Public Notice",
  "Obituary",
  "Others"
];

const COST_PER_WORD = 14;

export default function ClassifiedTextBooking() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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

  const totalCost = wordCount * COST_PER_WORD;

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
      // Step 1: Save ad as PENDING
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          type: "CLASSIFIED_TEXT",
          wordCount,
          cost: totalCost,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save ad");

      // Step 2: Simulate Payment Confirmation
      const confirmRes = await fetch("/api/ads/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: data.adId }),
      });

      if (!confirmRes.ok) throw new Error("Payment confirmation failed");

      router.push("/thank-you");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
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

                  <div className="p-4 bg-indigo-50 rounded-2xl flex justify-between items-center">
                    <span className="text-indigo-900 font-medium">Estimated Cost:</span>
                    <span className="text-2xl font-bold text-indigo-600">₹{totalCost}</span>
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
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                      <span className="font-bold block mb-1">Note regarding Publication Date:</span> 
                      Your advertisement will be published starting from the selected Start Date until the End Date (inclusive). Please ensure the dates are selected accurately as changes or cancellations after booking may not be possible.
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Review Your Booking</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div className="space-y-1">
                      <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Category</p>
                      <p className="text-slate-900 font-bold">{formData.category}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Dates</p>
                      <p className="text-slate-900 font-bold">{formData.startDate} to {formData.endDate}</p>
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
                  <div className="p-4 bg-slate-900 rounded-2xl flex justify-between items-center text-white">
                    <span className="font-medium opacity-80">Total Amount Payable:</span>
                    <span className="text-2xl font-bold">₹{totalCost}</span>
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
          /* Step 4: Payment (Full Width) */
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                <CreditCard className="text-[#249cff]" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Secure Payment</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-xs">
                This is a dummy payment step. Click &quot;Pay Now&quot; to simulate a successful transaction.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold border-b border-slate-100 pb-4">
                <span className="text-slate-500 uppercase tracking-widest text-[10px]">Order Total</span>
                <span className="text-xl text-slate-900 font-black tracking-tight">₹{totalCost}.00</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Secure SSL Encrypted Connection
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
  );
}
