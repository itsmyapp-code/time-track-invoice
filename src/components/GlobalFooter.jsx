import React from "react";
import { Link } from "react-router-dom";

export default function GlobalFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col items-center text-center">
        {/* itsmyapp.co.uk Banner Card / Image */}
        <div className="w-full max-w-2xl mb-6">
          <a
            href="https://itsmyapp.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            title="Visit itsmyapp.co.uk - Web Development & Digital Solutions"
          >
            <img
              src="/itsmyapp-banner.png"
              alt="Designed & Developed by itsmyapp.co.uk"
              className="w-full h-auto object-contain"
            />
          </a>
        </div>

        {/* Legal Navigation Links */}
        <nav
          aria-label="Compliance and Legal Links"
          className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-xs md:text-sm font-semibold mb-5"
        >
          <Link
            to="/terms"
            className="text-slate-700 hover:text-blue-700 transition-colors underline-offset-4 hover:underline"
          >
            Terms of Service
          </Link>
          <span className="text-slate-300" aria-hidden="true">&bull;</span>
          <Link
            to="/privacy"
            className="text-slate-700 hover:text-blue-700 transition-colors underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          <span className="text-slate-300" aria-hidden="true">&bull;</span>
          <Link
            to="/cookies"
            className="text-slate-700 hover:text-blue-700 transition-colors underline-offset-4 hover:underline"
          >
            Cookie Policy
          </Link>
          <span className="text-slate-300" aria-hidden="true">&bull;</span>
          <Link
            to="/accessibility"
            className="text-slate-700 hover:text-blue-700 transition-colors underline-offset-4 hover:underline"
          >
            Accessibility Statement
          </Link>
        </nav>

        {/* Part III: Public Transparency Callout (UK GDPR / DUAA Layered Notice) */}
        <div className="w-full max-w-2xl p-4 rounded-2xl text-xs leading-relaxed mb-5 border border-slate-200 bg-slate-50 text-slate-700 text-left">
          <p className="font-bold mb-1 text-slate-900 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-700" aria-hidden="true"></span>
            Data Privacy &amp; Compliance Queries:
          </p>
          <p>
            For any questions regarding your data rights, or to submit an inquiry, please contact our Data Privacy Lead directly at{" "}
            <a
              href="mailto:hello@itsmyapp.co.uk"
              className="font-semibold text-blue-700 underline hover:text-orange-600 transition-colors"
            >
              hello@itsmyapp.co.uk
            </a>
            . We formally acknowledge all compliance submissions within 30 days.
          </p>
        </div>

        {/* Copyright and Attribution */}
        <div className="text-xs text-slate-500">
          <p>
            Powered by Time Track Invoice &copy; 2026 ItsMyApp.co.uk | All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
