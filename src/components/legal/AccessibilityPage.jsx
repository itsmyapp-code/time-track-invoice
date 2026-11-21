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
        <h2 className="text-xl font-bold text-slate-900">1. Our Commitment</h2>
        <p>
          <strong>Time Track Invoice</strong> and itsmyapp.co.uk are committed to ensuring digital accessibility for people with disabilities.
          We continually enhance user experience for everyone and apply relevant accessibility standards under the
          Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, targeting Level AAA contrast wherever technically feasible.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">2. Core Layout Engineering &amp; Standards</h2>
        <p>Our application architecture integrates the following accessibility considerations:</p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700">
          <li>
            <strong className="text-slate-900">High-Contrast Light-Mode Profiles:</strong> Interfaces are engineered in crisp Light Mode with strict contrast boundaries
            to support low-vision users and high-glare outdoor environments on site.
          </li>
          <li>
            <strong className="text-slate-900">Full Keyboard Navigation:</strong> All critical workflows (timer triggers, manual entries, session editing, invoice generation, modal toggles)
            support full tab sequencing and visible focus rings.
          </li>
          <li>
            <strong className="text-slate-900">Semantic HTML &amp; ARIA Landmarks:</strong> Layouts utilize semantic elements (
            <code className="text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded font-mono text-xs">&lt;header&gt;</code>,{" "}
            <code className="text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded font-mono text-xs">&lt;main&gt;</code>,{" "}
            <code className="text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded font-mono text-xs">&lt;footer&gt;</code>,{" "}
            <code className="text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded font-mono text-xs">&lt;nav&gt;</code>)
            with explicit aria-labels and reduced-motion support.
          </li>
          <li>
            <strong className="text-slate-900">Voice Input Alternatives:</strong> Speech-to-text integration enables hands-free job and session logging for trade professionals.
          </li>
          <li>
            <strong className="text-slate-900">Responsive Viewport Scaling:</strong> The application supports up to 200% browser zoom without layout breakage or loss of content.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">3. Known Limitations &amp; Alternative Formats</h2>
        <p>
          While we strive for comprehensive accessibility, generated PDF invoices use vector positioning (jsPDF). If you require an invoice in an
          alternative accessible format (such as plain text, accessible CSV, or high-contrast large print), please reach out to our team.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">4. Feedback &amp; Contact</h2>
        <p>
          We welcome your feedback on the accessibility of Time Track Invoice. If you encounter accessibility barriers,
          please contact our accessibility lead:
        </p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 text-sm">
          <p className="font-bold text-slate-900">Digital Accessibility Lead</p>
          <p className="mt-1">
            Email:{" "}
            <a href="mailto:hello@itsmyapp.co.uk" className="text-blue-700 font-semibold underline hover:text-orange-600">
              hello@itsmyapp.co.uk
            </a>
          </p>
          <p className="mt-1 text-slate-500 text-xs">
            We aim to respond to accessibility feedback within 2 business days.
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}
