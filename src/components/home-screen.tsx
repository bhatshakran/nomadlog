import { Log } from "app/app";

// --- SCREEN: HOME DISPLAY ---
export const HomeScreen = ({ logs, deleteLog, totalSpent, settings }: any) => {
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
    if (t === "flight") return "✈️";
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
                      {log.title || log.details || log.type}
                    </p>
                    {log.type.toLowerCase() === "flight" &&
                    log.from &&
                    log.to ? (
                      <p className="text-xs text-blue-400 font-bold tracking-wide mt-0.5">
                        {log.from} ➔ {log.to}
                      </p>
                    ) : log.title &&
                      log.details &&
                      log.title !== log.details ? (
                      <p className="text-[11px] text-neutral-400 truncate italic mb-0.5">
                        {log.details}
                      </p>
                    ) : null}
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                      {formatDay(log.date)} {log.time && `• ${log.time}`} •{" "}
                      <span className="text-neutral-400 font-medium">
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
};
