import React, { useState, useEffect, useRef } from "react";
import { toPng } from "html-to-image";

// --- TYPES & INTERFACES ---
type TabType = "home" | "log" | "stats" | "share" | "settings";
type SleepLocation = "Flat/Hotel" | "Friends" | "Hotel"; // 'Hotel' included for backwards compatibility with old localStorage data

interface Log {
  id: string;
  date: string;
  sleptAt: SleepLocation;
  transportSpend: number;
  foodSpend: number;
  notes: string;
}

interface Settings {
  city: string;
  flatArea: string;
  friendsArea: string;
}

// --- ICONS ---
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

function App() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [currentTab, setCurrentTab] = useState<TabType>("home");

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem("nomad-settings");
    return saved
      ? JSON.parse(saved)
      : {
          city: "Hyderabad",
          flatArea: "Madhapur",
          friendsArea: "Tolichowki",
        };
  });

  const [date] = useState<string>(new Date().toISOString().split("T")[0]);
  const [sleptAt, setSleptAt] = useState<SleepLocation>("Flat/Hotel");
  const [transportSpend, setTransportSpend] = useState<string>("");
  const [foodSpend, setFoodSpend] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    const savedLogs = localStorage.getItem("nomad-logs");
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  useEffect(() => {
    localStorage.setItem("nomad-logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("nomad-settings", JSON.stringify(settings));
  }, [settings]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newLog: Log = {
      id: crypto.randomUUID(),
      date,
      sleptAt,
      transportSpend: Number(transportSpend) || 0,
      foodSpend: Number(foodSpend) || 0,
      notes,
    };
    setLogs([newLog, ...logs]);
    setTransportSpend("");
    setFoodSpend("");
    setNotes("");
    setCurrentTab("home");
  };

  const deleteLog = (id: string) =>
    setLogs(logs.filter((log) => log.id !== id));

  const totalTransport = logs.reduce((sum, log) => sum + log.transportSpend, 0);
  const totalFood = logs.reduce((sum, log) => sum + log.foodSpend, 0);
  const totalSpent = totalTransport + totalFood;

  const flatNights = logs.filter(
    (log) => log.sleptAt === "Flat/Hotel" || log.sleptAt === "Hotel",
  ).length;
  const friendsNights = logs.filter((log) => log.sleptAt === "Friends").length;

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const daySpends = [400, 700, 300, 890, 500, 1100, 600];

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
          <LogScreen
            handleSubmit={handleSubmit}
            sleptAt={sleptAt}
            setSleptAt={setSleptAt}
            transportSpend={transportSpend}
            setTransportSpend={setTransportSpend}
            foodSpend={foodSpend}
            setFoodSpend={setFoodSpend}
            notes={notes}
            setNotes={setNotes}
            date={date}
          />
        )}

        {currentTab === "stats" && (
          <StatsScreen
            totalSpent={totalSpent}
            flatNights={flatNights}
            friendsNights={friendsNights}
            dayLabels={dayLabels}
            daySpends={daySpends}
          />
        )}

        {currentTab === "share" && (
          <ShareScreen
            totalSpent={totalSpent}
            totalTransport={totalTransport}
            totalFood={totalFood}
            flatNights={flatNights}
            friendsNights={friendsNights}
            settings={settings}
          />
        )}

        {currentTab === "settings" && (
          <SettingsScreen settings={settings} setSettings={setSettings} />
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

// --- SUB-COMPONENTS ---

interface NavItemProps {
  icon: React.FC;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  active,
  onClick,
}) => (
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

interface SettingsScreenProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  setSettings,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">App Config</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
            Base City / Region
          </label>
          <input
            type="text"
            name="city"
            value={settings.city}
            onChange={handleChange}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
            Flat/Hotel Neighborhood
          </label>
          <input
            type="text"
            name="flatArea"
            value={settings.flatArea}
            onChange={handleChange}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
            Friend's Neighborhood
          </label>
          <input
            type="text"
            name="friendsArea"
            value={settings.friendsArea}
            onChange={handleChange}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
          />
        </div>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400/90 p-4 rounded-xl text-xs leading-relaxed text-center">
        Changes are saved automatically.
      </div>
    </div>
  );
};

interface HomeScreenProps {
  logs: Log[];
  deleteLog: (id: string) => void;
  totalSpent: number;
  settings: Settings;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  logs,
  deleteLog,
  totalSpent,
  settings,
}) => {
  const formatDay = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { weekday: "short" });

  return (
    <div className="space-y-6 animation-fade-in">
      <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 flex justify-between items-center">
        <div>
          <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
            This Week
          </p>
          <p className="text-2xl font-black mt-1">
            ₹{totalSpent.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-neutral-800 text-neutral-300 text-xs px-3 py-1.5 rounded-xl border border-neutral-700">
          📍 {settings.flatArea}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-neutral-400 mb-3 px-1">
          Recent logs
        </h2>
        {logs.length === 0 ? (
          <div className="text-center py-16 text-neutral-600 bg-neutral-900 rounded-2xl border-2 border-dashed border-neutral-800">
            No logs yet. Tap "Log" to begin!
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const isBase =
                log.sleptAt === "Flat/Hotel" || log.sleptAt === "Hotel";
              return (
                <div
                  key={log.id}
                  className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isBase ? "bg-indigo-950/60 text-indigo-400" : "bg-emerald-950/60 text-emerald-400"}`}
                    >
                      {isBase ? "🏢" : "🏠"}
                    </div>
                    <div>
                      <p className="font-bold text-base">
                        {formatDay(log.date)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {isBase ? "Flat/Hotel" : "Friends"} ·{" "}
                        {log.notes
                          ? `"${log.notes.slice(0, 18)}..."`
                          : "No notes"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base text-neutral-100">
                      ₹
                      {(log.transportSpend + log.foodSpend).toLocaleString(
                        "en-IN",
                      )}
                    </p>
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="text-[11px] text-red-500/70 hover:text-red-400 transition mt-0.5 opacity-0 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

interface LogScreenProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  sleptAt: SleepLocation;
  setSleptAt: React.Dispatch<React.SetStateAction<SleepLocation>>;
  transportSpend: string;
  setTransportSpend: React.Dispatch<React.SetStateAction<string>>;
  foodSpend: string;
  setFoodSpend: React.Dispatch<React.SetStateAction<string>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  date: string;
}

const LogScreen: React.FC<LogScreenProps> = ({
  handleSubmit,
  sleptAt,
  setSleptAt,
  transportSpend,
  setTransportSpend,
  foodSpend,
  setFoodSpend,
  notes,
  setNotes,
  date,
}) => {
  return (
    <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Log today</h2>
        <span className="text-xs text-neutral-400 bg-neutral-800 px-2.5 py-1 rounded-md border border-neutral-700">
          {new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-2">
            Where did you sleep?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSleptAt("Flat/Hotel")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${sleptAt === "Flat/Hotel" || sleptAt === "Hotel" ? "bg-white text-neutral-900 border-white" : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-neutral-600"}`}
            >
              🏢 Flat/Hotel
            </button>
            <button
              type="button"
              onClick={() => setSleptAt("Friends")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${sleptAt === "Friends" ? "bg-white text-neutral-900 border-white" : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-neutral-600"}`}
            >
              🏠 Friends
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
              Transport spent (₹)
            </label>
            <input
              type="number"
              placeholder="350"
              value={transportSpend}
              onChange={(e) => setTransportSpend(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
              Food spent (₹)
            </label>
            <input
              type="number"
              placeholder="280"
              value={foodSpend}
              onChange={(e) => setFoodSpend(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
            Any issues today?
          </label>
          <textarea
            placeholder="Water, heat, surge..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 min-h-[90px]"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-1.5 text-sm"
        >
          Save day
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

interface StatsScreenProps {
  totalSpent: number;
  flatNights: number;
  friendsNights: number;
  dayLabels: string[];
  daySpends: number[];
}

const StatsScreen: React.FC<StatsScreenProps> = ({
  totalSpent,
  flatNights,
  friendsNights,
  dayLabels,
  daySpends,
}) => {
  const maxSpend = Math.max(...daySpends);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold">This week</h2>
        <span className="text-xs text-neutral-400">May 13–20</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
          <p className="text-xs text-neutral-400 font-medium">Total spent</p>
          <p className="text-2xl font-black mt-1">
            ₹{totalSpent.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-0.5">
            ↑ vs last week
          </p>
        </div>
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
          <p className="text-xs text-neutral-400 font-medium">Trips taken</p>
          <p className="text-2xl font-black mt-1">
            {flatNights + friendsNights}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Rapido · Uber</p>
        </div>
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
          <p className="text-xs text-neutral-400 font-medium">
            Flat/Hotel nights
          </p>
          <p className="text-2xl font-black mt-1">{flatNights}</p>
          <p className="text-[11px] text-neutral-500 mt-1">base mode</p>
        </div>
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
          <p className="text-xs text-neutral-400 font-medium">Friends nights</p>
          <p className="text-2xl font-black mt-1">{friendsNights}</p>
          <p className="text-[11px] text-neutral-500 mt-1">dinners there</p>
        </div>
      </div>

      <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 space-y-4">
        <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
          Daily spend
        </p>

        <div className="flex justify-between items-end h-28 pt-4 px-2">
          {daySpends.map((spend, index) => {
            const barHeight = maxSpend ? `${(spend / maxSpend) * 100}%` : "10%";
            return (
              <div
                key={index}
                className="flex flex-col items-center gap-2 h-full justify-end w-8"
              >
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${index === 3 || index === 5 ? "bg-blue-500" : "bg-neutral-800"}`}
                  style={{ height: barHeight }}
                ></div>
                <span className="text-xs text-neutral-500 font-bold">
                  {dayLabels[index]}
                </span>
              </div>
            );
          })}
        </div>

        <div className="bg-amber-50/5 text-amber-200/90 p-4 rounded-xl border border-amber-500/10 text-xs leading-relaxed">
          ⚡ <strong className="text-amber-100">Pattern found:</strong> Thursday
          and Saturday are your most expensive days. Avg ₹550 vs ₹280 weekdays.
        </div>
      </div>
    </div>
  );
};

interface ShareScreenProps {
  totalSpent: number;
  totalTransport: number;
  totalFood: number;
  flatNights: number;
  friendsNights: number;
  settings: Settings;
}

const ShareScreen: React.FC<ShareScreenProps> = ({
  totalSpent,
  totalTransport,
  totalFood,
  flatNights,
  friendsNights,
  settings,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
      });
      const link = document.createElement("a");
      link.download = "nomad-tracker-week.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export image", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleWhatsApp = () => {
    const text = `Hey! Check out my week living nomadically in ${settings.city}: \n\n💸 Total Spent: ₹${totalSpent}\n🚕 Transport: ₹${totalTransport}\n🍛 Food: ₹${totalFood}\n🏢 Flat/Hotel: ${flatNights} nights\n🏠 Friends: ${friendsNights} nights\n\nBuilt with Nomad Tracker 📍`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-bold">Share</h2>
        <span className="text-xs text-neutral-400 bg-neutral-800 px-2.5 py-1 rounded-md border border-neutral-700">
          Week 3
        </span>
      </div>

      <p className="text-sm font-medium text-neutral-400 px-1">
        Your share card
      </p>

      <div
        ref={cardRef}
        className="bg-[#111827] rounded-3xl p-6 border border-neutral-800 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <p className="text-xs text-blue-200/60 font-bold tracking-widest uppercase mb-1">
            {(settings.flatArea || "").toUpperCase()} ↔{" "}
            {(settings.friendsArea || "").toUpperCase()} · WEEK 3
          </p>
          <h3 className="text-4xl font-black text-white mb-6">
            ₹{totalSpent.toLocaleString("en-IN")}{" "}
            <span className="text-lg text-neutral-400 font-medium">spent</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-neutral-800/80 backdrop-blur-sm p-4 rounded-2xl border border-neutral-700/50">
              <p className="text-xs text-neutral-400 font-medium mb-1">
                Transport
              </p>
              <p className="text-xl font-bold text-white">
                ₹{totalTransport.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-neutral-800/80 backdrop-blur-sm p-4 rounded-2xl border border-neutral-700/50">
              <p className="text-xs text-neutral-400 font-medium mb-1">Food</p>
              <p className="text-xl font-bold text-white">
                ₹{totalFood.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-neutral-800/80 backdrop-blur-sm p-4 rounded-2xl border border-neutral-700/50">
              <p className="text-xs text-neutral-400 font-medium mb-1">
                Flat/Hotel
              </p>
              <p className="text-xl font-bold text-white">{flatNights} 🏢</p>
            </div>
            <div className="bg-neutral-800/80 backdrop-blur-sm p-4 rounded-2xl border border-neutral-700/50">
              <p className="text-xs text-neutral-400 font-medium mb-1">
                Friends nights
              </p>
              <p className="text-xl font-bold text-white">{friendsNights} 🏠</p>
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-neutral-800/80 pt-4">
            <p className="text-[10px] text-neutral-500 leading-tight">
              {flatNights + friendsNights} trips · Rapido + Uber
            </p>
            <p className="text-[10px] text-neutral-500 font-medium">
              built with nomad tracker
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full bg-[#1e293b] hover:bg-[#334155] text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 border border-slate-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          {isDownloading ? "Generating Image..." : "Download card"}
        </button>

        <button
          onClick={handleWhatsApp}
          className="w-full bg-[#1e293b] hover:bg-[#334155] text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 border border-slate-700"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
          Share to WhatsApp
        </button>
      </div>
    </div>
  );
};

export default App;
