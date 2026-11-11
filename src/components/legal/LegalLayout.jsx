import React from "react";
import { Link, useNavigate } from "react-router-dom";
import GlobalFooter from "../GlobalFooter";

export default function LegalLayout({ title, subtitle, effectiveDate, children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Time Track Invoice" className="h-8 w-8 object-contain" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-base tracking-tight group-hover:text-indigo-400 transition-colors">
                Time Track Invoice
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                itsmyapp.co.uk
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              ← Back
            </button>
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Open App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 md:py-14">
        {/* Header Block */}
        <div className="mb-10 pb-6 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-950/60 text-indigo-400 border border-indigo-800/60 mb-3">
            <span>UK Compliance Framework 2026/2027</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-base text-slate-300">
              {subtitle}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
            <span>Effective Date: {effectiveDate || "3 June 2026"}</span>
            <span>•</span>
            <span>Review Cycle: Annual (Next: June 2027)</span>
            <span>•</span>
            <span>
              Data Controller:{" "}
              <a href="mailto:hello@itsmyapp.co.uk" className="text-indigo-400 hover:underline">
                hello@itsmyapp.co.uk
              </a>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <article className="prose prose-invert max-w-none text-slate-200 space-y-8 text-sm md:text-base leading-relaxed">
          {children}
        </article>
      </main>

      {/* Global Compliance Footer */}
      <GlobalFooter theme="dark" />
    </div>
  );
}

