import React from "react";
import LegalLayout from "./LegalLayout";

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="UK GDPR, Data (Use and Access) Act (DUAA 2025), and DMCCA compliant data processing disclosure."
      effectiveDate="3 June 2026"
    >
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">1. Data Minimization &amp; Architecture</h2>
        <p>
          Time Track Invoice is built on a strict privacy-by-design framework. We collect and process only the minimal
          necessary data items required to provide time logging, invoicing, and synchronization services:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>
            <strong>Identity Data:</strong> User account display name, business trade name, and unique authentication identifier (UID).
          </li>
          <li>
            <strong>Contact Data:</strong> User email address and phone number (if included on your invoice letterhead).
          </li>
          <li>
            <strong>Operational &amp; Financial Metadata:</strong> Client names/addresses, job logs, tracked session times,
            mileage records, line item amounts, and bank payment instructions (account number, sort code) saved exclusively to format your invoices.
          </li>
          <li>
            <strong>Technical Data:</strong> Ephemeral IP address, browser user-agent, operating system, and timestamp records
            used strictly for real-time security routing and session authentication.
          </li>
        </ul>
        <p>
          <strong>Cloud Isolation:</strong> All user reads and writes are securely sandboxed under your authenticated user
          path (<code className="text-indigo-400 bg-slate-800 px-1 py-0.5 rounded font-mono">users/&#123;uid&#125;/...</code>)
          with end-to-end TLS 1.3 encrypted transit and AES-256 encrypted storage at rest.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">2. Recognized Legitimate Interests (UK GDPR / DUAA Framework)</h2>
        <p>
          Pursuant to Article 6 of the UK GDPR (as amended by the Data (Use and Access) Act), processing conducted for system security,
          fraud mitigation, network integrity, technical abuse prevention, and emergency infrastructure fault isolation is handled
          under <strong>Recognized Legitimate Interests</strong>, omitting the requirement for a separate balancing test.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">3. Automated Decision-Making &amp; AI Transparency</h2>
        <p>
          Time Track Invoice does not deploy automated profiling or black-box algorithms that produce legal or similarly significant effects.
          Where AI tools (such as speech-to-text or automated voice input parsing) are utilized to help input invoice items, all data
          remains under user review prior to commitment. Users retain the explicit right to challenge outcomes, review transcriptions,
          and request human intervention at any time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">4. Subject Access Requests (SARs) &amp; Your Statutory Rights</h2>
        <p>Under UK data protection law, you possess explicit rights regarding your personal data:</p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li><strong>Right of Access:</strong> Request a full copy of all personal records maintained within your account.</li>
          <li><strong>Right to Rectification:</strong> Directly amend inaccurate client, billing, or personal details in-app.</li>
          <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request the permanent deletion of your account and associated database documents.</li>
          <li><strong>Right to Restrict or Object:</strong> Restrict processing or opt-out of optional analytics telemetry.</li>
        </ul>
        <p>
          Subject Access searches conducted by our team are &quot;reasonable and proportionate&quot; pursuant to DUAA statutory standards.
          The standard statutory 30-day timeline may be paused where clarification regarding request scope or identity verification is required.
        </p>
      </section>

      {/* Part III: Public Transparency Callout Duplication inside Contact/SAR Module */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">5. Contact Our Data Privacy Lead (Layered Notice)</h2>
        <div className="bg-slate-800/90 border border-indigo-700/60 p-5 rounded-xl shadow-inner">
          <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-2 font-mono">
            Information Commission Compliant Callout
          </p>
          <div className="text-slate-100 text-base leading-relaxed space-y-2">
            <p className="font-bold text-white">
              Data Privacy &amp; Compliance Queries:
            </p>
            <p>
              For any questions regarding your data rights, or to submit an inquiry, please
              contact our Data Privacy Lead directly at{" "}
              <a
                href="mailto:hello@itsmyapp.co.uk"
                className="text-indigo-400 font-semibold underline hover:text-indigo-300"
              >
                hello@itsmyapp.co.uk
              </a>
              . We formally acknowledge all compliance submissions within 30 days.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">6. Complaints &amp; Supervisory Authority Escalation</h2>
        <p>
          We commit to formal electronic acknowledgment and investigation of any compliance complaint within 30 days.
          If you remain dissatisfied with our resolution, you retain the statutory right to escalate your complaint directly to the UK
          Information Commissioner&apos;s Office (ICO):
        </p>
        <div className="bg-slate-800/40 p-4 rounded-lg text-slate-300 text-sm">
          <p className="font-semibold text-white">Information Commissioner&apos;s Office (ICO)</p>
          <p>Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF</p>
          <p>Helpline: 0303 123 1113 | Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">https://ico.org.uk</a></p>
        </div>
      </section>
    </LegalLayout>
  );
}

