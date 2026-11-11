import React, { useState, useEffect } from "react";
import {
  FaChartPie, FaClock, FaListAlt, FaPlay, FaStop, FaCalendarDay, FaCalendarCheck, FaRoad
} from "react-icons/fa";
import VoiceInput from "./components/VoiceInput";

function formatUKDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default function DashboardPage({
  jobs,
  clients,
  sessions,
  invoices,
  handleManualEntry,
  handleAddDayItem,
  setActiveView
}) {
  const [globalStart, setGlobalStart] = useState(() => {
    const saved = localStorage.getItem("globalTimerStart");
    return saved ? parseInt(saved, 10) : null;
  });
  const [showStopModal, setShowStopModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [dayType, setDayType] = useState('day');
  const [formClientId, setFormClientId] = useState("");
  const [formJobId, setFormJobId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formMiles, setFormMiles] = useState("");

  const isAnyModalOpen = showStopModal || showDayModal;

  useEffect(() => {
    if (isAnyModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isAnyModalOpen]);

  const handleStartGlobal = () => {
    const now = Date.now();
    setGlobalStart(now);
    localStorage.setItem("globalTimerStart", now.toString());
  };

  const handleStopGlobalClick = () => {
    setShowStopModal(true);
  };

  const submitStopGlobal = () => {
    if (!formJobId) {
      alert("Please select a job.");
      return;
    }
    const end = Date.now();
    const start = globalStart || end;
    const durationMs = end - start;
    const durationRound = Math.ceil(durationMs / 60000 / 15) * 15 * 60000; // Round to 15m like others
    if (handleManualEntry) {
      handleManualEntry(formJobId, {
        startTime: start,
        endTime: end,
        duration: durationRound,
        description: formDescription
      });
    }
    setGlobalStart(null);
    localStorage.removeItem("globalTimerStart");
    setShowStopModal(false);
    setFormClientId("");
    setFormJobId("");
    setFormDescription("");
  };

  const handleDiscardTimer = () => {
    if (window.confirm("Are you sure you want to discard this timer? Information will be lost.")) {
      setGlobalStart(null);
      localStorage.removeItem("globalTimerStart");
      setShowStopModal(false);
      setFormClientId("");
      setFormJobId("");
      setFormDescription("");
    }
  };

  const openDayModal = (type) => {
    setDayType(type);
    setFormDate(new Date().toISOString().substring(0, 10));
    setShowDayModal(true);
  };

  const submitDayForm = () => {
    if (!formJobId || !formDate) {
      alert("Please select a job and date.");
      return;
    }
    if (dayType === 'mileage' && (!formMiles || parseFloat(formMiles) <= 0)) {
      alert("Please enter a valid number of miles.");
      return;
    }
    if (handleAddDayItem) {
      handleAddDayItem(formJobId, {
        date: new Date(formDate).getTime(),
        type: dayType,
        miles: dayType === 'mileage' ? parseFloat(formMiles) : undefined
      });
    }
    setShowDayModal(false);
    setFormClientId("");
    setFormJobId("");
    setFormMiles("");
  };

  const activeClients = clients.filter(c => !c.isArchived);
  const filteredJobs = jobs.filter(j => j.clientId === formClientId && !j.isArchived);
  // const [menuOpen, setMenuOpen] = useState(false); // Removed
  // const runningSessions = sessions.filter(s => !s.endTime); // Kept for Running Timers
  // Metrics removed per user request

  // Show only the latest 5 sessions in newest first order
  const runningSessions = sessions.filter(s => !s.endTime);
  const latestSessions = [...sessions]
    .sort((a, b) => (b.startTime || 0) - (a.startTime || 0))
    .slice(0, 5);

  return (
    <div className="p-2 md:p-4" style={{ minHeight: "100vh" }}>
      {/* Mobile Dropdown Menu Button on the left */}
      {/* Mobile Menu Removed */}
      <h2 className="text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 text-slate-800" style={{ justifyContent: "center" }}>
        <FaChartPie className="text-indigo-600" /> Dashboard
      </h2>

      <div className="flex flex-col gap-4 mb-6" style={{ alignItems: "center" }}>
        <div className="flex gap-4 items-center">
          {globalStart ? (
            <button onClick={handleStopGlobalClick} className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-lg flex items-center gap-2 text-xl transition-transform hover:scale-105">
              <FaStop /> Stop Timer
            </button>
          ) : (
            <button onClick={handleStartGlobal} className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full shadow-lg flex items-center gap-2 text-xl transition-transform hover:scale-105">
              <FaPlay /> Start Timer
            </button>
          )}
        </div>
        <div className="flex gap-4">
          <button onClick={() => openDayModal('halfDay')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded shadow-md flex items-center gap-2 text-lg transition-transform hover:scale-105">
            <FaCalendarCheck /> Log 1/2 Day
          </button>
          <button onClick={() => openDayModal('day')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded shadow-md flex items-center gap-2 text-lg transition-transform hover:scale-105">
            <FaCalendarDay /> Log Day
          </button>
          <button onClick={() => openDayModal('mileage')} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded shadow-md flex items-center gap-2 text-lg transition-transform hover:scale-105">
            <FaRoad /> Log Mileage
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6" style={{ gridTemplateColumns: "1fr", display: "grid" }}>
        {/* On medium screens and up, use 3 columns */}
        <div className="md:grid md:grid-cols-2 md:gap-6" style={{ display: "contents" }}>
          {/* Running Timers */}
          <div className="app-card bg-white transition hover:scale-105 hover:shadow-lg" style={{ marginBottom: 12, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "16px" }}>
            <h3 className="font-bold text-blue-700 mb-2 flex items-center gap-1"><FaClock /> Running Timers</h3>
            {runningSessions.length === 0 ? (
              <div className="text-gray-500">No timers running</div>
            ) : (
              <ul>
                {runningSessions.map(s => {
                  const job = jobs.find(j => j.id === s.jobId);
                  const client = job ? clients.find(c => c.id === job.clientId) : null;
                  return (
                    <li key={s.id} className="mb-2">
                      <span className="font-semibold">{job?.name}</span>
                      {client && <span> ({client.name})</span>}<br />
                      Started: {formatUKDate(s.startTime)}<br />
                      Elapsed: {formatTime(Date.now() - s.startTime)}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {/* Recent Activity */}
          <div className="app-card bg-white transition hover:scale-105 hover:shadow-lg" style={{ marginBottom: 12, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "16px" }}>
            <h3 className="font-bold text-blue-700 mb-2 flex items-center gap-1"><FaListAlt /> Recent Activity</h3>
            {latestSessions.length === 0 ? (
              <div className="text-gray-500">No recent sessions</div>
            ) : (
              <ul>
                {latestSessions.map(s => {
                  const job = jobs.find(j => j.id === s.jobId);
                  const client = job ? clients.find(c => c.id === job.clientId) : null;
                  return (
                    <li key={s.id} className="mb-2">
                      <span className="font-semibold">{job?.name}</span>
                      {client && <span> ({client.name})</span>}<br />
                      {formatUKDate(s.startTime)} – {formatUKDate(s.endTime)}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
      {/* Footer - mobile friendly */}
      {/* Footer Removed */}

      {/* Stop Timer Modal */}
      {showStopModal && (
        <div className="fixed inset-0 z-[2000] bg-black bg-opacity-40 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 w-full max-w-lg relative" style={{ zIndex: 2001 }}>
              <h3 className="text-xl font-bold mb-4 text-indigo-600">Assign Time (v2)</h3>
              <p className="mb-4 text-gray-700">Elapsed: {formatTime(Date.now() - (globalStart || Date.now()))}</p>
              <div className="grid grid-cols-1 gap-3">
                <select
                  className="p-3 border rounded w-full text-slate-900 bg-white"
                  value={formClientId}
                  onChange={e => { setFormClientId(e.target.value); setFormJobId(""); }}
                >
                  <option value="">Select Client</option>
                  {activeClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select
                  className="p-3 border rounded w-full text-slate-900 bg-white"
                  value={formJobId}
                  onChange={e => setFormJobId(e.target.value)}
                  disabled={!formClientId}
                >
                  <option value="">Select Job</option>
                  {filteredJobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
                <div className="relative">
                  <textarea
                    className="p-3 border rounded w-full text-slate-900 bg-white pr-12"
                    placeholder="Description / Notes (optional)"
                    rows={3}
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                  />
                  <div className="absolute right-2 bottom-2">
                    <VoiceInput 
                      onTranscription={(text) => setFormDescription(prev => prev ? `${prev} ${text}` : text)} 
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full font-bold" onClick={submitStopGlobal}>Save Entry</button>
                <div className="flex gap-2">
                  <button className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded flex-1 text-sm font-semibold" onClick={handleDiscardTimer}>Discard</button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded flex-1 text-sm font-semibold" onClick={() => setShowStopModal(false)}>Cancel</button>
                </div>
              </div>
              <button className="absolute top-2 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowStopModal(false)} title="Close">&times;</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Day Item Modal */}
      {showDayModal && (
        <div className="fixed inset-0 z-[2000] bg-black bg-opacity-40 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 w-full max-w-lg relative" style={{ zIndex: 2001 }}>
              <h3 className="text-xl font-bold mb-4 text-indigo-600">Log {dayType === 'day' ? '1 Day (v2)' : dayType === 'halfDay' ? '1/2 Day (v2)' : 'Mileage (v2)'}</h3>
              <div className="grid grid-cols-1 gap-3">
                <select
                  className="p-3 border rounded w-full text-slate-900 bg-white"
                  value={formClientId}
                  onChange={e => { setFormClientId(e.target.value); setFormJobId(""); }}
                >
                  <option value="">Select Client</option>
                  {activeClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select
                  className="p-3 border rounded w-full text-slate-900 bg-white"
                  value={formJobId}
                  onChange={e => setFormJobId(e.target.value)}
                  disabled={!formClientId}
                >
                  <option value="">Select Job</option>
                  {filteredJobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
                <input type="date" className="p-3 border rounded w-full text-slate-900 bg-white" value={formDate} onChange={e => setFormDate(e.target.value)} />
                {dayType === 'mileage' && (
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Total Miles"
                    className="p-3 border rounded w-full text-slate-900 bg-white"
                    value={formMiles}
                    onChange={e => setFormMiles(e.target.value)}
                  />
                )}
              </div>
              <div className="flex gap-2 mt-6">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex-1" onClick={submitDayForm}>Save Entry</button>
                <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded flex-1" onClick={() => setShowDayModal(false)}>Cancel</button>
              </div>
              <button className="absolute top-2 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowDayModal(false)} title="Close">&times;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}