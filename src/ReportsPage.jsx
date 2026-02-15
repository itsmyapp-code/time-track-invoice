import React from "react";
import { FaFileAlt, FaBars, FaTimes } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage({
  jobs,
  clients,
  sessions,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  selectedClientId,
  setSelectedClientId,
  generateReport,
  setActiveView
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const filtersChosen = !!startDate && !!endDate && !!selectedClientId;

  // Compute filteredSessions: all jobs for client, all sessions in date range (inclusive)
  const filteredSessions = React.useMemo(() => {
    if (!filtersChosen) return [];
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0,0,0,0);
    const endDateObj = new Date(endDate);
    endDateObj.setDate(endDateObj.getDate() + 1);
    endDateObj.setHours(0,0,0,0);
    const start = startDateObj.getTime();
    const end = endDateObj.getTime();
    // Get all jobs for the selected client
    const clientJobIds = jobs.filter(j => j.clientId === selectedClientId).map(j => j.id);
    // Filter all sessions for those jobs in the date range
    return sessions.filter(s =>
      clientJobIds.includes(s.jobId) &&
      s.endTime &&
      s.endTime >= start &&
      s.endTime < end
    );
  }, [filtersChosen, startDate, endDate, selectedClientId, jobs, sessions]);

  // PDF Export function for reports
  function handlePrintPDF() {
    if (!filtersChosen || filteredSessions.length === 0) return;
    const firstSession = filteredSessions[0];
    const job = firstSession ? jobs.find(j => j.id === firstSession.jobId) : null;
    const client = job ? clients.find(c => c.id === job.clientId) : null;
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Session Report", 40, 40);

    // Client & Job details
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.text([`Client: ${client?.name || "-"}`, `Job: ${job?.name || "-"}`], 40, 65);

    // Table
    const tableRows = filteredSessions.map(s => {
      const job = jobs.find(j => j.id === s.jobId);
      const client = job ? clients.find(c => c.id === job.clientId) : null;
      return [
        job?.name || "-",
        client?.name || "-",
        s.startTime ? new Date(s.startTime).toLocaleString() : "-",
        s.endTime ? new Date(s.endTime).toLocaleString() : "-",
        s.duration ? `${Math.floor(s.duration / 3600000)}h ${Math.floor((s.duration % 3600000) / 60000)}m` : "-"
      ];
    });
    autoTable(doc, {
      startY: 90,
      head: [["Job", "Client", "Start", "End", "Duration"]],
      body: tableRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [33, 64, 154] },
      theme: "grid"
    });

    // Footer branding (logos with correct aspect ratio and increased spacing)
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - 60;
    const logoImg1 = new window.Image();
    logoImg1.src = `/itsmyapp-logo.png?v=${new Date().getTime()}`;
    const logoImg2 = new window.Image();
    logoImg2.src = `/logo.png?v=${new Date().getTime()}`;
    
    let logo1Loaded = false;
    let logo2Loaded = false;

    const addImagesToPdf = () => {
      if (logo1Loaded && logo2Loaded) {
        const logoHeight = 30;
        let logoWidth = Math.round(logoHeight * (logoImg1.width / logoImg1.height));
        doc.addImage(logoImg1, 'PNG', 40, footerY - logoHeight, logoWidth, logoHeight);
        logoWidth = Math.round(logoHeight * (logoImg2.width / logoImg2.height));
        doc.addImage(logoImg2, 'PNG', 100, footerY - logoHeight, logoWidth, logoHeight);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Developed by itsmyapp.co.uk © 2025`, 40, footerY);
        doc.text(`This Report was created using Time Track Invoice part of the itsmyapp.co.uk development`, 40, footerY + 15);

        doc.save(`SessionReport_${client?.name || "Client"}_${job?.name || "Job"}.pdf`);
      }
    };

    logoImg1.onload = function() {
      logo1Loaded = true;
      addImagesToPdf();
    };
    logoImg2.onload = function() {
      logo2Loaded = true;
      addImagesToPdf();
    };

    // In case images are cached and onload doesn't fire
    if (logoImg1.complete) {
      logo1Loaded = true;
      addImagesToPdf();
    }
    if (logoImg2.complete) {
      logo2Loaded = true;
      addImagesToPdf();
    }
  }

  // Consistent button and card styles
  const cardClass = "app-card mb-4 rounded-lg shadow-sm bg-white p-2";
  const buttonClass = "app-add-btn flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 transition";

  return (
    <div className="p-4">
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
          <span className="font-bold text-blue-800 text-lg">Reports</span>
        </div>
        {/* Dropdown menu content - now directly under the button */}
        {menuOpen && (
          <div style={{ marginTop: 4, background: "#fff", border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderRadius: 8, padding: "8px 0", minWidth: 180 }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              <li><button className="w-full text-left px-4 py-2 text-blue-700 font-semibold" style={{ background: "none", border: "none" }} onClick={() => { setActiveView && setActiveView("dashboard"); setMenuOpen(false); }}>Dashboard</button></li>
              <li><button className="w-full text-left px-4 py-2 text-blue-700 font-semibold" style={{ background: "none", border: "none" }} onClick={() => { setActiveView && setActiveView("jobs"); setMenuOpen(false); }}>Jobs</button></li>
              <li><button className="w-full text-left px-4 py-2 text-blue-700 font-semibold" style={{ background: "none", border: "none" }} onClick={() => { setActiveView && setActiveView("clients"); setMenuOpen(false); }}>Clients</button></li>
              <li><button className="w-full text-left px-4 py-2 text-blue-700 font-semibold" style={{ background: "none", border: "none" }} onClick={() => { setActiveView && setActiveView("invoices"); setMenuOpen(false); }}>Invoices</button></li>
              <li><button className="w-full text-left px-4 py-2 text-blue-700 font-semibold" style={{ background: "none", border: "none" }} onClick={() => { setMenuOpen(false); }}>Reports</button></li>
            </ul>
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
          <FaFileAlt /> Reports
        </h2>
        <button
          className={buttonClass}
          onClick={handlePrintPDF}
          disabled={!filtersChosen}
        >
          <FaFileAlt /> Generate PDF
        </button>
      </div>

      {/* Start and End Date, and Client select on same line */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
        <div className="flex items-center gap-2">
          <label className="font-medium">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate && setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate && setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="font-medium mb-1">Client:</label>
          <select
            value={selectedClientId}
            onChange={e => setSelectedClientId && setSelectedClientId(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Select Client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Only show report if all filters are chosen */}
      <div>
        {!filtersChosen ? (
          <div className="text-gray-500">Please select start date, end date and a client to view reports.</div>
        ) : (
          filteredSessions.length === 0 ? (
            <div className="text-gray-500 mb-4">No sessions found for selected dates.</div>
          ) : (
            <div className="mb-8">
              {filteredSessions.map(session => (
                <div key={session.id} className={cardClass}>
                  {/* ...existing report card content... */}
                </div>
              ))}
            </div>
          )
        )}
      </div>

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