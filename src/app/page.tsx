import Link from "next/link";
import Image from "next/image";
import { MessageSquareText, Image as ImageIcon, LayoutPanelLeft, ArrowRight } from "lucide-react";

const AD_TYPES = [
  {
    id: "classified-text",
    title: "Classified Text Ad",
    description: "Shillong\n(circulation: 35887 copies)\n\nFor Page 2 only\n\nMin 7 Words - Max 50 Words\n\nRs.14 Per Words",
    icon: <MessageSquareText className="text-indigo-600" size={32} />,
    image: "/AD1.jpg",
    active: true,
    price: "₹14/word",
  },
  {
    id: "classified-display",
    title: "Classified Display Ad",
    description: "Shillong\n(circulation: 35887 copies)\n\nFor Page 2 only\n\nBlack and White Ads\nWidth 4cm(Single Column Only)\nLength Min 4cm to Max 15cm\n\nRs.150/sqcm",
    icon: <ImageIcon className="text-slate-400" size={32} />,
    image: "/AD2.jpg",
    active: true,
    price: "₹150/sqcm",
  },
  {
    id: "display",
    title: "Display Ad",
    description: "Shillong\n(circulation: 35887 copies)\n\nColor & B/W Ads\nPage 1, 12 & Inside Pages\nWidth 4cm to 33cm\nLength Min 4cm to Max 50cm\n\nStarting from Rs.210/sqcm",
    icon: <LayoutPanelLeft className="text-slate-400" size={32} />,
    image: "/AD3.jpg",
    active: true,
    price: "₹210/sqcm",
  },
];

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:pt-20 sm:pb-8">
      <div className="text-center mb-12 sm:mb-20">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 px-2">
          Book Your <span className="text-[#249cff]">Advertisement</span> Effortlessly
        </h1>
        <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto px-4">
          Choose from our range of advertising options and reach thousands of readers today.
          Simple, fast, and secure booking process.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
        {AD_TYPES.map((ad) => (
          <div
            key={ad.id}
            className="group min-h-[550px] md:h-[500px] [perspective:1000px]"
          >
            <div className="relative w-full h-full transition-all duration-700 md:[transform-style:preserve-3d] md:group-hover:[transform:rotateY(180deg)]">
              {/* Front Side: Image (Desktop only flip effect) */}
              <div className="hidden md:block absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100">
                <div className="relative w-full h-full bg-slate-100">
                  <Image
                    src={ad.image}
                    alt={ad.title}
                    fill
                    priority
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                  {/* <div className="absolute bottom-8 left-8 right-8">
                    <h3 className="text-2xl font-black text-white tracking-tight">{ad.title}</h3>
                    <p className="text-white/70 text-sm font-bold mt-1 uppercase tracking-widest">{ad.price}</p>
                  </div> */}
                </div>
              </div>

              {/* Back Side: Details (Static on mobile, flipped on desktop) */}
              <div className="md:absolute inset-0 w-full md:h-full md:[backface-visibility:hidden] md:[transform:rotateY(180deg)] bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-indigo-100 shadow-2xl shadow-indigo-500/10 flex flex-col h-full">
                
                {/* Mobile Header: Small Image + Price */}
                <div className="md:hidden relative w-full h-40 mb-6 rounded-2xl overflow-hidden">
                  <Image
                    src={ad.image}
                    alt={ad.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-4">
                     <span className="text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 bg-black/20 backdrop-blur-md rounded-lg border border-white/20">
                       Starting {ad.price}
                     </span>
                  </div>
                </div>

                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 text-[#249cff] border border-slate-100">
                  {ad.icon}
                </div>
                
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">{ad.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 whitespace-pre-line flex-1">
                  {ad.description}
                </p>
                
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-center">
                  {ad.active ? (
                    <Link
                      href={`/book/${ad.id}`}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-bold text-white bg-red-500 px-8 py-3.5 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-100 active:scale-95"
                    >
                      Book Now <ArrowRight size={18} />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full text-sm font-bold text-slate-400 bg-slate-100 px-6 py-3 rounded-xl cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-24 pt-8  text-center">
        <p className="text-sm text-slate-400 font-medium">
          Copyright © 2026- The Shillong Times. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
