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
      <h2 className="text-2xl font-extrabold mb-6 flex items-center justify-center gap-2.5 text-slate-900 tracking-tight">
        <FaChartPie className="text-blue-700" /> Dashboard
      </h2>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6 flex flex-col gap-5 items-center">
        <div className="flex gap-4 items-center">
          {globalStart ? (
            <button onClick={handleStopGlobalClick} className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-9 rounded-full shadow-lg shadow-red-600/25 flex items-center gap-2.5 text-lg transition-all hover:scale-[1.02]">
              <FaStop /> Stop Timer
            </button>
          ) : (
            <button onClick={handleStartGlobal} className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-9 rounded-full shadow-lg shadow-blue-700/25 flex items-center gap-2.5 text-lg transition-all hover:scale-[1.02]">
              <FaPlay /> Start Timer
            </button>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => openDayModal('halfDay')} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm flex items-center gap-2 text-sm transition-colors">
            <FaCalendarCheck /> Log 1/2 Day
          </button>
          <button onClick={() => openDayModal('day')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm flex items-center gap-2 text-sm transition-colors">
            <FaCalendarDay /> Log Day
          </button>
          <button onClick={() => openDayModal('mileage')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm flex items-center gap-2 text-sm transition-colors">
            <FaRoad /> Log Mileage
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Running Timers */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-base">
            <FaClock className="text-blue-700" /> Running Timers
          </h3>
          {runningSessions.length === 0 ? (
            <div className="text-sm text-slate-500">No timers currently running.</div>
          ) : (
            <ul className="space-y-3 text-sm">
              {runningSessions.map(s => {
                const job = jobs.find(j => j.id === s.jobId);
                const client = job ? clients.find(c => c.id === job.clientId) : null;
                return (
                  <li key={s.id} className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                    <div className="font-bold text-slate-900">
                      {job?.name} {client && <span className="font-medium text-slate-600">({client.name})</span>}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Started: {formatUKDate(s.startTime)} &bull; Elapsed: <strong className="text-blue-700">{formatTime(Date.now() - s.startTime)}</strong>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {/* Recent Activity */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-base">
            <FaListAlt className="text-orange-500" /> Recent Activity
          </h3>
          {latestSessions.length === 0 ? (
            <div className="text-sm text-slate-500">No recent sessions.</div>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {latestSessions.map(s => {
                const job = jobs.find(j => j.id === s.jobId);
                const client = job ? clients.find(c => c.id === job.clientId) : null;
                return (
                  <li key={s.id} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="font-semibold text-slate-900">
                      {job?.name} {client && <span className="font-normal text-slate-500">({client.name})</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {formatUKDate(s.startTime)} &ndash; {formatUKDate(s.endTime)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Stop Timer Modal */}
      {showStopModal && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/50 backdrop-blur-xs overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-lg relative" style={{ zIndex: 2001 }}>
              <h3 className="text-xl font-extrabold mb-2 text-slate-900">Assign Time</h3>
              <p className="mb-4 text-sm text-slate-600">
                Elapsed: <strong className="text-blue-700">{formatTime(Date.now() - (globalStart || Date.now()))}</strong>
              </p>
              <div className="grid grid-cols-1 gap-3">
                <select
                  className="p-3 border border-slate-300 rounded-xl w-full text-sm text-slate-900 bg-white focus:border-blue-600 outline-none"
                  value={formClientId}
                  onChange={e => { setFormClientId(e.target.value); setFormJobId(""); }}
                >
                  <option value="">Select Client</option>
                  {activeClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select
                  className="p-3 border border-slate-300 rounded-xl w-full text-sm text-slate-900 bg-white focus:border-blue-600 outline-none disabled:bg-slate-50"
                  value={formJobId}
                  onChange={e => setFormJobId(e.target.value)}
                  disabled={!formClientId}
                >
                  <option value="">Select Job</option>
                  {filteredJobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
                <div className="relative">
                  <textarea
                    className="p-3 border border-slate-300 rounded-xl w-full text-sm text-slate-900 bg-white pr-12 focus:border-blue-600 outline-none"
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
                <button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl w-full font-bold text-sm transition-colors" onClick={submitStopGlobal}>Save Entry</button>
                <div className="flex gap-2">
                  <button className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-xl flex-1 text-sm font-semibold transition-colors" onClick={handleDiscardTimer}>Discard</button>
                  <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl flex-1 text-sm font-semibold transition-colors" onClick={() => setShowStopModal(false)}>Cancel</button>
                </div>
              </div>
              <button className="absolute top-4 right-5 text-slate-400 hover:text-slate-700 text-2xl leading-none" onClick={() => setShowStopModal(false)} title="Close">&times;</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Day Item Modal */}
      {showDayModal && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/50 backdrop-blur-xs overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-lg relative" style={{ zIndex: 2001 }}>
              <h3 className="text-xl font-extrabold mb-4 text-slate-900">Log {dayType === 'day' ? '1 Day' : dayType === 'halfDay' ? '1/2 Day' : 'Mileage'}</h3>
              <div className="grid grid-cols-1 gap-3">
                <select
                  className="p-3 border border-slate-300 rounded-xl w-full text-sm text-slate-900 bg-white focus:border-blue-600 outline-none"
                  value={formClientId}
                  onChange={e => { setFormClientId(e.target.value); setFormJobId(""); }}
                >
                  <option value="">Select Client</option>
                  {activeClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select
                  className="p-3 border border-slate-300 rounded-xl w-full text-sm text-slate-900 bg-white focus:border-blue-600 outline-none disabled:bg-slate-50"
                  value={formJobId}
                  onChange={e => setFormJobId(e.target.value)}
                  disabled={!formClientId}
                >
                  <option value="">Select Job</option>
                  {filteredJobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
                <input type="date" className="p-3 border border-slate-300 rounded-xl w-full text-sm text-slate-900 bg-white focus:border-blue-600 outline-none" value={formDate} onChange={e => setFormDate(e.target.value)} />
                {dayType === 'mileage' && (
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Total Miles"
                    className="p-3 border border-slate-300 rounded-xl w-full text-sm text-slate-900 bg-white focus:border-blue-600 outline-none"
                    value={formMiles}
                    onChange={e => setFormMiles(e.target.value)}
                  />
                )}
              </div>
              <div className="flex gap-2.5 mt-6">
                <button className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm px-4 py-2.5 rounded-xl flex-1 transition-colors" onClick={submitDayForm}>Save Entry</button>
                <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-xl flex-1 transition-colors" onClick={() => setShowDayModal(false)}>Cancel</button>
              </div>
              <button className="absolute top-4 right-5 text-slate-400 hover:text-slate-700 text-2xl leading-none" onClick={() => setShowDayModal(false)} title="Close">&times;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}