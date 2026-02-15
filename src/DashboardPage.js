import React, { useState } from "react";
import {
  FaClock, FaListAlt, FaMoneyBillWave, FaBars, FaTimes
} from "react-icons/fa";

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
function getUnbilledAmount(jobs, sessions, invoices) {
  const invoicedSessionIds = new Set();
  invoices.forEach(inv => (inv.sessions || []).forEach(s => invoicedSessionIds.add(s.id)));
  const unbilled = sessions.filter(s => !invoicedSessionIds.has(s.id));
  let total = 0;
  unbilled.forEach(s => {
    const job = jobs.find(j => j.id === s.jobId);
    if (job && job.hourlyRate && s.duration) {
      total += (job.hourlyRate * s.duration) / (1000 * 60 * 60);
    }
  });
  return total;
}
function getOverdueInvoices(invoices) {
  const now = Date.now();
  return invoices.filter(inv => inv.status === "sent" && inv.dueDate && new Date(inv.dueDate).getTime() < now);
}

export default function DashboardPage({
  jobs,
  clients,
  sessions,
  invoices,
  setActiveView
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const runningSessions = sessions.filter(s => !s.endTime);
  const totalUnbilled = getUnbilledAmount(jobs, sessions, invoices).toFixed(2);
  const overdue = getOverdueInvoices(invoices);

  // Show only the latest 5 sessions in newest first order
  const latestSessions = [...sessions]
    .sort((a, b) => (b.startTime || 0) - (a.startTime || 0))
    .slice(0, 5);

  return (
    <div className="p-2 md:p-4" style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Mobile Dropdown Menu Button on the left */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", marginBottom: 16, display: "flex", padding: "8px 12px", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{ background: "none", border: "none", fontSize: 28, color: "#2563eb", cursor: "pointer", marginRight: 12 }}
            onClick={() => setMenuOpen(m => !m)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <span className="font-bold text-blue-800 text-lg">Time Track Invoice</span>
        </div>
        {/* Dropdown menu content - now directly under the button */}
        {menuOpen && (
          <div style={{ marginTop: 4, background: "#fff", border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderRadius: 8, padding: "8px 0", minWidth: 180 }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              <li><button className="w-full text-left px-4 py-2 text-blue-700 font-semibold" style={{ background: "none", border: "none" }} onClick={() => { setActiveView("dashboard"); setMenuOpen(false); }}>Dashboard</button></li>
              <li><button className="w-full text-left px-4 py-2 text-blue-700 font-semibold" style={{ background: "none", border: "none" }} onClick={() => { setActiveView("jobs"); setMenuOpen(false); }}>Jobs</button></li>
              <li><button className="w-full text-left px-4 py-2 text-blue-700 font-semibold" style={{ background: "none", border: "none" }} onClick={() => { setActiveView("clients"); setMenuOpen(false); }}>Clients</button></li>
              <li><button className="w-full text-left px-4 py-2 text-blue-700 font-semibold" style={{ background: "none", border: "none" }} onClick={() => { setActiveView("invoices"); setMenuOpen(false); }}>Invoices</button></li>
              <li><button className="w-full text-left px-4 py-2 text-blue-700 font-semibold" style={{ background: "none", border: "none" }} onClick={() => { setActiveView("reports"); setMenuOpen(false); }}>Reports</button></li>
            </ul>
          </div>
        )}
      </div>
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-blue-800 flex items-center gap-2" style={{ justifyContent: "center" }}>
        <FaListAlt /> Dashboard
      </h2>
      <div className="grid gap-4 md:gap-6" style={{ gridTemplateColumns: "1fr", display: "grid" }}>
        {/* On medium screens and up, use 3 columns */}
        <div className="md:grid md:grid-cols-3 md:gap-6" style={{ display: "contents" }}>
        {/* Running Timers */}
        <div className="app-card transition hover:scale-105 hover:shadow-lg" style={{ marginBottom: 12, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", background: "#fff", padding: "16px" }}>
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
        <div className="app-card transition hover:scale-105 hover:shadow-lg" style={{ marginBottom: 12, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", background: "#fff", padding: "16px" }}>
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
        {/* Financial Metrics */}
        <div className="app-card transition hover:scale-105 hover:shadow-lg bg-green-50" style={{ marginBottom: 12, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", background: "#f0fdf4", padding: "16px" }}>
          <h3 className="font-bold text-green-700 mb-2 flex items-center gap-1"><FaMoneyBillWave /> Financial Metrics</h3>
          <div>
            <span className="font-semibold">Total Unbilled:</span>
            <span className="ml-2 text-green-700">£{totalUnbilled}</span>
          </div>
          <div className="mt-2">
            <span className="font-semibold">Overdue Invoices:</span>
            <span className="ml-2 text-red-700">{overdue.length}</span>
            {overdue.length > 0 &&
              <ul className="mt-1 text-sm">
                {overdue.map(inv => {
                  const client = clients.find(c => c.id === inv.clientId);
                  return (
                    <li key={inv.id}>
                      {client?.name}: Due {formatUKDate(inv.dueDate)}
                    </li>
                  );
                })}
              </ul>
            }
          </div>
        </div>
        </div>
      </div>
      {/* Footer - mobile friendly */}
      <footer className="app-footer" style={{textAlign: "center", marginTop: "32px"}}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          borderBottom: "1px solid #ccc"
        }}>
          <img src={`/logo.png?v=${new Date().getTime()}`} alt="" style={{ height: "36px", width: "36px", objectFit: "contain" }} />
          <img src={`/itsmyapp-logo.png?v=${new Date().getTime()}`} alt="" style={{ height: "36px", width: "36px", objectFit: "contain" }} />
        </div>
      </footer>
    </div>
  );
}