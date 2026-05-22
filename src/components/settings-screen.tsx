import { Log } from "app/app";
import { useRef } from "react";

// --- SCREEN: APPLICATION CONFIG ---
export const SettingsScreen = ({ settings, setSettings, setLogs }: any) => {
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
