import React from "react";
import { Link, useNavigate } from "react-router-dom";
import GlobalFooter from "../GlobalFooter";

export default function LegalLayout({ title, subtitle, effectiveDate, children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans selection:bg-blue-700 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Time Track Invoice" className="h-9 w-9 object-contain" />
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 text-base tracking-tight group-hover:text-blue-700 transition-colors leading-tight">
                Time Track Invoice
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                <img src="/itsmyapp-logo.png" alt="ItsMyApp" className="h-3 w-3 object-contain" />
                Part of ItsMyApp
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              &larr; Back
            </button>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition-colors"
            >
              Open App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-10">
          {/* Header Block */}
          <div className="mb-8 pb-6 border-b border-slate-200">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
              <span>UK Compliance Framework 2026/2027</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-base text-slate-600">
                {subtitle}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-slate-500">
              <span>Effective Date: <strong className="text-slate-700">{effectiveDate || "3 June 2026"}</strong></span>
              <span aria-hidden="true">&bull;</span>
              <span>Review Cycle: Annual (Next: June 2027)</span>
              <span aria-hidden="true">&bull;</span>
              <span>
                Data Controller:{" "}
                <a href="mailto:hello@itsmyapp.co.uk" className="text-blue-700 font-semibold underline hover:text-orange-600">
                  hello@itsmyapp.co.uk
                </a>
              </span>
            </div>
          </div>

          {/* Content Body */}
          <article className="max-w-none text-slate-700 space-y-8 text-sm md:text-base leading-relaxed">
            {children}
          </article>
        </div>
      </main>

      {/* Global Compliance Footer */}
      <GlobalFooter />
    </div>
  );
}
