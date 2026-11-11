# COMPLIANCE MD: MASTER FRAMEWORK
**Document Classification:** Internal Governance & Public Manifest Templates  
**Framework Status:** Certified Compliant (UK GDPR / DUAA 2025 / DMCCA 2024 Frameworks)  
**Application Name:** Time Track Invoice (https://timetrackinvoice.co.uk / developer.itsmyapp.co.uk)  
**Effective Date:** 3 June 2026  
**Review Cycle:** Annual (Next Review: June 2027)  
**Data Controller Endpoint:** [hello@itsmyapp.co.uk](mailto:hello@itsmyapp.co.uk)  
**Parent Entity:** itsmyapp.co.uk & Associated Enterprise Operations  

---

## Part I: Compliance Core & System Logic

This section defines the hardcoded logic, UI requirements, and behavioral guardrails built into the software architecture of **Time Track Invoice**.

### 1. Cookie & Consent Layer
The application deploys a compliant, privacy-by-design consent management system. No non-essential tracking scripts, advertising pixels, or analytics storage tokens initialize prior to an explicit, affirmative user action.

**UI/UX Requirements:**
- **Equal Prominence:** The "Accept All" and "Reject All" UI interaction components feature identical styling, including identical button sizing, font weight, background color, and contrast ratios. No dark patterns or hidden text links are permitted.
- **First-Layer Rejection:** Users are empowered to reject all non-essential trackers directly on the primary layer of the presentation banner without forced navigation to secondary settings.
- **Script Interception:** All marketing, retargeting, and tracking frameworks are programmatically blocked from executing until a positive "Accept" event fires.

**Statutory Exemptions (Data (Use and Access) Act Framework):**
Consent is not required to deposit cookie parameters or local storage keys used exclusively for:
1. **Analytics & Web Optimization:** First-party performance metrics tracking site layout usage, provided a clear, accessible, and free opt-out mechanism is available to the user.
2. **Security & Fraud Mitigation:** Background processing items running checks to detect technical faults, prevent multi-session abuse, or stop fraudulent network activities.
3. **User-Imposed Appearance:** Storing explicit, user-selected interface states (such as an active dark mode setting or localized language selection).

### 2. Subscription & Pricing Automation
- **The "Same-Channel" Exit:** Subscriptions created online or in-app can be terminated natively using a clear, single-click toggle/link within account settings directing to the self-service Stripe billing portal, void of conversion sludge, retention walls, or forced feedback forms.
- **Statutory Cooling-Off Triggers:** State logic respects a user's 14-day cooling-off cancellation window at:
  - The start of the initial contract.
  - The transition from a free/discounted trial period to a standard paid tier.
  - Following any automatic renewal extending the contract period by 12 months or more.
- **Proportionate Refund Calculations:** For cancellations executed within a 14-day cooling-off window post-trial or post-annual renewal, systems calculate proportionate refunds for unconsumed periods.
- **Proactive Renewal Alert Triggers:** Explicit renewal notices are dispatched prior to automated renewal events with price, billing date, duration, and direct cancellation links.
- **Anti-Drip Pricing Funnels:** Displayed transaction prices represent the absolute total cost, inclusive of all mandatory fees, administrative charges, and applicable taxes.

---

## Part II: Static Page Compliance Templates

The application serves four mandatory dedicated routes:
1. `/terms`: Terms of Service
2. `/privacy`: Privacy Policy
3. `/cookies`: Cookie Policy
4. `/accessibility`: Accessibility Statement

---

## Part III: Public Transparency Callout

> **Data Privacy & Compliance Queries:**  
> For any questions regarding your data rights, or to submit an inquiry, please contact our Data Privacy Lead directly at [hello@itsmyapp.co.uk](mailto:hello@itsmyapp.co.uk). We formally acknowledge all compliance submissions within 30 days.

*(Prominently displayed within the global navigation footer layout and duplicated inside the contact/SAR module of the `/privacy` route.)*

---

## Part IV: Internal Accountability Logs

*GOVERNANCE RULE: Maintained within source code and corporate governance files under Article 24 of the UK GDPR.*

### LOG A: STATUTORY DPO NEED ASSESSMENT
**INTERNAL COMPLIANCE DETERMINATION: DATA PROTECTION OFFICER (DPO) ROSTER**  
**Parent Entity:** itsmyapp.co.uk & Associated Enterprise Operations  
**Application:** Time Track Invoice  
**Statutory Evaluation Under UK GDPR (As Amended by DUAA 2025):**

In accordance with Article 37(1) of the UK General Data Protection Regulation (UK GDPR), the Data Controller has conducted a formal assessment to determine if the appointment of a mandatory Data Protection Officer (DPO) is required for current operations.

The Data Controller concludes that a formal, independent DPO is **NOT** statutorily required based on the following determinations:
1. **Public Body Status:** The organisation is a private, self-employed enterprise and does not constitute a public authority or body.
2. **Scale of Monitoring:** While software applications process personal metadata (Names, Emails, and IP addresses) to facilitate user sessions, core activities do not encompass "regular and systematic monitoring of data subjects on a large scale" (e.g., behavioral ad tracking, widespread geolocation logging, or mass surveillance).
3. **Special Category Data:** The enterprise does not process "special category data" (under Article 9, such as health metrics, biometrics, or political affiliations) or criminal conviction data on any scale as a core operational feature.

**Active Operational Safeguards:**  
To satisfy the Accountability Principle (Article 24), data governance duties—including the resolution of Subject Access Requests (SARs), security log auditing, breach response protocol, and third-party vendor processor reviews—shall be managed internally by the designated Data Privacy Lead. This determination will be reassessed instantly if application scopes expand into high-risk processing or educational sector data infrastructure.

*Signed: Lead Architect & Controller, itsmyapp.co.uk*

---

### LOG B: DATA PRIVACY LEAD APPOINTMENT
**INTERNAL APPOINTMENT: DATA PRIVACY LEAD & COMPLIANCE OWNER**  

1. **Designation & Contact Mapping:**  
The enterprise officially designates the principal operator of `itsmyapp.co.uk` to act as the internal Data Privacy Lead. All external compliance touchpoints, user privacy inquiries, and statutory complaints are mapped directly to the unified endpoint: [hello@itsmyapp.co.uk](mailto:hello@itsmyapp.co.uk).

2. **Core Remit & Responsibilities:**  
The Data Privacy Lead assumes operational ownership over the following information governance pillars:
- **Consent Infrastructure Enforcement:** Ensuring all active app templates strictly deploy the "Equal Prominence" cookie layouts, execute first-layer opt-outs, and block marketing tracking scripts by default until positive opt-in is registered.
- **Data Subject Rights Execution:** Managing, verifying, and fulfilling user Subject Access Requests (SARs) or "Right to Erasure" (deletion) commands within the statutory one-month window, using "reasonable and proportionate" search criteria under DUAA parameters.
- **Security & Encryption Auditing:** Maintaining architectural overwatch to ensure production databases, storage handling, and API syncs utilize end-to-end TLS/SSL transmission and role-based validation.
- **Incident & Breach Governance:** Maintaining readiness to isolate system vulnerabilities and, if a high-risk data breach occurs, execute formal notification procedures to the Information Commissioner's Office (ICO) within the strict 72-hour window.

3. **Public Disclosure Alignment:**  
This internal designation directly powers customer-facing data governance callouts, providing a transparent path for human intervention and electronic dispute handling without triggering statutory conflict-of-interest rules associated with an official DPO title.

---

## Part V: Global AI & System Instructions

- **Dynamic Injection:** `{{APP_NAME}}` is resolved to **Time Track Invoice**, `{{DATE}}` is resolved to active dates.
- **Hyperlink Protocols:** All instances of `hello@itsmyapp.co.uk` are compiled into active [mailto:hello@itsmyapp.co.uk](mailto:hello@itsmyapp.co.uk) links.
- **Global Navigation Footer:** Every application deployment features a global footer displaying the itsmyapp.co.uk brand banner, copyright notice, layered transparency notice, and active links directing users to `/terms`, `/privacy`, `/cookies`, and `/accessibility`.

