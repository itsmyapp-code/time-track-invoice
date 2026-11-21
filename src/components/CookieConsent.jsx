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
      } else {
        localStorage.setItem("analytics_opt_out", "false");
      }
    } catch (e) {}
    setVisible(false);
  };

  if (!visible) return null;

  /* EQUAL PROMINENCE MANDATE (UK GDPR / DUAA 2025):
   * Identical sizing, font weight, background colour, border, and contrast ratio for both buttons. */
  const equalBtnClass =
    "flex-1 md:flex-initial min-w-[132px] px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-blue-700 hover:bg-blue-800 text-white border border-blue-700 shadow-sm transition-colors cursor-pointer text-center";

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      role="region"
      className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-5 bg-white/95 backdrop-blur border-t border-slate-200 text-slate-900 shadow-[0_-8px_30px_rgba(15,23,42,0.12)]"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Notice text */}
        <div className="text-xs md:text-sm text-slate-700 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" aria-hidden="true"></span>
            <span className="font-bold text-slate-900 tracking-tight">
              Privacy &amp; Cookie Consent (UK GDPR / DUAA Compliant)
            </span>
          </div>
          <p className="leading-relaxed text-slate-600">
            We use strictly necessary storage for authentication and offline sync. First-party analytics operate under
            statutory DUAA exemptions for system performance, and non-essential scripts remain blocked unless you opt in.
            Review our{" "}
            <Link to="/cookies" className="text-blue-700 font-semibold underline hover:text-orange-600">
              Cookie Policy
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-blue-700 font-semibold underline hover:text-orange-600">
              Privacy Policy
            </Link>.
          </p>
        </div>

        {/* Interaction Buttons — Equal Prominence, First-Layer Rejection */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => handleDecision("rejected")}
            className={equalBtnClass}
          >
            Reject All
          </button>
          <button
            type="button"
            onClick={() => handleDecision("accepted")}
            className={equalBtnClass}
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}
