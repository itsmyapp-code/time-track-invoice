import React from "react";
import { Link } from "react-router-dom";
import BrandedAuthCard from "./BrandedAuthCard";
import GlobalFooter from "./GlobalFooter";

export default function AuthView({
    handleLogin,
    handleSignUp,
    authError,
    handlePasswordReset,
    email,
    setEmail,
}) {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-100 text-slate-900">
            {/* Top Bar */}
            <header className="w-full max-w-6xl mx-auto px-4 pt-5 pb-2 flex items-center justify-between">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors"
                >
                    <span>&larr; Back to Home</span>
                </Link>
                <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                    <Link to="/terms" className="hover:text-blue-700 transition-colors">Terms</Link>
                    <span aria-hidden="true">&bull;</span>
                    <Link to="/privacy" className="hover:text-blue-700 transition-colors">Privacy</Link>
                    <span aria-hidden="true">&bull;</span>
                    <Link to="/cookies" className="hover:text-blue-700 transition-colors">Cookies</Link>
                    <span aria-hidden="true">&bull;</span>
                    <Link to="/accessibility" className="hover:text-blue-700 transition-colors">Accessibility</Link>
                </div>
            </header>

            {/* Branded Diagonal Sweeping-Blade Auth Card */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <BrandedAuthCard
                    appName="Time Track Invoice"
                    brandTag="TIME TRACK"
                    logoSrc="/logo.png"
                    parentLogoSrc="/itsmyapp-logo.png"
                    signInHeadline="Welcome"
                    signInAccent="back."
                    signInSubtext="Your clients, tracked hours, and professional PDF invoices are synced and ready."
                    signUpHeadline="Streamline your"
                    signUpAccent="invoicing."
                    signUpSubtext="Track billable hours, day rates, and mileage on-site or offline—and get paid faster."
                    initialEmail={email}
                    externalError={authError}
                    onEmailChange={setEmail}
                    onSignIn={async ({ email: signInEmail, password }) => {
                        await handleLogin(signInEmail, password);
                    }}
                    onSignUp={async ({ email: signUpEmail, password }) => {
                        await handleSignUp(signUpEmail, password);
                    }}
                    onForgotPassword={async (resetEmail) => {
                        await handlePasswordReset(resetEmail);
                    }}
                />
            </main>

            {/* Global Legal Compliance Footer */}
            <GlobalFooter />
        </div>
    );
}
