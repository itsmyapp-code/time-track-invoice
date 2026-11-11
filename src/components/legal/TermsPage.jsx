import React from "react";
import LegalLayout from "./LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Binding contractual agreement and terms of use for Time Track Invoice (itsmyapp.co.uk)."
      effectiveDate="3 June 2026"
    >
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
        <p>
          By accessing, installing, browsing, or using <strong>Time Track Invoice</strong> (the &quot;Service&quot;,
          operated by itsmyapp.co.uk and its enterprise operations), you explicitly agree to be bound by these
          binding Terms of Service. If you do not accept these terms, you must discontinue use of the Service immediately.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">2. User Responsibilities &amp; Account Security</h2>
        <p>
          Users assume full liability for maintaining the confidentiality of their account credentials, session states,
          offline authentication tokens, and any locally managed business records (such as client rates, invoices, and
          shared lockbox access codes). You are entirely responsible for all activity conducted under your authenticated UID.
        </p>
        <p>
          You agree to immediately notify us at{" "}
          <a href="mailto:hello@itsmyapp.co.uk" className="text-indigo-400 underline">
            hello@itsmyapp.co.uk
          </a>{" "}
          of any unauthorized use or security compromise regarding your account.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">3. Prohibited Conduct</h2>
        <p>Users must not engage in any of the following activities:</p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>Unlawful use, fraudulent time tracking, deceptive billing, or tax evasion practices.</li>
          <li>Deploying malware, viruses, worms, Trojan horses, or harmful code to our infrastructure or users.</li>
          <li>Automated scraping, bulk querying, data harvesting, or denial-of-service attempts.</li>
          <li>Reverse engineering, decompiling, or attempting to extract proprietary algorithms of the Service.</li>
          <li>Circumventing licensing, billing paywalls, or multi-tenant cloud security rules.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">4. Subscriptions, Pricing &amp; Cancellation Automation</h2>
        <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/80 space-y-2 text-slate-300">
          <p className="font-semibold text-white">The &quot;Same-Channel&quot; Exit (DMCCA / UK Framework):</p>
          <p>
            Any user subscribing to paid tiers or Pro plans can natively cancel or modify their subscription at any
            time using the clear, single-click &quot;Manage Subscription&quot; link directly inside their in-app Settings profile.
            Cancellation is direct, instantaneous, and entirely void of conversion sludge, retention walls, or forced questionnaires.
          </p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/80 space-y-2 text-slate-300">
          <p className="font-semibold text-white">Statutory 14-Day Cooling-Off Cancellation Rights:</p>
          <p>
            In accordance with statutory consumer rights, our state logic monitors and honours a 14-day cooling-off
            cancellation period triggered at:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The start of any initial subscription contract.</li>
            <li>The transition from a free/discounted trial period to a paid plan.</li>
            <li>Following any automatic renewal extending the contract by 12 months or more.</li>
          </ul>
          <p className="pt-1">
            <strong>Proportionate Refund Calculations:</strong> If a cancellation occurs within the statutory 14-day
            cooling-off window following a renewal, our automated billing engine credits a proportionate refund corresponding
            to the unconsumed billing duration.
          </p>
        </div>
        <p>
          <strong>Anti-Drip Pricing:</strong> Displayed subscription prices at checkout represent the absolute total cost,
          including all mandatory fees, payment processing costs, and applicable taxes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">5. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted under UK law, the Service is provided on an &quot;as-is&quot; and &quot;as-available&quot;
          basis. The Data Controller and itsmyapp.co.uk accept no liability for any indirect, incidental, special, or consequential
          damages, loss of business revenue, loss of billable profits, data loss, or downtime arising out of the use or inability to use the Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">6. Termination</h2>
        <p>
          We reserve the right to instantly suspend or terminate user accounts or revoke cloud synchronization following a
          verified breach of these terms, harmful system abuse, or fraudulent activity.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">7. Governing Law &amp; Jurisdiction</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes
          shall be subject to the exclusive jurisdiction of the courts of England and Wales.
        </p>
      </section>
    </LegalLayout>
  );
}

