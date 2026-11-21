import React, { useState, useEffect } from "react";
import LegalLayout from "./LegalLayout";

export default function CookiesPage() {
  const [analyticsOptOut, setAnalyticsOptOut] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("analytics_opt_out");
      if (saved === "true") {
        setAnalyticsOptOut(true);
      }
    } catch (e) {}
  }, []);

  const handleToggleAnalytics = () => {
    const nextState = !analyticsOptOut;
    setAnalyticsOptOut(nextState);
    try {
      localStorage.setItem("analytics_opt_out", nextState ? "true" : "false");
    } catch (e) {}
    setNotification(
      nextState
        ? "Analytics opt-out active. Performance logging disabled."
        : "Analytics enabled under DUAA performance optimization exemption."
    );
    setTimeout(() => setNotification(""), 3500);
  };

  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="Statutory compliance overview under UK GDPR, Data (Use and Access) Act (DUAA 2025), and Privacy and Electronic Communications Regulations (PECR)."
      effectiveDate="3 June 2026"
    >
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">1. What Are Cookies &amp; Local Storage?</h2>
        <p>
          Cookies and local storage tokens are small data items stored on your device that enable <strong>Time Track Invoice</strong> to authenticate
          users, maintain offline data caches, prevent multi-session abuse, and remember your application preferences.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">2. Categorization &amp; Statutory Framework</h2>

        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-emerald-700 text-base">Category 1: Strictly Necessary (Exempt from Consent)</h3>
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Always Active
            </span>
          </div>
          <p className="text-slate-700 text-sm">
            Essential tokens required to authenticate your user session with Firebase, establish secure TLS channels,
            guard against cross-site request forgery, and support offline IndexedDB local action queuing. These cannot be deactivated.
          </p>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-blue-700 text-base">Category 2: Analytics &amp; Web Optimization (DUAA Statutory Exemption)</h3>
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              DUAA Exempt / Opt-Out Available
            </span>
          </div>
          <p className="text-slate-700 text-sm">
            First-party, low-impact telemetry measuring software responsiveness, timer accuracy, and route performance.
            Pursuant to the Data (Use and Access) Act (DUAA 2025), prior affirmative consent is not required for first-party optimization,
            provided an accessible, free opt-out mechanism is available.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
            <span className="text-xs text-slate-700 font-medium">
              Client-Side Analytics Status:{" "}
              {analyticsOptOut ? (
                <strong className="text-red-700">Opted Out (Disabled)</strong>
              ) : (
                <strong className="text-emerald-700">Active (Optimization Mode)</strong>
              )}
            </span>
            <button
              type="button"
              onClick={handleToggleAnalytics}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors border ${
                analyticsOptOut
                  ? "bg-blue-700 hover:bg-blue-800 text-white border-blue-700"
                  : "bg-white hover:bg-red-50 text-red-700 border-red-300"
              }`}
            >
              {analyticsOptOut ? "Re-enable Analytics" : "Opt-Out of Analytics"}
            </button>
          </div>
          {notification && (
            <p className="text-xs text-blue-700 font-semibold">{notification}</p>
          )}
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-orange-700 text-base">Category 3: Third-Party Marketing Trackers</h3>
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
              Zero Deployed / Strictly Blocked
            </span>
          </div>
          <p className="text-slate-700 text-sm">
            Time Track Invoice deploys <strong>zero</strong> commercial advertising pixels, zero retargeting networks, and zero third-party
            surveillance trackers. Any non-essential scripts are programmatically blocked by default.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">3. Reset Cookie Preferences</h2>
        <p className="text-slate-700 text-sm">
          You can clear your stored consent preference at any time to re-trigger the primary presentation banner:
        </p>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.removeItem("privacy_consent_status");
              localStorage.removeItem("analytics_opt_out");
            } catch (e) {}
            window.location.reload();
          }}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
        >
          Reset Consent Decision
        </button>
      </section>
    </LegalLayout>
  );
}
