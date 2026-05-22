import React, { useState, useEffect } from "react";

import { ShareScreen } from "components/share-screen";
import { StatsScreen } from "components/stats-screen";
import { SettingsScreen } from "components/settings-screen";
import { FlightsScreen } from "components/flights-screen";
import { LogScreen } from "components/log-screen";
import { HomeScreen } from "components/home-screen";

// --- TYPES & INTERFACES ---
type TabType = "home" | "log" | "flights" | "stats" | "share" | "settings";
type ExpenseType = "Ride" | "Food" | "Shopping" | "Flight" | string;

export interface Log {
  id: string;
  date: string;
  time?: string;
  type: ExpenseType;
  title: string;
  amount: number;
  details: string;
  platform: string; // Maps to Airline for flights
  mode: string; // Maps to Flight Number or Class
  from?: string; // Flight specific origin
  to?: string; // Flight specific destination
}

export interface Settings {
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
const FlightIcon: React.FC = () => (
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
      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L6 12Zm0 0h7.5"
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
  const totalFlights = logs
    .filter((l) => l.type.toLowerCase() === "flight")
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
        {currentTab === "flights" && (
          <FlightsScreen logs={logs} addLog={addLog} settings={settings} />
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
            totalFlights={totalFlights}
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

      <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900/90 backdrop-blur-md border-t border-neutral-800 px-2 py-3 flex justify-between items-center max-w-md mx-auto shadow-2xl rounded-t-2xl z-50">
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
          icon={FlightIcon}
          label="Flights"
          active={currentTab === "flights"}
          onClick={() => setCurrentTab("flights")}
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
    className={`flex flex-col items-center gap-1 p-1.5 relative transition w-14 ${active ? "text-white" : "text-neutral-500 hover:text-neutral-400"}`}
  >
    <Icon />
    <span className="text-[9px] font-medium">{label}</span>
    {active && (
      <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></div>
    )}
  </button>
);
