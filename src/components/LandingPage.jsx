import React from "react";
import { Link } from "react-router-dom";
import { FaClock, FaFileInvoiceDollar, FaChartLine, FaMobileAlt, FaCloudUploadAlt, FaLock } from "react-icons/fa";
import GlobalFooter from "./GlobalFooter";

export default function LandingPage() {
    const featureClass =
        "flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all hover:-translate-y-0.5";

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-blue-700 selection:text-white flex flex-col">
            {/* Navbar */}
            <nav className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Time Track Invoice" className="h-9 w-9 object-contain" />
                            <div className="flex flex-col">
                                <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-tight">
                                    Time Track Invoice
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    <img src="/itsmyapp-logo.png" alt="ItsMyApp" className="h-3 w-3 object-contain" />
                                    Part of ItsMyApp
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                to="/app"
                                className="text-sm font-semibold text-slate-600 hover:text-blue-700 transition-colors hidden sm:block"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/app"
                                className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md shadow-blue-700/20"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1">
                <div className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
                    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-6">
                            <img src="/itsmyapp-logo.png" alt="ItsMyApp" className="h-4 w-4 object-contain" />
                            <span>Part of the ItsMyApp Suite</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 flex flex-col items-center sm:flex-row sm:justify-center gap-5">
                            <img src="/logo.png" alt="Time Track Invoice" className="h-20 w-20 md:h-24 md:w-24 object-contain drop-shadow-md" />
                            <div className="flex flex-col text-center sm:text-left">
                                <span className="block text-slate-900">Simplified tracking.</span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-orange-500">
                                    Beautiful invoices.
                                </span>
                            </div>
                        </h1>

                        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
                            The all-in-one platform for freelancers, trades, and contractors to manage clients, track billable hours &amp; mileage, and get paid faster.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                to="/app"
                                className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-full text-base md:text-lg font-bold transition-all shadow-lg shadow-blue-700/25 flex items-center justify-center gap-2.5"
                            >
                                Launch App <FaChartLine />
                            </Link>
                            <Link
                                to="/app"
                                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-8 py-4 rounded-full text-base md:text-lg font-bold transition-all shadow-sm flex items-center justify-center"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-20 bg-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-2">
                                Built for Professionals
                            </p>
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
                                Everything you need to run your business
                            </h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                No bloated features. Just the essential tools designed specifically for service professionals.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className={featureClass}>
                                <div className="w-12 h-12 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl flex items-center justify-center mb-4 text-2xl">
                                    <FaClock />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Time Tracking</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Log time manually, edit sessions anytime, or use our built-in timer. Track half-days, full days, and mileage effortlessly.
                                </p>
                            </div>

                            <div className={featureClass}>
                                <div className="w-12 h-12 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl flex items-center justify-center mb-4 text-2xl">
                                    <FaFileInvoiceDollar />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Invoicing</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Convert your logged time directly into professional PDF invoices in just one click.
                                </p>
                            </div>

                            <div className={featureClass}>
                                <div className="w-12 h-12 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl flex items-center justify-center mb-4 text-2xl">
                                    <FaCloudUploadAlt />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Offline Support</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Keep working even when you lose signal on site. Everything syncs automatically when you&apos;re back online.
                                </p>
                            </div>

                            <div className={featureClass}>
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center justify-center mb-4 text-2xl">
                                    <FaChartLine />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Reporting</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Get valuable insights into your billed time, business performance, and outstanding invoices.
                                </p>
                            </div>

                            <div className={featureClass}>
                                <div className="w-12 h-12 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl flex items-center justify-center mb-4 text-2xl">
                                    <FaMobileAlt />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Mobile First PWA</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Designed to perform smoothly on your phone, tablet, or desktop so you can track time from anywhere.
                                </p>
                            </div>

                            <div className={featureClass}>
                                <div className="w-12 h-12 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl flex items-center justify-center mb-4 text-2xl">
                                    <FaLock />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Secure Cloud</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Your data is securely backed up and synced in real time under UK GDPR compliance. Never lose an invoice again.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Global Legal Compliance Footer */}
            <GlobalFooter />
        </div>
    );
}
