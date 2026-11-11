import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("privacy_consent_status");
      if (!consent) {
        setVisible(true);
      }
    } catch (e) {
      // If localStorage is unavailable, fail silently
    }
  }, []);

  const handleDecision = (decision) => {
    try {
      localStorage.setItem("privacy_consent_status", decision);
      if (decision === "rejected") {
        localStorage.setItem("analytics_opt_out", "true");
      }
    } catch (e) {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      role="region"
      className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6 bg-slate-950/95 backdrop-blur border-t border-slate-800 text-slate-100 shadow-2xl transition-transform"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Notice text */}
        <div className="text-xs md:text-sm text-slate-300 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" aria-hidden="true"></span>
            <span className="font-semibold text-white tracking-wide">
              Privacy &amp; Cookie Consent (UK GDPR / DUAA Compliant)
            </span>
          </div>
          <p className="leading-relaxed text-slate-400">
            We use strictly necessary storage for authentication and offline sync. First-party analytics operate under
            statutory DUAA exemptions for system performance. We never deploy commercial tracking pixels.
            Review our{" "}
            <Link to="/cookies" className="text-indigo-400 underline hover:text-indigo-300">
              Cookie Policy
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-indigo-400 underline hover:text-indigo-300">
              Privacy Policy
            </Link>.
          </p>
        </div>

        {/* Interaction Buttons - EQUAL PROMINENCE MANDATE */}
        {/* "The 'Accept All' and 'Reject All' UI interaction components must feature identical styling,
            including identical button sizing, font weight, background color, and contrast ratios." */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => handleDecision("rejected")}
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-colors cursor-pointer text-center"
          >
            Reject All
          </button>
          <button
            type="button"
            onClick={() => handleDecision("accepted")}
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-colors cursor-pointer text-center"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}

