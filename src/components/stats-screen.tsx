import { Log } from "app/app";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// --- SCREEN: STATS DISPLAY (INCLUDES THREE INDEPENDENT SEGMENT CHARTS) ---
export const StatsScreen = ({ logs }: { logs: Log[]; totalSpent: number }) => {
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
};
