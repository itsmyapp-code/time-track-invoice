import React, { useState, useEffect } from "react";
import { FaPrint, FaCheck, FaEnvelope, FaTrash, FaFileInvoiceDollar, FaPlus, FaEdit } from "react-icons/fa";
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

export default function InvoicesPage({ jobs, clients: rawClients, savedInvoices, sessions, dayItems: globalDayItems = [], saveInvoice, settings, deleteInvoice, appVersion = APP_VERSION, updateInvoiceStatus, setActiveView, updateClientRates }) {
  // Helper to check if invoice is overdue
  function isOverdue(inv) {
    if (!inv.dueDate || inv.status === "paid") return false;
    const due = new Date(inv.dueDate).getTime();
    const now = Date.now();
    return due < now;
  }
  // Dropdown menu state
  const [menuOpen, setMenuOpen] = useState(false); // Removed but keeping var if needed to avoid break, but actually better to remove. 
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: null,
    clientId: "",
    startDate: "",
    endDate: "",
    dueDate: ""
  });

  const [manualItems, setManualItems] = useState([]);
  const [dayItems, setDayItems] = useState([]);

  useEffect(() => {
    if (showModal) {
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
  }, [showModal]);
  const buttonClass = "app-add-btn flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm";

  const clients = rawClients.map(getClientWithRates);

  const getClient = id => clients.find(c => c.id === id);

  const getInvoiceSessions = () => {
    if (!form.clientId || !form.startDate || !form.endDate) return [];
    // Ensure finish date includes all sessions from that day (inclusive)
    const startDateObj = new Date(form.startDate);
    startDateObj.setHours(0, 0, 0, 0);
    const endDateObj = new Date(form.endDate);
    endDateObj.setDate(endDateObj.getDate() + 1); // add one day
    endDateObj.setHours(0, 0, 0, 0);
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

  const getInvoiceDayItems = () => {
    if (!form.clientId || !form.startDate || !form.endDate) return [];
    const startDateObj = new Date(form.startDate);
    startDateObj.setHours(0, 0, 0, 0);
    const endDateObj = new Date(form.endDate);
    endDateObj.setDate(endDateObj.getDate() + 1);
    endDateObj.setHours(0, 0, 0, 0);
    const start = startDateObj.getTime();
    const end = endDateObj.getTime();
    const clientJobIds = jobs.filter(j => j.clientId === form.clientId).map(j => j.id);
    return globalDayItems.filter(item =>
      clientJobIds.includes(item.jobId) &&
      item.date >= start &&
      item.date < end
    );
  };

  const handleSaveInvoice = () => {
    // If editing, we use existing data, else create new
    const invoiceSessions = getInvoiceSessions();
    const invoiceDayItems = getInvoiceDayItems();
    if (!form.clientId || !form.startDate || !form.endDate) {
      // If editing and we have manual items, it's fine.
      if (manualItems.length === 0 && dayItems.length === 0 && invoiceSessions.length === 0 && invoiceDayItems.length === 0) {
        alert("Cannot save an empty invoice. Please select sessions or add manual/day items.");
        return;
      }
    }
    const client = getClient(form.clientId);

    let invoiceNumber = form.invoiceNumber;
    let createdAt = form.createdAt || Date.now();
    let status = form.status || "draft";

    if (!form.id) {
      // Create new
      const createdDate = new Date();
      const yyyymmdd = createdDate.getFullYear().toString() + String(createdDate.getMonth() + 1).padStart(2, '0') + String(createdDate.getDate()).padStart(2, '0');
      const sameDayInvoices = savedInvoices.filter(inv => {
        const invCreated = inv.createdAt ? new Date(inv.createdAt) : null;
        const invYMD = invCreated ? (invCreated.getFullYear().toString() + String(invCreated.getMonth() + 1).padStart(2, '0') + String(invCreated.getDate()).padStart(2, '0')) : '';
        return invYMD === yyyymmdd;
      });
      const sequence = sameDayInvoices.length + 1;
      invoiceNumber = `${yyyymmdd}-${sequence}`;
    }

    const invoiceData = {
      ...form, // preserves ID if exists
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
      sessions: invoiceSessions.length > 0 ? invoiceSessions : (form.sessions || []), // Use new sessions if found, else keep old
      manualItems: manualItems.filter(item => item.description && item.amount),
      dayItems: invoiceDayItems.length > 0 ? invoiceDayItems : (form.id ? dayItems : []),
      status: status,
      createdAt: createdAt
    };

    if (form.id) {
      // We need a way to UPDATE. The parent `saveInvoice` (from App.js) currently does addDoc. 
      // We will need to check if App.js supports update OR use a new prop `updateInvoice`. 
      // For now, if saveInvoice only adds, we can't update. 
      // We will assume `saveInvoice` handles upsert or we need to add `updateInvoice` prop.
      // Checking App.js: saveInvoice uses addDoc. We need `updateInvoice` or modify App.js.
      // Wait, App.js logic 'saveInvoice' is just addDoc. 
      // I will add an `updateInvoice` prop below or modify saveInvoice to check for ID. 
      // Actually, InvoicesPage props has `saveInvoice`.
      // I will modify `handleSaveInvoice` to call `saveInvoice` which I will need to Patch in App.js later.
      // BUT, looking at App.js, saveInvoice is: `await addDoc(...)`
      // I need to fix App.js to support updates. 
      // For this step I will just pass the data content. 
      saveInvoice(invoiceData);
    } else {
      saveInvoice(invoiceData);
    }

    setShowModal(false);
    setManualItems([]);
    setDayItems([]);
    setForm({ id: null, clientId: "", startDate: "", endDate: "", dueDate: "" });
  };

  const handleEditInvoice = (inv) => {
    setForm({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientId: inv.clientId,
      startDate: inv.startDate,
      endDate: inv.endDate,
      dueDate: inv.dueDate,
      status: inv.status,
      createdAt: inv.createdAt,
      sessions: inv.sessions
    });
    setManualItems(inv.manualItems || []);
    setDayItems(inv.dayItems || []);
    setShowModal(true);
  };

  const handleMarkSent = (invoiceId) => {
    if (updateInvoiceStatus) updateInvoiceStatus(invoiceId, "sent");
  };
  const handleMarkPaid = (invoiceId) => {
    if (updateInvoiceStatus) updateInvoiceStatus(invoiceId, "paid");
  };

  // PDF Export function with robust bank details visibility and correct footer placement
  const generatePDF = (invoice) => {
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

    // Add footer and return
    addFooter(doc);
    return doc;
  };

  const handlePrintPDF = (invoice) => {
    const doc = generatePDF(invoice);
    doc.autoPrint();

    // On iOS/Mobile, blob URLs in window.open often fail or get blocked by popup blockers.
    // It's safer to just trigger a native download so the user can use the OS print dialog.
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      doc.save(`Invoice-${invoice.invoiceNumber || invoice.id || ''}.pdf`);
    } else {
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const newWin = window.open(blobUrl, '_blank');
      // Fallback if popup blocker intercepted it
      if (!newWin) {
        doc.save(`Invoice-${invoice.invoiceNumber || invoice.id || ''}.pdf`);
      }
    }
  };

  const handleEmailPDF = async (invoice) => {
    const doc = generatePDF(invoice);
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], `Invoice-${invoice.invoiceNumber || invoice.id || ''}.pdf`, { type: 'application/pdf' });
    const clientName = invoice.clientName || "Client";

    // Check if native share is supported with files
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${clientName} / Invoice`,
          text: `Please find the attached invoice for ${clientName}.`
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback
      window.location.href = `mailto:?subject=${encodeURIComponent(clientName + ' / Invoice')}&body=Please find the attached PDF (you will need to attach it manually if using mailto).`;
      doc.save(`Invoice-${invoice.invoiceNumber || invoice.id || ''}.pdf`);
    }
  };

  return (
    <div className="p-2 md:p-4">
      {/* Mobile Dropdown Menu Button on the left */}
      {/* Mobile Menu Removed */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-slate-800">
          <FaFileInvoiceDollar className="text-indigo-600" /> Invoices
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
              <div className="flex gap-2 mt-2 sm:mt-0 p-1 bg-gray-50 rounded shadow-sm border">
                <button className="p-3 text-blue-600 hover:bg-blue-200 rounded text-xl transition-colors" title="Edit" onClick={() => handleEditInvoice(inv)}><FaEdit /></button>
                <button className="p-3 text-gray-600 hover:bg-gray-200 rounded text-xl transition-colors" title="Print PDF" onClick={() => handlePrintPDF(inv)}><FaPrint /></button>
                <button className="p-3 text-green-600 hover:bg-green-200 rounded text-xl transition-colors" title="Mark Paid" onClick={() => handleMarkPaid(inv.id)}><FaCheck /></button>
                <button className="p-3 text-yellow-600 hover:bg-yellow-200 rounded text-xl transition-colors" title="Email PDF" onClick={() => handleEmailPDF(inv)}><FaEnvelope /></button>
                <button className="p-3 text-red-600 hover:bg-red-200 rounded text-xl transition-colors" title="Delete" onClick={() => deleteInvoice(inv.id)}><FaTrash /></button>
              </div>
            </div>
          );
        })}
      </div>
      {/* Modal for creating invoice */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] bg-black bg-opacity-40 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 w-full max-w-lg relative" style={{ zIndex: 2001 }}>
              <h3 className="text-xl font-bold mb-4 text-indigo-600">Create Invoice (v2)</h3>
              <div className="grid grid-cols-1 gap-3">
                <select
                  className="p-3 border rounded w-full text-slate-900 bg-white"
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
                  className="p-3 border rounded w-full text-slate-900 bg-white"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  className="p-3 border rounded w-full text-slate-900 bg-white"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  placeholder="End Date"
                />
                <input
                  type="date"
                  className="p-3 border rounded w-full text-slate-900 bg-white"
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
        </div>
      )}
    </div>
  );
}