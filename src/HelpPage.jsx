import React from "react";
import { useNavigate } from "react-router-dom";

export default function HelpPage() {
  const navigate = useNavigate();
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
        onClick={() => navigate("/dashboard")}
      >
        ← Return to Dashboard
      </button>
      <h1 className="text-3xl font-bold mb-4 text-blue-800">Help & User Guide</h1>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Welcome to Time Track Invoice</h2>
        <p>This app helps you track your work sessions, manage clients and jobs, and generate professional invoices with PDF export and branding. Below you'll find instructions for all major features.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Getting Started</h2>
        <ul className="list-disc ml-6">
          <li>Use the menu at the top to navigate between Dashboard, Jobs, Clients, Invoices, and Reports.</li>
          <li>To add a new client or job, go to the respective page and click the <span className="font-bold">Add</span> button.</li>
          <li>Sessions are automatically tracked for jobs; you can view and filter them in Reports.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Creating Invoices</h2>
        <ol className="list-decimal ml-6">
          <li>Go to the <span className="font-bold">Invoices</span> page.</li>
          <li>Click <span className="font-bold">Create Invoice</span>.</li>
          <li>Select a client, set the date range, and due date.</li>
          <li>Review the automatically included sessions. You can add manual items or day rates if needed.</li>
          <li>Click <span className="font-bold">Save Invoice</span> to save as draft.</li>
        </ol>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Exporting & Printing Invoices</h2>
        <ul className="list-disc ml-6">
          <li>On the Invoices page, click the <span className="font-bold">Print PDF</span> icon next to any invoice.</li>
          <li>The PDF will include your business and client details, sessions, totals, branding, and footer.</li>
          <li>Logos and footer are automatically added. You can print or save the PDF for your records.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Marking Invoices Sent or Paid</h2>
        <ul className="list-disc ml-6">
          <li>Use the <span className="font-bold">Envelope</span> icon to mark an invoice as sent.</li>
          <li>Use the <span className="font-bold">Check</span> icon to mark as paid.</li>
          <li>Status badges show draft, sent, or paid. Overdue invoices are highlighted.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Managing Clients & Jobs</h2>
        <ul className="list-disc ml-6">
          <li>Clients and jobs can be added, edited, or deleted from their respective pages.</li>
          <li>Each job is linked to a client and can have its own rates and details.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Reports & Session Tracking</h2>
        <ul className="list-disc ml-6">
          <li>Use the Reports page to view, filter, and export session data.</li>
          <li>Sessions are grouped by job and client, with totals for hours and amounts.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Settings & Branding</h2>
        <ul className="list-disc ml-6">
          <li>Your business details, logo, and terms are set in the app settings.</li>
          <li>These details appear on all invoices and PDFs.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Troubleshooting</h2>
        <ul className="list-disc ml-6">
          <li>If you encounter issues with PDF export, ensure your browser allows popups and downloads.</li>
          <li>For missing data, check that all required fields are filled in for clients and jobs.</li>
          <li>Contact support at <a href="mailto:support@itsmyapp.co.uk" className="text-blue-600">support@itsmyapp.co.uk</a> for further help.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">About</h2>
        <p>Time Track Invoice is developed by <a href="https://itsmyapp.co.uk" className="text-blue-600">itsmyapp.co.uk</a>. Copyright 2025.</p>
      </section>
    </div>
  );
}
