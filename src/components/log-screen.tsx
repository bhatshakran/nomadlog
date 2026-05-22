import { Log, Settings } from "app/app";
import { useEffect, useState } from "react";

// --- SCREEN: TRANSACTION LOG INPUT ---
export const LogScreen = ({
  addLog,
  settings,
}: {
  addLog: (log: Log) => void;
  settings: Settings;
}) => {
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  );
  const [type, setType] = useState<string>("Ride");
  const [title, setTitle] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [platform, setPlatform] = useState<string>("Uber");
  const [mode, setMode] = useState<string>("Bike");

  const suggestions = {
    Ride: {
      platforms: ["Uber", "Rapido", "Manual", "Metro"],
      modes: ["Bike", "Auto", "Cab"],
    },
    Food: {
      platforms: ["Swiggy", "Zomato", "In-Store"],
      modes: ["Delivery", "Dine-in"],
    },
    Shopping: {
      platforms: ["Blinkit", "Zepto", "Amazon", "In-Store"],
      modes: ["Delivery", "Pickup"],
    },
  };

  useEffect(() => {
    const currentCategory = suggestions[type as keyof typeof suggestions];
    if (currentCategory) {
      setPlatform(currentCategory.platforms[0]);
      setMode(currentCategory.modes[0]);
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLog({
      id: crypto.randomUUID(),
      date,
      time,
      type,
      title: title || details || type,
      amount: Number(amount) || 0,
      details,
      platform,
      mode,
    });
    setAmount("");
    setDetails("");
    setTitle("");
  };

  return (
    <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 space-y-5 shadow-xl">
      <h2 className="text-lg font-bold text-neutral-200">Log Transaction</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["Ride", "Food", "Shopping"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition ${type === t ? "bg-white text-neutral-900 border-white shadow-lg" : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-750"}`}
              >
                {t === "Ride"
                  ? "🚕 Ride"
                  : t === "Food"
                    ? "🍛 Food"
                    : "🛍️ Shop"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
            Transaction Title
          </label>
          <input
            type="text"
            required
            placeholder="E.g. Haleem Dinner, Office Commute, Grocery Run"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
              Amount (₹)
            </label>
            <input
              type="number"
              required
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
              Date & Time
            </label>
            <div className="flex gap-1.5">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2 text-xs focus:outline-none text-neutral-200"
              />
              <input
                type="text"
                placeholder="09:25 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2 text-xs focus:outline-none text-neutral-200"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
            Platform Fast Selector
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {suggestions[type as keyof typeof suggestions]?.platforms.map(
              (p) => (
                <span
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-3 py-1 text-[11px] font-medium rounded-full cursor-pointer transition ${platform === p ? "bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow" : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-300"}`}
                >
                  {p}
                </span>
              ),
            )}
          </div>
          <input
            type="text"
            placeholder="Or specify custom platform..."
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1">
            Destination Location Suggestions
          </label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setDetails(settings.flatArea)}
              className="bg-neutral-800 border border-neutral-700 text-neutral-400 text-[10px] py-1 px-2.5 rounded-lg hover:text-white"
            >
              📍 Flat ({settings.flatArea})
            </button>
            <button
              type="button"
              onClick={() => setDetails(settings.friendsArea)}
              className="bg-neutral-800 border border-neutral-700 text-neutral-400 text-[10px] py-1 px-2.5 rounded-lg hover:text-white"
            >
              📍 Friend ({settings.friendsArea})
            </button>
          </div>
          <textarea
            required
            placeholder="Specify landmarks, item specifications or order details..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm focus:outline-none min-h-[60px]"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-extrabold py-3.5 rounded-xl transition shadow-md"
        >
          Save Transaction
        </button>
      </form>
    </div>
  );
};
