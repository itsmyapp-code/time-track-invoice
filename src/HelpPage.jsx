import React from "react";
import { useNavigate } from "react-router-dom";

export default function HelpPage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 text-slate-700">
        <button
          type="button"
          className="mb-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
          onClick={() => navigate("/dashboard")}
        >
          &larr; Return to Dashboard
        </button>

        <h1 className="text-3xl font-extrabold mb-2 text-slate-900 tracking-tight">Help &amp; User Guide</h1>
        <p className="text-sm text-slate-500 mb-8 pb-5 border-b border-slate-200">
          Everything you need to track time, manage clients &amp; jobs, and generate professional PDF invoices.
        </p>

        <div className="space-y-6 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Welcome to Time Track Invoice</h2>
            <p>
              Time Track Invoice helps you track your work sessions, manage clients and jobs, log day rates &amp; mileage, and generate branded PDF invoices—even while offline.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Getting Started</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Use the sidebar menu to navigate between Dashboard, Jobs, Clients, Invoices, and Reports.</li>
              <li>To add a new client or job, go to the respective page and click the <span className="font-semibold text-slate-900">Add</span> button.</li>
              <li>Start a live timer from the Dashboard or Jobs page, or log sessions manually.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Editing Logged or Manual Sessions</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Open <span className="font-semibold text-slate-900">Jobs</span>, expand a client, and click <span className="font-semibold text-slate-900">Show Sessions</span> on any job.</li>
              <li>Click the <span className="font-semibold text-slate-900">Edit</span> button next to any session to adjust the Date, Start Time, End Time, or Notes.</li>
              <li>The duration recalculates automatically and updates your Reports and Invoices immediately.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Creating &amp; Exporting Invoices</h2>
            <ol className="list-decimal ml-6 space-y-1">
              <li>Go to the <span className="font-semibold text-slate-900">Invoices</span> page and click <span className="font-semibold text-slate-900">Create Invoice</span>.</li>
              <li>Select a client, set the date range, and due date.</li>
              <li>Review the automatically included sessions, add manual items or mileage overrides if needed, and click <span className="font-semibold text-slate-900">Save Invoice</span>.</li>
              <li>Click the <span className="font-semibold text-slate-900">Print PDF</span> or <span className="font-semibold text-slate-900">Email PDF</span> icon to export or share your invoice.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Settings &amp; Subscription</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Configure your business address, VAT number, bank details, mileage rate, and invoice terms in <span className="font-semibold text-slate-900">Settings</span>.</li>
              <li>Manage or cancel your subscription in one click using <span className="font-semibold text-slate-900">Manage Subscription</span> in Settings.</li>
            </ul>
          </section>

          <section className="pt-4 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Support &amp; Contact</h2>
            <p>
              Need help or have a question? Contact us at{" "}
              <a href="mailto:hello@itsmyapp.co.uk" className="text-blue-700 font-semibold underline hover:text-orange-600">
                hello@itsmyapp.co.uk
              </a>
              . Time Track Invoice is developed by{" "}
              <a href="https://itsmyapp.co.uk" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-semibold underline hover:text-orange-600">
                itsmyapp.co.uk
              </a>{" "}
              &copy; 2026.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
