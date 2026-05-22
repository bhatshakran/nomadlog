import { toPng } from "html-to-image";
import { useRef } from "react";

// --- SCREEN: SNAPSHOT SHARING INTERFACE ---
export const ShareScreen = ({
  totalSpent,
  totalTransport,
  totalFood,
  totalShopping,
  totalFlights,
  settings,
}: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const handleDownload = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 3,
    });
    const link = document.createElement("a");
    link.download = "nomad-tracker-stats.png";
    link.href = dataUrl;
    link.click();
  };
  return (
    <div className="space-y-4 pt-2">
      <div
        ref={cardRef}
        className="bg-[#111827] rounded-3xl p-6 border border-neutral-800 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-xs text-blue-200/60 font-bold tracking-widest uppercase mb-1">
            {settings.city.toUpperCase()} · INSIGHT REPORT
          </p>
          <h3 className="text-3xl font-black text-white mb-4">
            ₹{totalSpent.toLocaleString("en-IN")}
          </h3>
          <div className="space-y-2 text-xs text-neutral-300">
            <div className="flex justify-between border-b border-neutral-800 pb-1.5">
              <span>✈️ Flights Total:</span>
              <span className="font-bold text-blue-400">
                ₹{totalFlights.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 pb-1.5">
              <span>🚕 Transport Total:</span>
              <span className="font-bold text-white">
                ₹{totalTransport.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 pb-1.5">
              <span>🍛 Food Total:</span>
              <span className="font-bold text-white">
                ₹{totalFood.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span>🛍️ Delivery & Shopping Total:</span>
              <span className="font-bold text-white">
                ₹{totalShopping.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="w-full bg-[#1e293b] hover:bg-[#334155] text-white font-extrabold py-3.5 rounded-2xl transition border border-slate-700 text-sm shadow-md"
      >
        Download Snapshot Image
      </button>
    </div>
  );
};
