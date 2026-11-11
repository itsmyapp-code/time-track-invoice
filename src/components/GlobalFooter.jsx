import React from "react";
import { Link } from "react-router-dom";

export default function GlobalFooter({ theme = "light" }) {
  const isDark = theme === "dark";

  return (
    <footer
      className={`border-t transition-colors ${
        isDark
          ? "border-slate-800 bg-slate-950 text-slate-400"
          : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col items-center text-center">
        {/* itsmyapp.co.uk Banner Card / Image */}
        <div className="w-full max-w-2xl mb-6">
          <a
            href="https://itsmyapp.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.01] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Visit itsmyapp.co.uk - Web Development & Digital Solutions"
          >
            <img
              src="/itsmyapp-banner.png"
              alt="Designed & Developed by itsmyapp.co.uk"
              className="w-full h-auto object-contain rounded-xl border border-slate-700/50"
            />
          </a>
        </div>

        {/* Legal Navigation Links */}
        <nav
          aria-label="Compliance and Legal Links"
          className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs md:text-sm font-medium mb-5"
        >
          <Link
            to="/terms"
            className={`transition-colors underline-offset-4 hover:underline ${
              isDark ? "hover:text-white text-slate-300" : "hover:text-indigo-600 text-slate-700"
            }`}
          >
            Terms of Service
          </Link>
          <span className="opacity-30" aria-hidden="true">•</span>
          <Link
            to="/privacy"
            className={`transition-colors underline-offset-4 hover:underline ${
              isDark ? "hover:text-white text-slate-300" : "hover:text-indigo-600 text-slate-700"
            }`}
          >
            Privacy Policy
          </Link>
          <span className="opacity-30" aria-hidden="true">•</span>
          <Link
            to="/cookies"
            className={`transition-colors underline-offset-4 hover:underline ${
              isDark ? "hover:text-white text-slate-300" : "hover:text-indigo-600 text-slate-700"
            }`}
          >
            Cookie Policy
          </Link>
          <span className="opacity-30" aria-hidden="true">•</span>
          <Link
            to="/accessibility"
            className={`transition-colors underline-offset-4 hover:underline ${
              isDark ? "hover:text-white text-slate-300" : "hover:text-indigo-600 text-slate-700"
            }`}
          >
            Accessibility Statement
          </Link>
        </nav>

        {/* Part III: Public Transparency Callout (UK GDPR / DUAA Layered Notice) */}
        <div
          className={`w-full max-w-2xl p-4 rounded-lg text-xs leading-relaxed mb-5 border text-left ${
            isDark
              ? "bg-slate-900/80 border-slate-800 text-slate-300"
              : "bg-slate-50 border-slate-200 text-slate-700"
          }`}
        >
          <p className="font-semibold mb-1 text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
            Data Privacy &amp; Compliance Queries:
          </p>
          <p>
            For any questions regarding your data rights, or to submit an inquiry, please contact our Data Privacy Lead directly at{" "}
            <a
              href="mailto:hello@itsmyapp.co.uk"
              className="font-medium underline hover:text-indigo-500"
            >
              hello@itsmyapp.co.uk
            </a>
            . We formally acknowledge all compliance submissions within 30 days.
          </p>
        </div>

        {/* Copyright and Attribution */}
        <div className="text-xs text-slate-400">
          <p>
            Powered by Time Track Invoice © 2026 ItsMyApp.co.uk | All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}

