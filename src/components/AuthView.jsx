import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaLock, FaEnvelope } from "react-icons/fa";
import GlobalFooter from "./GlobalFooter";

export default function AuthView({
    handleLogin,
    handleSignUp,
    authError,
    handlePasswordReset,
    email,
    setEmail,
    onSignUpSuccess
}) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showCookie, setShowCookie] = useState(false);

    // Modern styling classes
    const inputClass = "w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all";
    const labelClass = "block text-sm font-medium text-slate-700 mb-1";
    const btnPrimary = "w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5";

    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50">
            <div className="flex-1 flex items-center justify-center p-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-white p-2 rounded-full shadow-lg">
                            <img src="/logo.png" alt="Logo" className="h-16 w-16 object-contain" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
                    <p className="text-indigo-100">Sign in to manage your time and invoices</p>
                </div>

                <div className="p-8">
                    {authError && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                            {authError}
                        </div>
                    )}

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (isSignUp) {
                            handleSignUp(email, password);
                        } else {
                            handleLogin(email, password);
                        }
                    }}>
                        <div className="mb-6">
                            <label className={labelClass}>Email Address</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-3.5 text-slate-400" />
                                <input
                                    type="email"
                                    className={inputClass}
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className={labelClass}>Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-3.5 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={inputClass}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-3.5 text-slate-400 hover:text-indigo-600 text-sm font-semibold"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {!isSignUp && (
                                <div className="mt-2 text-right">
                                    <button
                                        type="button"
                                        onClick={() => handlePasswordReset(email)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                        </div>

                        <button type="submit" className={btnPrimary}>
                            {isSignUp ? "Create Account" : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-center gap-2">
                        <span className="text-slate-600 text-sm">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}
                        </span>
                        <button
                            className="text-indigo-600 hover:text-indigo-800 font-bold text-sm"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? "Sign In" : "Sign Up"}
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap justify-center gap-3 text-xs text-slate-500 font-medium">
                        <Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link>
                        <span>•</span>
                        <Link to="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
                        <span>•</span>
                        <Link to="/cookies" className="hover:text-indigo-600 transition-colors">Cookies</Link>
                        <span>•</span>
                        <Link to="/accessibility" className="hover:text-indigo-600 transition-colors">Accessibility</Link>
                    </div>
                </div>
            </div>
            </div>

            {/* Global Legal Compliance Footer */}
            <GlobalFooter theme="light" />

            {/* Modals */}
            {shouldShowModal(showTerms, setShowTerms, "Terms of Service", (
                <>
                    <p className="font-semibold">Last updated: October 4, 2025</p>

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
                    <p className="font-semibold">Last Updated: 4th October 2025</p>

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
                    <p className="font-semibold">Last Updated: 4th October 2025</p>

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

// Helper for Modals to reduce code duplication and ensure z-index correctness
function shouldShowModal(isOpen, setClose, title, content) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col relative z-50">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={() => setClose(false)} className="text-gray-400 hover:text-gray-600">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto text-sm text-gray-600 space-y-4">
                    {content}
                </div>
                <div className="p-6 border-t border-gray-100 text-right">
                    <button
                        onClick={() => setClose(false)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
