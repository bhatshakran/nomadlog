import React, { useState, useEffect, useRef } from "react";
import { toPng } from "html-to-image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// --- TYPES & INTERFACES ---
type TabType = "home" | "log" | "stats" | "share" | "settings";
type ExpenseType = "Ride" | "Food" | "Shopping" | "Accommodation" | string;

interface Log {
  id: string;
  date: string;
  time?: string;
  type: ExpenseType;
  amount: number;
  details: string;
  platform: string;
  mode: string;
}

interface Settings {
  city: string;
  flatArea: string;
  friendsArea: string;
}

// --- NAVIGATION BAR ICONS ---
const HomeIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504 1.125 1.125 1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </svg>
);
const PlusIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);
const StatsIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
    />
  </svg>
);
const ShareIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
    />
  </svg>
);
const SettingsIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
    />
  </svg>
);

// --- APP CORE ROOT ---
export default function App() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [currentTab, setCurrentTab] = useState<TabType>("home");
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem("nomad-settings");
    return saved
      ? JSON.parse(saved)
      : { city: "Hyderabad", flatArea: "Madhapur", friendsArea: "Tolichowki" };
  });

  useEffect(() => {
    const savedLogs = localStorage.getItem("nomad-tx-logs");
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  useEffect(() => {
    localStorage.setItem("nomad-tx-logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("nomad-settings", JSON.stringify(settings));
  }, [settings]);

  const addLog = (newLog: Log) => {
    setLogs((prev) =>
      [newLog, ...prev].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    );
    setCurrentTab("home");
  };

  const deleteLog = (id: string) =>
    setLogs(logs.filter((log) => log.id !== id));

  const totalSpent = logs.reduce((sum, log) => sum + log.amount, 0);
  const totalTransport = logs
    .filter(
      (l) =>
        l.type.toLowerCase() === "ride" || l.type.toLowerCase() === "transport",
    )
    .reduce((sum, l) => sum + l.amount, 0);
  const totalFood = logs
    .filter((l) => l.type.toLowerCase() === "food")
    .reduce((sum, l) => sum + l.amount, 0);
  const totalShopping = logs
    .filter((l) => l.type.toLowerCase() === "shopping")
    .reduce((sum, l) => sum + l.amount, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 pb-28 font-sans flex flex-col items-center">
      <div className="w-full max-w-md space-y-6">
        {currentTab !== "share" && (
          <header className="flex items-center gap-3 mt-4">
            <span className="text-2xl">📍</span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Nomad Tracker
              </h1>
              <p className="text-xs text-neutral-400">
                {settings.city} Edition
              </p>
            </div>
          </header>
        )}

        {currentTab === "home" && (
          <HomeScreen
            logs={logs}
            deleteLog={deleteLog}
            totalSpent={totalSpent}
            settings={settings}
          />
        )}
        {currentTab === "log" && (
          <LogScreen addLog={addLog} settings={settings} />
        )}
        {currentTab === "stats" && (
          <StatsScreen logs={logs} totalSpent={totalSpent} />
        )}
        {currentTab === "share" && (
          <ShareScreen
            totalSpent={totalSpent}
            totalTransport={totalTransport}
            totalFood={totalFood}
            totalShopping={totalShopping}
            settings={settings}
          />
        )}
        {currentTab === "settings" && (
          <SettingsScreen
            settings={settings}
            setSettings={setSettings}
            setLogs={setLogs}
          />
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900/90 backdrop-blur-md border-t border-neutral-800 px-4 py-3 flex justify-between items-center max-w-md mx-auto shadow-2xl rounded-t-2xl z-50">
        <NavItem
          icon={HomeIcon}
          label="Home"
          active={currentTab === "home"}
          onClick={() => setCurrentTab("home")}
        />
        <NavItem
          icon={PlusIcon}
          label="Log"
          active={currentTab === "log"}
          onClick={() => setCurrentTab("log")}
        />
        <NavItem
          icon={StatsIcon}
          label="Stats"
          active={currentTab === "stats"}
          onClick={() => setCurrentTab("stats")}
        />
        <NavItem
          icon={ShareIcon}
          label="Share"
          active={currentTab === "share"}
          onClick={() => setCurrentTab("share")}
        />
        <NavItem
          icon={SettingsIcon}
          label="Config"
          active={currentTab === "settings"}
          onClick={() => setCurrentTab("settings")}
        />
      </nav>
    </div>
  );
}

const NavItem: React.FC<{
  icon: React.FC;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 relative transition w-16 ${active ? "text-white" : "text-neutral-500 hover:text-neutral-400"}`}
  >
    <Icon />
    <span className="text-[10px] font-medium">{label}</span>
    {active && (
      <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></div>
    )}
  </button>
);

// --- SCREEN: HOME DISPLAY ---
function HomeScreen({ logs, deleteLog, totalSpent, settings }: any) {
  const formatDay = (dateString: string) => {
    if (!dateString || dateString === "N/A") return "Date N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getEmoji = (type: string) => {
    const t = type.toLowerCase();
    if (t === "ride" || t === "transport") return "🚕";
    if (t === "food") return "🍛";
    if (t === "shopping") return "🛍️";
    return "📝";
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 flex justify-between items-center shadow-md">
        <div>
          <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
            Total Logged
          </p>
          <p className="text-2xl font-black mt-1 text-white">
            ₹{totalSpent.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="bg-neutral-800 text-neutral-300 text-[11px] px-2.5 py-1 rounded-xl border border-neutral-700">
            🏠 Flat: {settings.flatArea}
          </span>
          <span className="bg-neutral-800/60 text-neutral-400 text-[11px] px-2.5 py-1 rounded-xl border border-neutral-800">
            👥 Friends: {settings.friendsArea}
          </span>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-neutral-400 mb-3 px-1">
          Recent Transactions ({logs.length})
        </h2>
        {logs.length === 0 ? (
          <div className="text-center py-16 text-neutral-600 bg-neutral-900 rounded-2xl border-2 border-dashed border-neutral-800">
            No entries loaded yet. Import your data JSON inside the Config menu!
          </div>
        ) : (
          <div className="space-y-3">
            {logs.slice(0, 50).map((log: Log) => (
              <div
                key={log.id}
                className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 flex items-center justify-between group hover:border-neutral-700 transition"
              >
                <div className="flex items-center gap-3 w-3/4">
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg bg-neutral-800 border border-neutral-700 shadow-inner">
                    {getEmoji(log.type)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-neutral-200 truncate">
                      {log.details || log.type}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {formatDay(log.date)} {log.time && `• ${log.time}`} •{" "}
                      <span className="text-blue-400 font-medium">
                        {log.platform}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-base text-neutral-100">
                    ₹{log.amount.toLocaleString("en-IN")}
                  </p>
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="text-[11px] text-red-500/70 hover:text-red-400 transition mt-0.5 opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- SCREEN: TRANSACTION LOG INPUT ---
function LogScreen({
  addLog,
  settings,
}: {
  addLog: (log: Log) => void;
  settings: Settings;
}) {
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
      amount: Number(amount) || 0,
      details,
      platform,
      mode,
    });
    setAmount("");
    setDetails("");
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
                  className={`px-3 py-1 text-[11px] font-medium rounded-full cursor-pointer transition ${platform === p ? "bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow" : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:text-neutral-300"}`}
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
            placeholder="Specify landmark or order descriptors..."
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
}

// --- SCREEN: STATS DISPLAY (INCLUDES THREE INDEPENDENT SEGMENT CHARTS) ---
function StatsScreen({ logs }: { logs: Log[]; totalSpent: number }) {
  const getGroupedPlatform = (
    log: Log,
    category: "Ride" | "Food" | "Shopping",
  ) => {
    const platform = (log.platform || "").toLowerCase().trim();
    const mode = (log.mode || "").toLowerCase().trim();

    if (category === "Ride") {
      if (platform.includes("uber") || mode.includes("uber")) return "Uber";
      if (platform.includes("rapido") || mode.includes("rapido"))
        return "Rapido";
      return "Other";
    }
    if (category === "Food") {
      if (platform.includes("zomato")) return "Zomato";
      if (platform.includes("swiggy")) return "Swiggy";
      return "Other";
    }
    if (category === "Shopping") {
      if (platform.includes("blinkit")) return "Blinkit";
      if (platform.includes("zepto")) return "Zepto";
      if (platform.includes("amazon")) return "Amazon";
      return "Other";
    }
    return "Other";
  };

  const rideLogs = logs.filter(
    (l) =>
      l.type.toLowerCase() === "ride" || l.type.toLowerCase() === "transport",
  );
  const foodLogs = logs.filter((l) => l.type.toLowerCase() === "food");
  const shoppingLogs = logs.filter((l) => l.type.toLowerCase() === "shopping");

  const buildChartTimelineData = (
    categoryLogs: Log[],
    type: "Ride" | "Food" | "Shopping",
    keys: string[],
  ) => {
    const datesMap = categoryLogs.reduce(
      (acc, log) => {
        const d = log.date;
        if (!d || d === "N/A") return acc;
        if (!acc[d]) {
          acc[d] = {
            date: d,
            displayDate: new Date(d).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            }),
          };
          keys.forEach((k) => (acc[d][k] = 0));
        }
        const platformGroup = getGroupedPlatform(log, type);
        if (keys.includes(platformGroup)) {
          acc[d][platformGroup] += log.amount;
        } else {
          acc[d]["Other"] += log.amount;
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    return Object.keys(datesMap)
      .sort()
      .map((k) => datesMap[k]);
  };

  const transportData = buildChartTimelineData(rideLogs, "Ride", [
    "Uber",
    "Rapido",
    "Other",
  ]);
  const foodData = buildChartTimelineData(foodLogs, "Food", [
    "Zomato",
    "Swiggy",
    "Other",
  ]);
  const shoppingData = buildChartTimelineData(shoppingLogs, "Shopping", [
    "Blinkit",
    "Zepto",
    "Amazon",
    "Other",
  ]);

  const calculateTopProvider = (
    categoryLogs: Log[],
    type: "Ride" | "Food" | "Shopping",
    platforms: string[],
  ) => {
    if (categoryLogs.length === 0)
      return { name: "No Data", count: 0, total: 0 };
    const matrix = platforms.reduce(
      (acc, p) => {
        acc[p] = { count: 0, total: 0 };
        return acc;
      },
      {} as Record<string, any>,
    );

    categoryLogs.forEach((log) => {
      let group = getGroupedPlatform(log, type);
      if (!matrix[group]) group = "Other";
      matrix[group].count += 1;
      matrix[group].total += log.amount;
    });

    return Object.entries(matrix).reduce(
      (best: any, [name, val]: any) => {
        return val.count > best.count ? { name, ...val } : best;
      },
      { name: "Other", count: 0, total: 0 },
    );
  };

  const bestTransport = calculateTopProvider(rideLogs, "Ride", [
    "Uber",
    "Rapido",
    "Other",
  ]);
  const bestFood = calculateTopProvider(foodLogs, "Food", [
    "Zomato",
    "Swiggy",
    "Other",
  ]);
  const bestDeliveryApps = calculateTopProvider(shoppingLogs, "Shopping", [
    "Blinkit",
    "Zepto",
    "Amazon",
    "Other",
  ]);

  // FIX: Multi-format parsing mechanics to capture peak hour metrics precisely
  const officeHourLogs = rideLogs.filter((l) => {
    if (!l.time || l.time === "N/A") return false;
    const match = l.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return false;

    let hour = parseInt(match[1], 10);
    const meridiem = match[3];
    if (meridiem) {
      if (meridiem.toUpperCase() === "PM" && hour < 12) hour += 12;
      if (meridiem.toUpperCase() === "AM" && hour === 12) hour = 0;
    }
    return (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20);
  });

  const getPeakRate = (provider: string) => {
    const peakCommutes = officeHourLogs.filter(
      (l) => getGroupedPlatform(l, "Ride") === provider,
    );
    if (peakCommutes.length === 0) return null;
    return Math.round(
      peakCommutes.reduce((sum, l) => sum + l.amount, 0) / peakCommutes.length,
    );
  };

  const uberPeakAvg = getPeakRate("Uber");
  const rapidoPeakAvg = getPeakRate("Rapido");

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-800 border border-neutral-700 p-3 rounded-lg shadow-xl text-xs">
          <p className="font-bold text-neutral-300 mb-1.5">{label}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2 mb-0.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-neutral-400">{entry.name}:</span>
              <span className="font-bold text-white">₹{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* GRAPH SECTION 1: TRANSPORTATION */}
      <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-400 tracking-wider uppercase mb-2 px-1">
          🚕 Transport Comparison
        </h3>
        <div className="h-44 w-full -ml-4 text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transportData}>
              <XAxis dataKey="displayDate" stroke="#52525b" tickLine={false} />
              <YAxis
                stroke="#52525b"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }} />
              <Line
                type="monotone"
                dataKey="Uber"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Rapido"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Other"
                stroke="#a855f7"
                strokeWidth={1.5}
                dot={{ r: 1 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRAPH SECTION 2: FOOD DELIVERY */}
      <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-400 tracking-wider uppercase mb-2 px-1">
          🍛 Food App Comparison
        </h3>
        <div className="h-44 w-full -ml-4 text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={foodData}>
              <XAxis dataKey="displayDate" stroke="#52525b" tickLine={false} />
              <YAxis
                stroke="#52525b"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }} />
              <Line
                type="monotone"
                dataKey="Zomato"
                stroke="#e11d48"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Swiggy"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Other"
                stroke="#71717a"
                strokeWidth={1.5}
                dot={{ r: 1 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRAPH SECTION 3: QUICK COMMERCE / RETAIL */}
      <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-400 tracking-wider uppercase mb-2 px-1">
          🛍️ Quick Commerce & Store Delivery
        </h3>
        <div className="h-44 w-full -ml-4 text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={shoppingData}>
              <XAxis dataKey="displayDate" stroke="#52525b" tickLine={false} />
              <YAxis
                stroke="#52525b"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }} />
              <Line
                type="monotone"
                dataKey="Blinkit"
                stroke="#eab308"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Zepto"
                stroke="#ec4899"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Amazon"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Other"
                stroke="#78716c"
                strokeWidth={1.5}
                dot={{ r: 1 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PERIODIC ANALYSIS SUMMARIES */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-neutral-400 px-1 uppercase tracking-wider">
          Metrics Insights
        </h3>

        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex justify-between items-center shadow-md">
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase">
              Best Transport Service (By Frequency)
            </p>
            <p className="text-base font-black text-white mt-0.5">
              {bestTransport.name === "Other"
                ? "Manual/Auto"
                : bestTransport.name}
            </p>
            <p className="text-xs text-neutral-400">
              {bestTransport.count} rides completed this period
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-neutral-400 font-medium">
              Spent Volume
            </p>
            <p className="text-sm font-bold text-blue-400">
              ₹{bestTransport.total.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex justify-between items-center shadow-md">
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase">
              Best Food Delivery Platform
            </p>
            <p className="text-base font-black text-white mt-0.5">
              {bestFood.name}
            </p>
            <p className="text-xs text-neutral-400">
              {bestFood.count} fulfillment deliveries made
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-neutral-400 font-medium">
              Spent Volume
            </p>
            <p className="text-sm font-bold text-orange-400">
              ₹{bestFood.total.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex justify-between items-center shadow-md">
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase">
              Best Delivery Apps (Shopping)
            </p>
            <p className="text-base font-black text-white mt-0.5">
              {bestDeliveryApps.name}
            </p>
            <p className="text-xs text-neutral-400">
              {bestDeliveryApps.count} item fulfillments logged
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-neutral-400 font-medium">
              Spent Volume
            </p>
            <p className="text-sm font-bold text-emerald-400">
              ₹{bestDeliveryApps.total.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* SURGE INTEL HIGHLIGHT AREA */}
      <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-2 shadow-inner">
        <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wide flex items-center gap-1.5">
          ⚡ Surge Traffic Performance
        </h3>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-neutral-800/40 p-2.5 rounded-xl">
            <p className="text-[9px] text-neutral-400 font-bold uppercase">
              Uber Rush Hour Avg
            </p>
            <p className="text-base font-black text-red-400">
              {uberPeakAvg ? `₹${uberPeakAvg}` : "N/A"}
            </p>
          </div>
          <div className="bg-neutral-800/40 p-2.5 rounded-xl">
            <p className="text-[9px] text-neutral-400 font-bold uppercase">
              Rapido Rush Hour Avg
            </p>
            <p className="text-base font-black text-blue-400">
              {rapidoPeakAvg ? `₹${rapidoPeakAvg}` : "N/A"}
            </p>
          </div>
        </div>
        <p className="text-[10px] text-center text-neutral-500 pt-0.5">
          Calculated across {officeHourLogs.length} verified rush-hour data
          cycles.
        </p>
      </div>
    </div>
  );
}

// --- SCREEN: APPLICATION CONFIG (LOADS JSON DATA & CONFIGS HOMESTEAD SELECTIONS) ---
function SettingsScreen({ settings, setSettings, setLogs }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleJsonDataSync = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const fileContent = evt.target?.result as string;
        const parsedArray = JSON.parse(fileContent);

        if (Array.isArray(parsedArray)) {
          const processedLogs: Log[] = parsedArray.map(
            (node: any, idx: number) => ({
              id: node.id || String(idx + 1),
              type: node.type || "Other",
              amount: Number(node.amount) || 0,
              details: node.details || "",
              date: node.date || "N/A",
              time: node.time || "N/A",
              platform: node.platform || "Other",
              mode: node.mode || "N/A",
            }),
          );

          setLogs(processedLogs);
          alert(
            `Successfully loaded and synchronized ${processedLogs.length} entries from JSON data!`,
          );
        } else {
          alert(
            "Error: Top-level JSON configuration structure must be an Array.",
          );
        }
      } catch (err) {
        alert("Failed to parse the target JSON. Double check syntax validity.");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* DATA CONTROLS SECTION */}
      <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 space-y-4 shadow-md">
        <h2 className="text-base font-bold text-neutral-200 uppercase tracking-wide">
          Data Storage Management
        </h2>
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl space-y-3">
          <div>
            <p className="text-sm font-semibold text-blue-100">
              Synchronize Application JSON
            </p>
            <p className="text-[11px] text-blue-200/60 leading-relaxed mt-1">
              Select and import the exported 42-item array file to directly
              populate the data fields.
            </p>
          </div>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleJsonDataSync}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition"
          >
            Load Native Data File (.json)
          </button>
        </div>
      </div>

      {/* DESTINATION SELECTION CONFIGURATION */}
      <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 space-y-4 shadow-md">
        <h2 className="text-base font-bold text-neutral-200 uppercase tracking-wide">
          Nomad Location Anchors
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Current Base City
            </label>
            <input
              type="text"
              name="city"
              value={settings.city}
              onChange={handleTextChange}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Flat / Residential Quarter Area
            </label>
            <input
              type="text"
              name="flatArea"
              value={settings.flatArea}
              onChange={handleTextChange}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Friends House / Recurrent Social Hub Area
            </label>
            <input
              type="text"
              name="friendsArea"
              value={settings.friendsArea}
              onChange={handleTextChange}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SCREEN: SNAPSHOT SHARING INTERFACE ---
function ShareScreen({
  totalSpent,
  totalTransport,
  totalFood,
  totalShopping,
  settings,
}: any) {
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
              <span>🚕 Transport Total:</span>
              <span className="font-bold text-white">
                ₹{totalTransport.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 pb-1.5">
              <span>🍛 Culinary / Food Total:</span>
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
}
