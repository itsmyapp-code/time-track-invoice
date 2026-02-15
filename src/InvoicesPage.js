import React, { useState } from "react";
import { FaPrint, FaCheck, FaEnvelope, FaTrash, FaFileInvoiceDollar, FaPlus, FaBars, FaTimes } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const APP_VERSION = "v1.0.0";

function formatUKDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getClientWithRates(client) {
  return {
    ...client,
    dayRate: client.dayRate ?? 0,
    halfDayRate: client.halfDayRate ?? 0
  };
}

export default function InvoicesPage({ jobs, clients: rawClients, savedInvoices, sessions, saveInvoice, settings, deleteInvoice, appVersion = APP_VERSION, updateInvoiceStatus, setActiveView, updateClientRates }) {
  // Helper to check if invoice is overdue
  function isOverdue(inv) {
    if (!inv.dueDate || inv.status === "paid") return false;
    const due = new Date(inv.dueDate).getTime();
    const now = Date.now();
    return due < now;
  }
  // Dropdown menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    startDate: "",
    endDate: "",
    dueDate: ""
  });

  const [manualItems, setManualItems] = useState([]);
  const [dayItems, setDayItems] = useState([]);
  const buttonClass = "app-add-btn flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 transition";

  const clients = rawClients.map(getClientWithRates);

  const getClient = id => clients.find(c => c.id === id);

  const getInvoiceSessions = () => {
    if (!form.clientId || !form.startDate || !form.endDate) return [];
    // Ensure finish date includes all sessions from that day (inclusive)
    const startDateObj = new Date(form.startDate);
    startDateObj.setHours(0,0,0,0);
    const endDateObj = new Date(form.endDate);
    endDateObj.setDate(endDateObj.getDate() + 1); // add one day
    endDateObj.setHours(0,0,0,0);
    const start = startDateObj.getTime();
    const end = endDateObj.getTime();
    const clientJobIds = jobs.filter(j => j.clientId === form.clientId).map(j => j.id);
    return sessions.filter(s =>
      clientJobIds.includes(s.jobId) &&
      s.endTime &&
      s.endTime >= start &&
      s.endTime < end // strictly less than end
    );
  };

  const handleSaveInvoice = () => {
    const invoiceSessions = getInvoiceSessions();
    if (!form.clientId || !form.startDate || !form.endDate) {
        // If there are no sessions, check for manual or day items
        if (manualItems.length === 0 && dayItems.length === 0) {
            alert("Cannot save an empty invoice. Please select sessions or add manual/day items.");
            return;
        }
    }
    const client = getClient(form.clientId);
    // Generate invoice number: YYYYMMDD (created date) + sequence for that day (no customer name)
    const createdDate = new Date();
    const yyyymmdd = createdDate.getFullYear().toString() + String(createdDate.getMonth() + 1).padStart(2, '0') + String(createdDate.getDate()).padStart(2, '0');
    // Find existing invoices for this user and created date
    const sameDayInvoices = savedInvoices.filter(inv => {
      const invCreated = inv.createdAt ? new Date(inv.createdAt) : null;
      const invYMD = invCreated ? (invCreated.getFullYear().toString() + String(invCreated.getMonth() + 1).padStart(2, '0') + String(invCreated.getDate()).padStart(2, '0')) : '';
      return invYMD === yyyymmdd;
    });
    const sequence = sameDayInvoices.length + 1;
    const invoiceNumber = `${yyyymmdd}-${sequence}`;
    const invoiceData = {
      invoiceNumber,
      clientId: form.clientId,
      clientName: client?.name,
      clientAddress: client?.address,
      clientTown: client?.town,
      clientCounty: client?.county,
      clientPostcode: client?.postcode,
      clientPhone: client?.phone,
      clientEmail: client?.email,
      startDate: form.startDate,
      endDate: form.endDate,
      dueDate: form.dueDate,
      sessions: invoiceSessions,
      manualItems: manualItems.filter(item => item.description && item.amount),
      dayItems: dayItems.filter(item => item.date),
      status: "draft",
      createdAt: Date.now()
    };
    saveInvoice(invoiceData);
    setShowModal(false);
    setManualItems([]);
    setDayItems([]);
    setForm({ clientId: "", startDate: "", endDate: "", dueDate: "" });
  };

  const handleMarkSent = (invoiceId) => {
    if (updateInvoiceStatus) updateInvoiceStatus(invoiceId, "sent");
  };
  const handleMarkPaid = (invoiceId) => {
    if (updateInvoiceStatus) updateInvoiceStatus(invoiceId, "paid");
  };

  // PDF Export function with robust bank details visibility and correct footer placement
  const handlePrintPDF = (invoice) => {

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    // Draw INVOICE heading at the top
    let headingY = 40;
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 40, headingY);
    // Move business address block down to avoid overlap
    let businessY = headingY + 32; // 32pt below heading
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    // Use business details from settings, always show all fields with labels
    const businessAddressLines = [];
    if (settings.ownerName) businessAddressLines.push(settings.ownerName);
    if (settings.address) {
      String(settings.address)
        .split(/,|\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .forEach(line => businessAddressLines.push(line));
    }
    if (settings.town) businessAddressLines.push(settings.town);
    if (settings.county) businessAddressLines.push(settings.county);
    if (settings.postcode) businessAddressLines.push(settings.postcode);
    if (settings.phone) businessAddressLines.push(settings.phone);
    if (settings.email) businessAddressLines.push(settings.email);
    // Add bank details with labels
    if (settings.bankAccountName) businessAddressLines.push(`Bank Name: ${settings.bankAccountName}`);
    if (settings.sortCode) businessAddressLines.push(`Sort Code: ${settings.sortCode}`);
    if (settings.accountNumber) businessAddressLines.push(`Account Number: ${settings.accountNumber}`);
    if (settings.vatNumber) businessAddressLines.push(settings.vatNumber);
    businessAddressLines.forEach(line => {
      doc.text(line, 40, businessY);
      businessY += 14;
    });
    // Client details
    let clientY = 60;
    doc.text(`Client: ${invoice.clientName || ""}`, 300, clientY); clientY += 14;
    if (invoice.clientAddress) {
      String(invoice.clientAddress)
        .split(/,|\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .forEach(line => {
          doc.text(line, 300, clientY);
          clientY += 14;
        });
    }
    [invoice.clientTown, invoice.clientCounty, invoice.clientPostcode]
      .filter(Boolean)
      .forEach(line => {
        doc.text(line, 300, clientY);
        clientY += 14;
      });
    doc.text(`Invoice #: ${invoice.invoiceNumber || invoice.id || ""}`, 300, clientY); clientY += 14;
    // Use createdAt for Invoice Date
    const createdDate = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
    doc.text(`Invoice Date: ${formatUKDate(createdDate)}`, 300, clientY); clientY += 14;
    doc.text(`Due Date: ${formatUKDate(invoice.dueDate)}`, 300, clientY);

    // Find the max y position reached by either block
    const headerEndY = Math.max(businessY, clientY) + 10;

    // --- Table rows logic ---
    const sessionRows = (invoice.sessions || []).map(s => {
      const job = jobs.find(j => j.id === s.jobId);
      const jobName = job?.name || "N/A";
      const rate = job?.hourlyRate || 0;
      const hours = ((s.duration || 0) / (1000 * 60 * 60)).toFixed(2);
      const amount = (parseFloat(hours) * parseFloat(rate)).toFixed(2);
      return [
        jobName,
        formatUKDate(s.startTime),
        hours,
        rate.toFixed(2),
        amount
      ];
    });
    const client = getClient(invoice.clientId) || {};
    const dayRows = (invoice.dayItems || []).map(item => {
      const typeLabel = item.type === "day" ? "Day Rate" : "Half Day Rate";
      const rateVal = item.type === "day" ? client.dayRate : client.halfDayRate;
      const hoursVal = item.type === "day" ? "1.00" : "0.50";
      return [
        typeLabel,
        formatUKDate(item.date),
        hoursVal,
        rateVal.toFixed(2),
        rateVal.toFixed(2)
      ];
    });
    const manualRows = (invoice.manualItems || []).map(item => [
      item.description,
      "",
      "",
      "",
      parseFloat(item.amount).toFixed(2)
    ]);
    const allRows = [
      ...sessionRows,
      ...dayRows,
      ...manualRows
    ];
    autoTable(doc, {
      startY: headerEndY,
      head: [["Description", "Date", "Hours", "Rate (£)", "Amount (£)"]],
      body: allRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [33, 64, 154] },
      theme: "grid"
    });

    // Use a new variable for y after the table
    let yAfterTable = doc.lastAutoTable.finalY + 20;

    // --- After table content ---
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    const totalAmount = allRows.reduce((sum, row) => sum + parseFloat(row[4] || 0), 0);
    doc.text(`Total: £${totalAmount.toFixed(2)}`, 400, yAfterTable);
    yAfterTable += 20;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Thank you for your business, ${settings.ownerName || ""}`, 40, yAfterTable);
    yAfterTable += 25;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Terms and Conditions:", 40, yAfterTable);
    yAfterTable += 15;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const terms = settings.termsConditions || "No terms and conditions set.";
    doc.text(terms, 40, yAfterTable, { maxWidth: 500 });
    const termsLines = doc.splitTextToSize(terms, 500).length;
    yAfterTable += termsLines * 13;
    const pageHeight = doc.internal.pageSize.getHeight();
    if (yAfterTable + 170 > pageHeight) {
      doc.addPage();
      yAfterTable = 40;
    }

    // Helper to load image from public folder and convert to base64
    function loadImageAsBase64(url, callback) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        callback(canvas.toDataURL("image/png"));
      };
      img.onerror = function () {
        callback(null);
      };
      img.src = url;
    }

    // Add footer text to all pages
    function addFooter(doc) {
      const pageCount = doc.internal.getNumberOfPages();
      const footerText = "Produced by Time Track Invoice. Developed by itsmyapp.co.uk Copyright 2025.";
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const pageWidth = doc.internal.pageSize.getWidth();
        const y = doc.internal.pageSize.getHeight() - 30;
        const textWidth = doc.getTextWidth(footerText);
        const x = (pageWidth - textWidth) / 2;
        doc.text(footerText, x, y);
      }
    }

    // Load both logos and then add to PDF
    loadImageAsBase64(`/itsmyapp-logo.png?v=${new Date().getTime()}`, function (logo1Base64) {
      loadImageAsBase64(`/logo.png?v=${new Date().getTime()}`, function (logo2Base64) {
        // Center logos horizontally, make them smaller, and place above footer
        const pageWidth = doc.internal.pageSize.getWidth();
        const logoWidth = 36;
        const logoHeight = 36;
        const logosY = pageHeight - 130; // 100px above footer
        if (logo1Base64 && logo2Base64) {
          // Center both logos together
          const totalWidth = logoWidth * 2 + 20; // 20px gap
          const startX = (pageWidth - totalWidth) / 2;
          doc.addImage(logo1Base64, 'PNG', startX, logosY, logoWidth, logoHeight);
          doc.addImage(logo2Base64, 'PNG', startX + logoWidth + 20, logosY, logoWidth, logoHeight);
        } else if (logo1Base64) {
          const x = (pageWidth - logoWidth) / 2;
          doc.addImage(logo1Base64, 'PNG', x, logosY, logoWidth, logoHeight);
        } else if (logo2Base64) {
          const x = (pageWidth - logoWidth) / 2;
          doc.addImage(logo2Base64, 'PNG', x, logosY, logoWidth, logoHeight);
        }
        addFooter(doc);
        doc.save(`Invoice-${invoice.invoiceNumber || invoice.id || ''}.pdf`);
      });
    });
  }

  return (
    <div className="p-2" style={{ marginTop: 64 }}>
      {/* Mobile Dropdown Menu Button on the left */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", marginBottom: 16, display: "flex", padding: "8px 12px", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{ background: "none", border: "none", fontSize: 28, color: "#2563eb", cursor: "pointer", marginRight: 12 }}
            onClick={() => setMenuOpen(m => !m)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <span className="font-bold text-blue-800 text-lg">Invoices</span>
        </div>
        {/* Dropdown menu content - now directly under the button */}
        {menuOpen && (
          <div style={{ marginTop: 4, background: "#fff", border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderRadius: 8, padding: "8px 0", minWidth: 180 }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              <li><button className="w-full text-left px-4 py-2 text-blue-700 font-semibold" style={{ background: "none", border: "none" }} onClick={() => { setActiveView && setActiveView("dashboard"); setMenuOpen(false); }}>Dashboard</button></li>
              <li><button className="w-full text-left px-4 py-2 text-blue-700 font-semibold" style={{ background: "none", border: "none" }} onClick={() => { setActiveView && setActiveView("jobs"); setMenuOpen(false); }}>Jobs</button></li>
              <li><button className="w-full text-left px-4 py-2 text-blue-700 font-semibold" style={{ background: "none", border: "none" }} onClick={() => { setActiveView && setActiveView("clients"); setMenuOpen(false); }}>Clients</button></li>
              <li><button className="w-full text-left px-4 py-2 text-blue-700 font-semibold" style={{ background: "none", border: "none" }} onClick={() => { setMenuOpen(false); }}>Invoices</button></li>
              <li><button className="w-full text-left px-4 py-2 text-blue-700 font-semibold" style={{ background: "none", border: "none" }} onClick={() => { setActiveView && setActiveView("reports"); setMenuOpen(false); }}>Reports</button></li>
            </ul>
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <FaFileInvoiceDollar /> Invoices
        </h2>
        <button
          className={buttonClass}
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> <span className="hidden sm:inline">Create Invoice</span>
        </button>
      </div>
      {/* Cards for each invoice, responsive for mobile */}
      <div className="flex flex-col gap-4">
        {savedInvoices.length === 0 && (
          <div className="text-gray-500">No invoices found.</div>
        )}
        {/* Sort invoices by newest first (createdAt descending) */}
        {[...savedInvoices].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).map(inv => {
          const client = getClient(inv.clientId) || {};
          return (
            <div key={inv.id} className={`bg-white p-4 rounded shadow border ${isOverdue(inv) ? "border-red-400" : "border-gray-200"} flex flex-col sm:flex-row sm:items-center sm:justify-between`}>
              <div className="flex-1">
                <div className="font-bold text-lg">{client.name || "Unknown Client"}</div>
                <div className="text-sm text-gray-700">Date Range: {formatUKDate(inv.startDate)} - {formatUKDate(inv.endDate)}</div>
                <div className="text-sm text-gray-700">Due: {formatUKDate(inv.dueDate)}</div>
                <div className="text-sm text-gray-700">Sessions: {inv.sessions?.length ?? 0}</div>
                <div className="mt-2">
                  {/* Status badge */}
                  <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${inv.status === "paid" ? "bg-green-100 text-green-700" : inv.status === "sent" ? (isOverdue(inv) ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700") : "bg-gray-100 text-gray-700"}`}>{inv.status?.toUpperCase() || "DRAFT"}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <button className="text-blue-600 hover:text-blue-800" title="Print PDF" onClick={() => handlePrintPDF(inv)}><FaPrint /></button>
                <button className="text-green-600 hover:text-green-800" title="Mark Paid" onClick={() => handleMarkPaid(inv.id)}><FaCheck /></button>
                <button className="text-yellow-600 hover:text-yellow-800" title="Mark Sent" onClick={() => handleMarkSent(inv.id)}><FaEnvelope /></button>
                <button className="text-red-600 hover:text-red-800" title="Delete" onClick={() => deleteInvoice(inv.id)}><FaTrash /></button>
              </div>
            </div>
          );
        })}
      </div>
      {/* Modal for creating invoice */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40" style={{ zIndex: 2000 }}>
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative" style={{ position: 'relative', zIndex: 2001 }}>
            <h3 className="text-xl font-bold mb-4">Create Invoice</h3>
            <div className="grid grid-cols-1 gap-3">
              <select
                className="p-2 border rounded"
                value={form.clientId}
                onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
              >
                <option value="">Select Client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="date"
                className="p-2 border rounded"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                placeholder="Start Date"
              />
              <input
                type="date"
                className="p-2 border rounded"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                placeholder="End Date"
              />
              <input
                type="date"
                className="p-2 border rounded"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                placeholder="Due Date"
              />
            </div>
            {/* Manual Invoice Items Section */}
            <div className="mt-6 mb-2">
              <h4 className="font-semibold mb-2">Manual Invoice Items</h4>
              {manualItems.length === 0 && (
                <div className="text-gray-500 mb-2">No manual items added.</div>
              )}
              {manualItems.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 mb-2 items-stretch sm:items-center">
                  <input
                    type="text"
                    className="border rounded px-2 py-1 flex-1"
                    placeholder="Description"
                    value={item.description}
                    onChange={e => {
                      const val = e.target.value;
                      setManualItems(items => items.map((it, i) => i === idx ? { ...it, description: val } : it));
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      className="border rounded px-2 py-1 w-full flex-1"
                      placeholder="Amount (£)"
                      value={item.amount}
                      onChange={e => {
                        const val = e.target.value;
                        setManualItems(items => items.map((it, i) => i === idx ? { ...it, amount: val } : it));
                      }}
                    />
                    <button
                      type="button"
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded"
                      onClick={() => {
                        setManualItems(items => items.map((it, i) => {
                          if (i === idx) {
                            const currentAmount = parseFloat(it.amount || 0);
                            return { ...it, amount: (currentAmount * -1).toString() };
                          }
                          return it;
                        }));
                      }}
                    >
                      +/-
                    </button>
                  </div>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded"
                    type="button"
                    title="Remove Item"
                    onClick={() => setManualItems(items => items.filter((_, i) => i !== idx))}
                  >Remove</button>
                </div>
              ))}
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mt-2"
                type="button"
                onClick={() => setManualItems(items => [...items, { description: "", amount: "" }])}
              >Add Item</button>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-1"
                onClick={handleSaveInvoice}
              >
                <FaPlus /> Save Invoice
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
            <button
              className="absolute top-2 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowModal(false)}
              title="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}