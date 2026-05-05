import Link from "next/link";
import { CheckCircle2, ArrowRight, Home, FileText } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden text-center">
        <div className="p-6 sm:p-12">
          <div className="mx-auto w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-8 animate-bounce duration-1000">
            <CheckCircle2 size={48} strokeWidth={2.5} />
          </div>

          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
            Thank You!
          </h1>
          <p className="text-lg text-slate-500 mb-10 leading-relaxed">
            Your advertisement has been booked successfully. We&apos;ve sent a confirmation email to your inbox.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
            >
              <Home size={20} /> Back Home
            </Link>
            <Link
              href="/orders"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              View Orders <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        <div className="bg-slate-50 px-6 sm:px-12 py-8 border-t border-slate-100 flex items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <FileText size={16} />
            Order #EP-{Math.floor(Math.random() * 100000)}
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <div className="text-sm font-medium text-slate-400">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
      <footer className="fixed bottom-0 left-0 w-full py-4 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-400 font-medium">
          Copyright © 2026- The Shillong Times. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
