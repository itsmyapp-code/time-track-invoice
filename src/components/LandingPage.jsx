import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaClock, FaFileInvoiceDollar, FaChartLine, FaMobileAlt, FaCloudUploadAlt, FaLock } from "react-icons/fa";
import GlobalFooter from "./GlobalFooter";

export default function LandingPage() {
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showCookie, setShowCookie] = useState(false);

    const featureClass = "flex flex-col items-center text-center p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-indigo-500 transition-all hover:-translate-y-1";

    return (
        <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-indigo-500 selection:text-white relative">
            {/* Navbar Option */}
            <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
                            <span className="font-bold text-xl tracking-tight text-white">Time Track Invoice</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/app" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">Log In</Link>
                            <Link to="/app" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-indigo-500/25">Get Started</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main>
                <div className="relative pt-20 pb-32 overflow-hidden">
                    {/* Background Glows */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 blur-[100px] rounded-full mix-blend-screen"></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 flex flex-col items-center sm:flex-row sm:justify-center gap-4">
                            <img src="/logo.png" alt="Logo" className="h-16 w-16 md:h-24 md:w-24 object-contain" />
                            <div className="flex flex-col text-left">
                                <span className="block text-slate-50">Simplified tracking.</span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Beautiful invoices.</span>
                            </div>
                        </h1>

                        <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-300 mb-10">
                            The all-in-one platform for freelancers and contractors to manage clients, track time across jobs, and get paid faster.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/app" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2">
                                Launch App <FaChartLine />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-24 bg-slate-900 border-t border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-50 mb-4">Everything you need to run your business</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto">No bloated features. Just the essential tools designed specifically for service professionals.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className={featureClass}>
                                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-4 text-2xl">
                                    <FaClock />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Smart Time Tracking</h3>
                                <p className="text-slate-400">Log time manually or use our built-in timer. Track half-days and full days effortlessly.</p>
                            </div>

                            <div className={featureClass}>
                                <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-4 text-2xl">
                                    <FaFileInvoiceDollar />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Instant Invoicing</h3>
                                <p className="text-slate-400">Convert your logged time directly into professional PDF invoices in just one click.</p>
                            </div>

                            <div className={featureClass}>
                                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-4 text-2xl">
                                    <FaCloudUploadAlt />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Offline Support</h3>
                                <p className="text-slate-400">Keep working even when you lose signal. Everything syncs automatically when you're back online.</p>
                            </div>

                            <div className={featureClass}>
                                <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center mb-4 text-2xl">
                                    <FaChartLine />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Reporting</h3>
                                <p className="text-slate-400">Get valuable insights into your unbilled time, business performance, and outstanding invoices.</p>
                            </div>

                            <div className={featureClass}>
                                <div className="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center mb-4 text-2xl">
                                    <FaMobileAlt />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Mobile First</h3>
                                <p className="text-slate-400">Designed to perform perfectly on your phone so you can track time while on the job site.</p>
                            </div>

                            <div className={featureClass}>
                                <div className="w-12 h-12 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center mb-4 text-2xl">
                                    <FaLock />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Secure Cloud</h3>
                                <p className="text-slate-400">Your data is securely backed up and synced in real-time. Never lose an invoice again.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Global Legal Compliance Footer */}
            <GlobalFooter theme="dark" />

            {/* Modals */}
            {shouldShowModal(showTerms, setShowTerms, "Terms of Service", (
                <>
                    <p className="font-semibold text-slate-700">Last updated: October 4, 2025</p>

                    <h3 className="font-bold text-gray-800 mt-4">1. Acceptance of Terms</h3>
                    <p>By accessing and using Time Track Invoice ("we," "us," or "our"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our service.</p>

                    <h3 className="font-bold text-gray-800 mt-4">2. User Account and Responsibilities</h3>
                    <p>Users are responsible for:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Maintaining the confidentiality of their account information</li>
                        <li>All activities that occur under their account</li>
                        <li>Ensuring the security of shared lockbox codes</li>
                        <li>Using the service in compliance with applicable laws</li>
                    </ul>

                    <h3 className="font-bold text-gray-800 mt-4">3. Data Security and Privacy</h3>
                    <p>We implement appropriate security measures to protect your data and lockbox codes. Your use of our service is also governed by our Privacy Policy, which explains how we collect, use, and protect your information.</p>

                    <h3 className="font-bold text-gray-800 mt-4">4. Prohibited Uses</h3>
                    <p>You may not use our service for:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Any unlawful purpose or activity</li>
                        <li>Violating any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                        <li>Transmitting or procuring the sending of any advertising or promotional material</li>
                        <li>Impersonating or attempting to impersonate the company, an employee, another user, or any other person</li>
                    </ul>

                    <h3 className="font-bold text-gray-800 mt-4">5. Limitation of Liability</h3>
                    <p>In no event shall Time Track Invoice, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the service.</p>

                    <h3 className="font-bold text-gray-800 mt-4">6. Termination</h3>
                    <p>We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever including but not limited to a breach of the Terms.</p>

                    <h3 className="font-bold text-gray-800 mt-4">7. Changes to Terms</h3>
                    <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.</p>

                    <h3 className="font-bold text-gray-800 mt-4">8. Contact Information</h3>
                    <p>If you have any questions about these Terms of Service, please contact us at hello@itsmyapp.co.uk.</p>
                </>
            ))}

            {shouldShowModal(showPrivacy, setShowPrivacy, "Privacy Policy", (
                <>
                    <p className="font-semibold text-slate-700">Last Updated: 4th October 2025</p>

                    <h3 className="font-bold text-gray-800 mt-4">1. Introduction</h3>
                    <p>Time Track Invoice ("we," "us," or "our") is committed to protecting and respecting your privacy. This policy explains what personal data we collect from you, how we use it, and your rights under the UK General Data Protection Regulation (UK GDPR).</p>

                    <h3 className="font-bold text-gray-800 mt-4">2. Data We Collect About You</h3>
                    <p>We may collect and process the following data about you:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Identity Data: Includes first name, last name, username.</li>
                        <li>Contact Data: Includes billing address, email address, and telephone numbers.</li>
                        <li>Financial Data: Includes payment card details, which are processed securely by our third-party payment provider (e.g., Stripe, PayPal) and are not stored by us.</li>
                        <li>Transaction Data: Includes details about payments to and from you and other details of products and services you have purchased from us.</li>
                        <li>Technical Data: Includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, and other technology on the devices you use to access this website.</li>
                        <li>Usage Data: Includes information about how you use our website and services.</li>
                    </ul>

                    <h3 className="font-bold text-gray-800 mt-4">3. How We Use Your Personal Data</h3>
                    <p>We use your data for the following purposes:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>To register you as a new customer.</li>
                        <li>To process and deliver your subscription, including managing payments.</li>
                        <li>To manage our relationship with you, including notifying you about changes to our terms or privacy policy.</li>
                        <li>To administer and protect our business and this website (including troubleshooting, data analysis, testing, and system maintenance).</li>
                        <li>To deliver relevant website content and advertisements to you.</li>
                    </ul>

                    <h3 className="font-bold text-gray-800 mt-4">4. Legal Basis for Processing</h3>
                    <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Performance of Contract: Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                        <li>Legitimate Interests: Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Legal Obligation: Where we need to comply with a legal or regulatory obligation.</li>
                    </ul>

                    <h3 className="font-bold text-gray-800 mt-4">5. Data Security</h3>
                    <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way.</p>

                    <h3 className="font-bold text-gray-800 mt-4">6. Data Retention</h3>
                    <p>We will only retain your personal data for as long as necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.</p>

                    <h3 className="font-bold text-gray-800 mt-4">7. Your Legal Rights</h3>
                    <p>Under UK data protection law, you have rights including:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Right of access: You have the right to ask us for copies of your personal information.</li>
                        <li>Right to rectification: You have the right to ask us to rectify information you think is inaccurate.</li>
                        <li>Right to erasure: You have the right to ask us to erase your personal information in certain circumstances.</li>
                        <li>Right to restriction of processing: You have the right to ask us to restrict the processing of your information in certain circumstances.</li>
                        <li>Right to object to processing: You have the right to object to the processing of your personal data in certain circumstances.</li>
                        <li>Right to data portability: You have the right to ask that we transfer the information you gave us to another organisation, or to you, in certain circumstances.</li>
                    </ul>
                    <p className="mt-2">To exercise any of these rights, please contact us at hello@itsmyapp.co.uk.</p>

                    <h3 className="font-bold text-gray-800 mt-4">8. Changes to this Privacy Policy</h3>
                    <p>We may update this privacy policy from time to time. The updated version will be indicated by a "Last Updated" date.</p>

                    <h3 className="font-bold text-gray-800 mt-4">9. Contact Us</h3>
                    <p>If you have any questions about this Privacy Policy, please contact us at hello@itsmyapp.co.uk. You also have the right to make a complaint at any time to the Information Commissioner's Office (ICO), the UK supervisory authority for data protection issues (www.ico.org.uk).</p>
                </>
            ))}

            {shouldShowModal(showCookie, setShowCookie, "Cookie Policy", (
                <>
                    <p className="font-semibold text-slate-700">Last Updated: 4th October 2025</p>

                    <h3 className="font-bold text-gray-800 mt-4">1. What Are Cookies?</h3>
                    <p>A cookie is a small text file that a website stores on your computer or mobile device when you visit the site. It enables the website to remember your actions and preferences (such as login, language, font size, and other display preferences) over a period of time, so you don't have to keep re-entering them whenever you come back to the site or browse from one page to another.</p>

                    <h3 className="font-bold text-gray-800 mt-4">2. How We Use Cookies</h3>
                    <p>We use cookies to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Make our website work: Some cookies are essential for the operation of our website. For example, they allow us to identify subscribers and ensure they can access the subscription-only pages.</li>
                        <li>Analyse website usage: We use analytics cookies to understand how our visitors use our website, which helps us to improve its performance.</li>
                        <li>Remember your preferences: Functional cookies are used to remember choices you make (such as your username) and provide enhanced, more personal features.</li>
                    </ul>

                    <h3 className="font-bold text-gray-800 mt-4">3. Types of Cookies We Use</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Strictly Necessary Cookies: These are required for the operation of our Service. They include, for example, cookies that enable you to log into secure areas.</li>
                        <li>Analytical/Performance Cookies: These allow us to recognise and count the number of visitors and to see how visitors move around our Service when they are using it.</li>
                        <li>Functionality Cookies: These are used to recognise you when you return to our Service. This enables us to personalise our content for you and remember your preferences.</li>
                    </ul>

                    <h3 className="font-bold text-gray-800 mt-4">4. Your Choices Regarding Cookies</h3>
                    <p>When you first visit our website, you will be shown a cookie banner requesting your consent to use non-essential cookies. You can manage your cookie preferences at any time. Most web browsers also allow you to control cookies through their settings.</p>
                    <p className="mt-2">Please note that if you disable strictly necessary cookies, you may not be able to access all or parts of our site.</p>

                    <h3 className="font-bold text-gray-800 mt-4">5. Changes to This Cookie Policy</h3>
                    <p>We may update this policy from time to time. We encourage you to review this policy periodically to stay informed about our use of cookies.</p>

                    <h3 className="font-bold text-gray-800 mt-4">6. Contact Us</h3>
                    <p>If you have any questions about our use of cookies, please contact us at hello@itsmyapp.co.uk.</p>
                </>
            ))}
        </div>
    );
}

// Helper for Modals
function shouldShowModal(isOpen, setClose, title, content) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col relative">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center text-slate-800">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={() => setClose(false)} className="text-gray-400 hover:text-gray-600">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto text-sm text-gray-600 space-y-4 text-left">
                    {content}
                </div>
                <div className="p-6 border-t border-gray-100 text-right">
                    <button
                        onClick={() => setClose(false)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
