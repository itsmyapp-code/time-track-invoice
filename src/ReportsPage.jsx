import React, { useState, useMemo } from "react";
import { FaChartBar, FaFileAlt, FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function formatUKDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function ReportsPage({
  jobs,
  clients,
  sessions,
  invoices,
  settings,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  selectedClientId,
  setSelectedClientId,
}) {
  const [reportType, setReportType] = useState("sessions"); // "sessions" | "invoices"

  const filtersChosen = !!startDate && !!endDate && !!selectedClientId;

  // Filter out archived clients for the dropdown
  const activeClients = useMemo(() => {
    return clients.filter(c => !c.isArchived);
  }, [clients]);

  // Compute filteredSessions
  const filteredSessions = useMemo(() => {
    if (!filtersChosen || reportType !== "sessions") return [];

    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    const endDateObj = new Date(endDate);
    endDateObj.setDate(endDateObj.getDate() + 1);
    endDateObj.setHours(0, 0, 0, 0);

    const start = startDateObj.getTime();
    const end = endDateObj.getTime();

    const clientJobIds = jobs.filter(j => j.clientId === selectedClientId).map(j => j.id);

    return sessions.filter(s =>
      clientJobIds.includes(s.jobId) &&
      s.endTime &&
      s.endTime >= start &&
      s.endTime < end
    );
  }, [filtersChosen, reportType, startDate, endDate, selectedClientId, jobs, sessions]);

  // Compute filteredInvoices with calculated totals
  const filteredInvoices = useMemo(() => {
    // Helper to calculate total for a single invoice
    const calculateInvoiceTotal = (inv) => {
      let total = 0;
      // Sessions
      if (inv.sessions) {
        inv.sessions.forEach(session => {
          const job = jobs.find(j => j.id === session.jobId);
          const rate = job ? parseFloat(job.hourlyRate || 0) : 0;
          const hours = (session.duration || 0) / 3600000;
          total += hours * rate;
        });
      }
      // Manual Items
      if (inv.manualItems) {
        inv.manualItems.forEach(item => {
          total += parseFloat(item.amount || 0);
        });
      }
      // Day Items
      if (inv.dayItems) {
        const client = clients.find(c => c.id === inv.clientId);
        const dayRate = client ? parseFloat(client.dayRate || 0) : 0;
        const halfDayRate = client ? parseFloat(client.halfDayRate || 0) : 0;

        inv.dayItems.forEach(item => {
          const rate = item.type === "day" ? dayRate : halfDayRate;
          total += rate;
        });
      }
      return total;
    };

    if (!filtersChosen || reportType !== "invoices" || !invoices) return [];

    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    const endDateObj = new Date(endDate);
    endDateObj.setDate(endDateObj.getDate() + 1);
    endDateObj.setHours(0, 0, 0, 0);

    const start = startDateObj.getTime();
    const end = endDateObj.getTime();

    return invoices.filter(inv => {
      // Filter by Client
      if (inv.clientId !== selectedClientId) return false;

      // Filter by Date
      const dateVal = inv.createdAt || inv.date;
      let invDate;
      if (dateVal && typeof dateVal === 'object' && dateVal.seconds) {
        invDate = new Date(dateVal.seconds * 1000);
      } else {
        invDate = new Date(dateVal || Date.now());
      }

      return invDate.getTime() >= start && invDate.getTime() < end;
    }).map(inv => ({
      ...inv,
      calculatedTotal: calculateInvoiceTotal(inv)
    }));
  }, [filtersChosen, reportType, startDate, endDate, selectedClientId, invoices, jobs, clients]);

  // Calculate Invoice Totals for Summary
  const invoiceTotals = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    filteredInvoices.forEach(inv => {
      const amount = inv.calculatedTotal;
      totalBilled += amount;
      if (inv.status === 'paid') {
        totalPaid += amount;
      } else {
        totalOutstanding += amount;
      }
    });

    return { totalBilled, totalPaid, totalOutstanding };
  }, [filteredInvoices]);


  // PDF Export for Single Invoice
  const downloadInvoicePDF = (invoice) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    let headingY = 40;
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 40, headingY);

    let businessY = headingY + 32;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const businessAddressLines = [];
    if (settings?.ownerName) businessAddressLines.push(settings.ownerName);
    if (settings?.address) String(settings.address).split(/,|\r?\n/).map(l => l.trim()).filter(Boolean).forEach(l => businessAddressLines.push(l));
    if (settings?.town) businessAddressLines.push(settings.town);
    if (settings?.postcode) businessAddressLines.push(settings.postcode);
    if (settings?.email) businessAddressLines.push(settings.email);

    // Bank details
    if (settings?.bankAccountName) businessAddressLines.push(`Bank Name: ${settings.bankAccountName}`);
    if (settings?.sortCode) businessAddressLines.push(`Sort Code: ${settings.sortCode}`);
    if (settings?.accountNumber) businessAddressLines.push(`Account Number: ${settings.accountNumber}`);

    businessAddressLines.forEach(line => {
      doc.text(line, 40, businessY);
      businessY += 14;
    });

    let clientY = 60;
    const client = clients.find(c => c.id === invoice.clientId) || {};
    doc.text(`Client: ${client.name || ""}`, 300, clientY); clientY += 14;
    if (client.address) {
      String(client.address).split(/,|\r?\n/).map(l => l.trim()).filter(Boolean).forEach(l => { doc.text(l, 300, clientY); clientY += 14; });
    }

    const invDateVal = invoice.createdAt || invoice.date;
    const invDate = (invDateVal && typeof invDateVal === 'object' && invDateVal.seconds) ? new Date(invDateVal.seconds * 1000) : new Date(invDateVal || Date.now());

    doc.text(`Invoice #:${invoice.invoiceNumber || invoice.id}`, 300, clientY); clientY += 14;
    doc.text(`Date: ${formatUKDate(invDate)}`, 300, clientY); clientY += 14;
    doc.text(`Due: ${formatUKDate(invoice.dueDate)}`, 300, clientY);

    const headerEndY = Math.max(businessY, clientY) + 20;

    // Table
    const sessionRows = (invoice.sessions || []).map(s => {
      const job = jobs.find(j => j.id === s.jobId);
      const rate = job?.hourlyRate || 0;
      const hours = ((s.duration || 0) / 3600000).toFixed(2);
      return [job?.name || "Job", formatUKDate(s.startTime), hours, rate.toFixed(2), (hours * rate).toFixed(2)];
    });

    const dayRows = (invoice.dayItems || []).map(item => {
      const rate = item.type === "day" ? (client.dayRate || 0) : (client.halfDayRate || 0);
      return [item.type === "day" ? "Day Rate" : "Half Day Rate", formatUKDate(item.date), item.type === "day" ? "1.00" : "0.50", rate.toFixed(2), Number(rate).toFixed(2)];
    });

    const manualRows = (invoice.manualItems || []).map(item => [item.description, "", "", "", parseFloat(item.amount).toFixed(2)]);

    const allRows = [...sessionRows, ...dayRows, ...manualRows];

    autoTable(doc, {
      startY: headerEndY,
      head: [["Description", "Date", "Hours", "Rate", "Amount"]],
      body: allRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [33, 64, 154] },
      theme: "grid"
    });

    let finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: £${invoice.calculatedTotal.toFixed(2)}`, 400, finalY);

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const footer = "Produced by Time Track Invoice. Developed by itsmyapp.co.uk Copyright 2025.";
      const textWidth = doc.getTextWidth(footer);
      doc.text(footer, (doc.internal.pageSize.getWidth() - textWidth) / 2, doc.internal.pageSize.getHeight() - 20);
    }

    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  };


  // Main Report PDF Export
  function handlePrintPDF() {
    if (!filtersChosen) return;

    const client = clients.find(c => c.id === selectedClientId);
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    // Header Branding
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - 60;
    const logoImg1 = new window.Image();
    logoImg1.src = `/itsmyapp-logo.png?v=${new Date().getTime()}`;
    const logoImg2 = new window.Image();
    logoImg2.src = `/logo.png?v=${new Date().getTime()}`;


    const generateContent = () => {
      // Title
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(reportType === "sessions" ? "Session Report" : "Invoice Report", 40, 40);

      // Client Details
      doc.setFontSize(13);
      doc.setFont("helvetica", "normal");
      doc.text(`Client: ${client?.name || "-"}`, 40, 65);
      doc.text(`Period: ${formatUKDate(startDate)} to ${formatUKDate(endDate)}`, 40, 85);

      if (reportType === "sessions") {
        const tableRows = filteredSessions.map(s => {
          const job = jobs.find(j => j.id === s.jobId);
          return [
            job?.name || "-",
            formatUKDate(s.startTime),
            formatUKDate(s.endTime),
            s.duration ? `${Math.floor(s.duration / 3600000)}h ${Math.floor((s.duration % 3600000) / 60000)}m` : "-"
          ];
        });
        autoTable(doc, {
          startY: 110,
          head: [["Job", "Start", "End", "Duration"]],
          body: tableRows,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [33, 64, 154] },
          theme: "grid"
        });
      } else {
        // Invoice Report Table
        const tableRows = filteredInvoices.map(inv => {
          const invDateVal = inv.createdAt || inv.date;
          const invDate = (invDateVal && typeof invDateVal === 'object' && invDateVal.seconds) ? new Date(invDateVal.seconds * 1000) : new Date(invDateVal || Date.now());

          return [
            inv.invoiceNumber || "-",
            formatUKDate(invDate),
            inv.status || "Draft",
            `£${inv.calculatedTotal.toFixed(2)}`
          ];
        });

        autoTable(doc, {
          startY: 110,
          head: [["Invoice #", "Date", "Status", "Amount"]],
          body: tableRows,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [33, 64, 154] },
          theme: "grid"
        });

        // Summary Totals
        const finalY = (doc).lastAutoTable.finalY + 20;
        doc.setFontSize(11);
        doc.text(`Total Billed: £${invoiceTotals.totalBilled.toFixed(2)}`, 40, finalY);
        doc.text(`Total Paid: £${invoiceTotals.totalPaid.toFixed(2)}`, 200, finalY);
        doc.setTextColor(200, 0, 0);
        doc.text(`Outstanding: £${invoiceTotals.totalOutstanding.toFixed(2)}`, 360, finalY);
        doc.setTextColor(0, 0, 0);
      }

      // Footer
      const addFooter = () => {
        const logoHeight = 30;
        let logoWidth = Math.round(logoHeight * (logoImg1.width / logoImg1.height));
        if (isNaN(logoWidth)) logoWidth = 30;

        try {
          doc.addImage(logoImg1, 'PNG', 40, footerY - logoHeight, logoWidth, logoHeight);
          logoWidth = Math.round(logoHeight * (logoImg2.width / logoImg2.height));
          if (isNaN(logoWidth)) logoWidth = 30;
          doc.addImage(logoImg2, 'PNG', 100, footerY - logoHeight, logoWidth, logoHeight);
        } catch (e) { console.warn("Error adding footer logos", e); }

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Developed by itsmyapp.co.uk © 2025`, 40, footerY);
        doc.text(`This Report was created using Time Track Invoice part of the itsmyapp.co.uk development`, 40, footerY + 15);

        doc.save(`${reportType === "sessions" ? "Session" : "Invoice"}_Report_${client?.name || "Client"}.pdf`);
      };
      addFooter();
    };


    const checkImages = () => {
      setTimeout(() => { generateContent(); }, 500);
    }

    checkImages();
  }

  const cardClass = "app-card mb-4 rounded-lg shadow-sm bg-white p-2";
  const buttonClass = "app-add-btn flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 transition";

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FaChartBar className="text-indigo-600" />
          {reportType === "sessions" ? " Session Reports" : " Invoice Reports"}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setReportType("sessions")}
            className={`px-4 py-2 rounded-l-lg font-medium border ${reportType === "sessions" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}
          >
            Sessions
          </button>
          <button
            onClick={() => setReportType("invoices")}
            className={`px-4 py-2 rounded-r-lg font-medium border ${reportType === "invoices" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}
          >
            Invoices
          </button>
        </div>
        <button
          className={buttonClass}
          onClick={handlePrintPDF}
          disabled={!filtersChosen}
        >
          Generate PDF
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
        <div className="flex items-center gap-2">
          <label className="font-medium">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate && setStartDate(e.target.value)}
            className="border rounded px-3 py-2 text-slate-900 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate && setEndDate(e.target.value)}
            className="border rounded px-3 py-2 text-slate-900 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium">Client:</label>
          <select
            value={selectedClientId}
            onChange={e => setSelectedClientId && setSelectedClientId(e.target.value)}
            className="border rounded px-2 py-2 text-slate-900 bg-white"
          >
            <option value="">Select Client</option>
            {activeClients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        {!filtersChosen ? (
          <div className="text-gray-500">Please select start date, end date and a client to generate a report.</div>
        ) : (
          <>
            {reportType === "sessions" && (
              <div className="mb-8">
                {filteredSessions.length === 0 ? (
                  <div className="text-gray-500">No sessions found for this period.</div>
                ) : (
                  filteredSessions.map(session => (
                    <div key={session.id} className={cardClass}>
                      <div className="flex justify-between">
                        <div>
                          <span className="font-bold">{jobs.find(j => j.id === session.jobId)?.name || "Unknown Job"}</span>
                          <div className="text-xs text-gray-500">{formatUKDate(session.startTime)}</div>
                        </div>
                        <div className="font-mono">
                          {session.duration ? `${Math.floor(session.duration / 3600000)}h ${Math.floor((session.duration % 3600000) / 60000)}m` : "Running..."}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {reportType === "invoices" && (
              <div className="mb-8">
                {filteredInvoices.length === 0 ? (
                  <div className="text-gray-500">No invoices found for this period.</div>
                ) : (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                        <div className="text-gray-500 text-sm">Total Billed</div>
                        <div className="text-2xl font-bold text-gray-800">£{invoiceTotals.totalBilled.toFixed(2)}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                        <div className="text-gray-500 text-sm">Total Paid</div>
                        <div className="text-2xl font-bold text-green-700">£{invoiceTotals.totalPaid.toFixed(2)}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                        <div className="text-gray-500 text-sm">Outstanding</div>
                        <div className="text-2xl font-bold text-red-700">£{invoiceTotals.totalOutstanding.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Invoices List */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredInvoices.map(inv => {
                            const invDateVal = inv.createdAt || inv.date;
                            const invDate = (invDateVal && typeof invDateVal === 'object' && invDateVal.seconds) ? new Date(invDateVal.seconds * 1000) : new Date(invDateVal || Date.now());
                            return (
                              <tr key={inv.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.invoiceNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatUKDate(invDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                                    inv.status === 'sent' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {inv.status || 'Draft'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">£{inv.calculatedTotal.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <button
                                    onClick={() => downloadInvoicePDF(inv)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Download PDF"
                                  >
                                    <FaDownload />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}