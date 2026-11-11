import React from "react";
import LegalLayout from "./LegalLayout";

export default function AccessibilityPage() {
  return (
    <LegalLayout
      title="Accessibility Statement"
      subtitle="Commitment to digital accessibility, WCAG 2.1 Level AA/AAA standards, and inclusive engineering."
      effectiveDate="3 June 2026"
    >
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">1. Our Commitment</h2>
        <p>
          Time Track Invoice and itsmyapp.co.uk are committed to ensuring digital accessibility for people with disabilities.
          We continually enhance user experience for everyone and apply relevant accessibility standards under the
          Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, targeting Level AAA contrast wherever technically feasible.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">2. Core Layout Engineering &amp; Standards</h2>
        <p>Our application architecture integrates the following accessibility considerations:</p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>
            <strong>High-Contrast Color Profiles:</strong> Interfaces are designed with strict contrast boundaries (targeting 7:1 for text)
            to support low-vision users and high-glare outdoor environments on site.
          </li>
          <li>
            <strong>Full Keyboard Navigation:</strong> All critical workflows (timer triggers, manual entries, invoice generation, modal toggles)
            support full tab sequencing, visible focus rings, and Escape-key dismissals.
          </li>
          <li>
            <strong>Semantic HTML &amp; ARIA Landmarks:</strong> Layouts utilize semantic elements (<code className="text-indigo-400 bg-slate-800 px-1 py-0.5 rounded font-mono">&lt;header&gt;</code>,
            <code className="text-indigo-400 bg-slate-800 px-1 py-0.5 rounded font-mono">&lt;main&gt;</code>,
            <code className="text-indigo-400 bg-slate-800 px-1 py-0.5 rounded font-mono">&lt;footer&gt;</code>,
            <code className="text-indigo-400 bg-slate-800 px-1 py-0.5 rounded font-mono">&lt;nav&gt;</code>)
            with explicit aria-labels and status announcements for screen readers.
          </li>
          <li>
            <strong>Voice Input Alternatives:</strong> Speech-to-text integration enables hands-free job and session logging for trade professionals.
          </li>
          <li>
            <strong>Responsive Viewport Scaling:</strong> The application supports up to 200% browser zoom without layout breakage or loss of content.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">3. Known Limitations &amp; Alternative Formats</h2>
        <p>
          While we strive for comprehensive accessibility, generated PDF invoices use vector positioning (jsPDF). If you require an invoice in an
          alternative accessible format (such as plain text, accessible CSV, or high-contrast large print), please reach out to our team.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">4. Feedback &amp; Contact</h2>
        <p>
          We welcome your feedback on the accessibility of Time Track Invoice. If you encounter accessibility barriers,
          please contact our accessibility lead:
        </p>
        <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/80 text-slate-300 text-sm">
          <p className="font-semibold text-white">Digital Accessibility Lead</p>
          <p>
            Email:{" "}
            <a href="mailto:hello@itsmyapp.co.uk" className="text-indigo-400 underline">
              hello@itsmyapp.co.uk
            </a>
          </p>
          <p className="mt-1 text-slate-400 text-xs">
            We aim to respond to accessibility feedback within 2 business days.
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}

