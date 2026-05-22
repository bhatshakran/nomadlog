import React, { useRef } from "react";
import { Log, Settings } from "app/app";
import { saveAllLogsToDB } from "../db";

interface SettingsScreenProps {
  logs: Log[]; // 1. Added logs array directly as a prop to guarantee reliable exports
  settings: Settings;
  setSettings: (s: Settings) => Promise<void> | void;
  setLogs: (l: Log[]) => void;
}

export const SettingsScreen = ({
  logs,
  settings,
  setSettings,
  setLogs,
}: SettingsScreenProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  // --- BULLETPROOF EXPORT UTILITY ---
  const handleExportBackup = () => {
    try {
      // 2. Uses the live parent state array directly instead of re-querying IndexedDB mid-click
      const backupData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        settings: settings,
        logs: logs, // Safe, immediate, and fully populated
      };

      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement("a");

      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `nomad_tracker_backup_${new Date().toISOString().split("T")[0]}.json`,
      );

      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Failed to generate data export:", err);
      alert("Error: Failed to safely compile database tracking backup.");
    }
  };

  // --- BULLETPROOF IMPORT UTILITY ---
  const handleJsonDataSync = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const fileContent = evt.target?.result as string;
        const parsedData = JSON.parse(fileContent);

        // Fallback checks for legacy flat arrays or structured backup profiles
        const incomingLogs = Array.isArray(parsedData)
          ? parsedData
          : parsedData.logs;
        const incomingSettings = !Array.isArray(parsedData)
          ? parsedData.settings
          : null;

        if (Array.isArray(incomingLogs)) {
          const processedLogs: Log[] = incomingLogs.map(
            (node: any, idx: number) => {
              let parsedTitle = node.title || "";
              if (!parsedTitle && node.details) {
                parsedTitle = node.details.split(" from ")[0].split(" (")[0];
              }

              return {
                id: node.id || String(idx + 1),
                type: node.type || "Other",
                title: parsedTitle || node.type,
                amount: Number(node.amount) || 0,
                details: node.details || "",
                date: node.date || "N/A",
                time: node.time || "N/A",
                platform: node.platform || "Other",
                mode: node.mode || "N/A",
                from: node.from || "",
                to: node.to || "",
              };
            },
          );

          // 3. Chain asynchronously to guarantee disk synchronization handles completely
          saveAllLogsToDB(processedLogs)
            .then(() => {
              setLogs(processedLogs);
              if (incomingSettings) {
                setSettings(incomingSettings);
              }
              alert(
                `Successfully synchronized ${processedLogs.length} entries onto your browser database disk thread!`,
              );
            })
            .catch((dbErr) => {
              console.error("IndexedDB write failure:", dbErr);
              alert(
                "Data processed, but failed to write permanently to database disk.",
              );
            });
        } else {
          alert(
            "Error: Target JSON tracking file structure must contain a valid logs Array.",
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

        <div className="space-y-3">
          {/* IMPORT CARD COMPONENT */}
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl space-y-3">
            <div>
              <p className="text-sm font-semibold text-blue-100">
                Synchronize Application JSON
              </p>
              <p className="text-[11px] text-blue-200/60 leading-relaxed mt-1">
                Select and import an array file to directly populate the data
                fields inside your browser database store.
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition shadow-sm"
            >
              📥 Load Native Data File (.json)
            </button>
          </div>

          {/* EXPORT CARD COMPONENT */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-3">
            <div>
              <p className="text-sm font-semibold text-emerald-100">
                Export Local Backup
              </p>
              <p className="text-[11px] text-emerald-200/60 leading-relaxed mt-1">
                Download your complete database configuration state right now.
                Tap this to back up your records safely.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-sm transition shadow-sm"
            >
              📦 Download Full JSON Backup
            </button>
          </div>
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
              Friends House Area
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
};
