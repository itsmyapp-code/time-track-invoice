import React, { useState, useEffect } from "react";
import LegalLayout from "./LegalLayout";

export default function CookiesPage() {
  const [analyticsOptOut, setAnalyticsOptOut] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("analytics_opt_out");
    if (saved === "true") {
      setAnalyticsOptOut(true);
    }
  }, []);

  const handleToggleAnalytics = () => {
    const nextState = !analyticsOptOut;
    setAnalyticsOptOut(nextState);
    localStorage.setItem("analytics_opt_out", nextState ? "true" : "false");
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
        <h2 className="text-xl font-bold text-white">1. What Are Cookies &amp; Local Storage?</h2>
        <p>
          Cookies and local storage tokens are small data items stored on your device that enable web applications to authenticate
          users, maintain offline data caches, prevent multi-session abuse, and remember your display configurations.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">2. Categorization &amp; Statutory Framework</h2>

        <div className="border border-slate-700/80 rounded-xl p-5 bg-slate-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-emerald-400 text-base">Category 1: Strictly Necessary (Exempt from Consent)</h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Always Active
            </span>
          </div>
          <p className="text-slate-300 text-sm">
            Essential tokens required to authenticate your user session with Firebase, establish secure TLS channels,
            guard against cross-site request forgery, and support offline IndexedDB local action queuing. These cannot be deactivated.
          </p>
        </div>

        <div className="border border-slate-700/80 rounded-xl p-5 bg-slate-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-indigo-400 text-base">Category 2: Analytics &amp; Web Optimization (DUAA Statutory Exemption)</h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              DUAA Exempt / Opt-Out Available
            </span>
          </div>
          <p className="text-slate-300 text-sm">
            First-party, low-impact telemetry measuring software responsiveness, timer accuracy, and route performance.
            Pursuant to the Data (Use and Access) Act (DUAA), prior affirmative consent is not required for first-party optimization,
            provided an accessible, free opt-out mechanism is available.
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-slate-700/60">
            <span className="text-xs text-slate-300 font-medium">
              Client-Side Analytics Status: {analyticsOptOut ? <strong className="text-rose-400">Opted Out (Disabled)</strong> : <strong className="text-emerald-400">Active (Optimization Mode)</strong>}
            </span>
            <button
              onClick={handleToggleAnalytics}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                analyticsOptOut
                  ? "bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                  : "bg-rose-900/40 hover:bg-rose-800/50 text-rose-200 border-rose-700/70"
              }`}
            >
              {analyticsOptOut ? "Re-enable Analytics" : "Opt-Out of Analytics"}
            </button>
          </div>
          {notification && (
            <p className="text-xs text-indigo-300 font-mono animate-pulse">{notification}</p>
          )}
        </div>

        <div className="border border-slate-700/80 rounded-xl p-5 bg-slate-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-amber-400 text-base">Category 3: Third-Party Marketing Trackers</h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              Zero Deployed / Strictly Blocked
            </span>
          </div>
          <p className="text-slate-300 text-sm">
            Time Track Invoice deploys <strong>zero</strong> commercial advertising pixels, zero retargeting networks, and zero third-party
            surveillance trackers. Any third-party trackers are programmatically intercepted and prohibited from loading.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">3. Reset Cookie Preferences</h2>
        <p className="text-slate-300 text-sm">
          You can clear your stored consent preference at any time to re-trigger the primary presentation banner:
        </p>
        <button
          onClick={() => {
            localStorage.removeItem("privacy_consent_status");
            localStorage.removeItem("analytics_opt_out");
            alert("Cookie consent preferences reset. The presentation banner will reappear on reload.");
            window.location.reload();
          }}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
        >
          Reset Consent Decision
        </button>
      </section>
    </LegalLayout>
  );
}

