import { Log, Settings } from "app/app";
import { useState } from "react";

// --- NEW SCREEN: FLIGHT TRACKER ---
export const FlightsScreen = ({
  logs,
  addLog,
  settings,
}: {
  logs: Log[];
  addLog: (log: Log) => void;
  settings: Settings;
}) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("12:00 PM");
  const [airline, setAirline] = useState("IndiGo");
  const [flightNum, setFlightNum] = useState("");
  const [title, setTitle] = useState("");

  const flightLogs = logs.filter((l) => l.type.toLowerCase() === "flight");
  const flightSpend = flightLogs.reduce((sum, l) => sum + l.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLog({
      id: crypto.randomUUID(),
      date,
      time,
      type: "Flight",
      title: title || `Flight to ${to || "Destination"}`,
      amount: Number(cost) || 0,
      details: `${airline} Flight ${flightNum}`.trim(),
      platform: airline,
      mode: flightNum || "Economy",
      from: from.toUpperCase().trim(),
      to: to.toUpperCase().trim(),
    });
    setFrom("");
    setTo("");
    setCost("");
    setFlightNum("");
    setTitle("");
  };

  return (
    <div className="space-y-6">
      {/* FLIGHT STATS METRIC CARD */}
      <div className="bg-gradient-to-br from-blue-900/40 to-neutral-900 p-5 rounded-2xl border border-blue-500/20 flex justify-between items-center shadow-lg">
        <div>
          <p className="text-[11px] text-blue-300 uppercase tracking-wider font-bold">
            Flight Bookings Overview
          </p>
          <p className="text-2xl font-black mt-0.5 text-white">
            ₹{flightSpend.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">
            {flightLogs.length} journeys scheduled
          </p>
        </div>
        <div className="text-3xl bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-blue-400">
          ✈️
        </div>
      </div>

      {/* FLIGHT BOOKING LOGGER FORM */}
      <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wide flex items-center gap-2">
          🛫 Record Flight Itinerary
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Trip Name
            </label>
            <input
              type="text"
              required
              placeholder="E.g. Summer Vacation, Tech Conference"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-sm focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                From (Origin)
              </label>
              <div className="flex gap-1 mb-1">
                <button
                  type="button"
                  onClick={() => setFrom(settings.city)}
                  className="text-[9px] bg-neutral-800 border border-neutral-700 text-neutral-400 p-1 rounded"
                >
                  📍 {settings.city}
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="E.g. HYD, BOM"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-sm uppercase text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                To (Destination)
              </label>
              <input
                type="text"
                required
                placeholder="E.g. DEL, BLR"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-sm uppercase text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Cost / Fare (₹)
              </label>
              <input
                type="number"
                required
                placeholder="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Airline Carrier
              </label>
              <select
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-sm text-white focus:outline-none"
              >
                <option value="IndiGo">IndiGo</option>
                <option value="Air India">Air India</option>
                <option value="Vistara">Vistara</option>
                <option value="Akasa Air">Akasa Air</option>
                <option value="SpiceJet">SpiceJet</option>
                <option value="Other Airline">Other / International</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Departure Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Departure Time
              </label>
              <input
                type="text"
                placeholder="E.g. 06:15 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Flight No. / Reference Code
            </label>
            <input
              type="text"
              placeholder="E.g. 6E-2432"
              value={flightNum}
              onChange={(e) => setFlightNum(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-sm uppercase focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl transition shadow-md text-sm mt-2"
          >
            Log Flight Schedule ✈️
          </button>
        </form>
      </div>

      {/* FLIGHT SCHEDULE LIST VIEW */}
      <div>
        <h4 className="text-sm font-bold text-neutral-400 mb-2 px-1">
          Upcoming & Historical Flights
        </h4>
        {flightLogs.length === 0 ? (
          <div className="text-center py-8 text-neutral-600 bg-neutral-900 rounded-2xl border border-neutral-800 text-xs">
            No flight vectors entered yet.
          </div>
        ) : (
          <div className="space-y-2">
            {flightLogs.map((log) => (
              <div
                key={log.id}
                className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg bg-blue-900/20 p-2 rounded-lg border border-blue-500/20 text-blue-400">
                    🛫
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-200">
                      {log.title}
                    </h4>
                    <p className="text-xs font-black text-blue-400 uppercase tracking-wide mt-0.5">
                      {log.from} ➔ {log.to}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      {log.date} • {log.time} • {log.platform}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-neutral-100">
                    ₹{log.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-neutral-500 italic mt-0.5">
                    {log.mode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
