import React, { useState, useEffect } from "react";
import "./BrandedAuthCard.css";

/* Crisp Lucide-style inline SVG icons (zero extra dependencies) */
const IconMail = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconUser = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconEye = ({ size = 17, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = ({ size = 17, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
    <path d="m2 2 20 20" />
  </svg>
);

const IconArrowRight = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const IconAlertCircle = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

const IconCheckCircle = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.max(1, score);
}

/** Dual-logo lockup: shows the specific App Logo prominently + keeps the ItsMyApp parent brand badge */
function DualLogoLockup({
  appName,
  logoSrc,
  parentLogoSrc = "/itsmyapp-logo.png",
  compact = false,
}) {
  const isParentApp = logoSrc === parentLogoSrc;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={logoSrc}
          alt={appName}
          className="w-12 h-12 object-contain drop-shadow-md shrink-0"
        />
        {!isParentApp && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm">
            <img src={parentLogoSrc} alt="ItsMyApp" className="w-4 h-4 object-contain" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/95">
              ItsMyApp
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 mb-5">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm">
        <img src={parentLogoSrc} alt="ItsMyApp" className="w-4 h-4 object-contain" />
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/95">
          {isParentApp ? "ItsMyApp Platform" : "Part of ItsMyApp"}
        </span>
      </div>
      <div className="flex items-center gap-3.5">
        <img
          src={logoSrc}
          alt={appName}
          className="w-20 h-20 object-contain drop-shadow-xl shrink-0"
        />
      </div>
    </div>
  );
}

export default function BrandedAuthCard({
  appName = "Time Track Invoice",
  brandTag = "TIME TRACK",
  logoSrc = "/logo.png",
  parentLogoSrc = "/itsmyapp-logo.png",
  signInHeadline = "Welcome",
  signInAccent = "back.",
  signInSubtext = "Manage your clients, track billable hours, and generate professional PDF invoices.",
  signUpHeadline = "Streamline your",
  signUpAccent = "invoicing.",
  signUpSubtext = "Track time on-site or offline, log mileage & day rates, and get paid faster.",
  initialMode = "signin",
  initialEmail = "",
  externalError = "",
  onEmailChange,
  onSignIn,
  onSignUp,
  onForgotPassword,
  footerNote,
}) {
  const [mode, setMode] = useState(initialMode);
  const [mobileSweeping, setMobileSweeping] = useState(false);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState(initialEmail || "");
  const [signInPassword, setSignInPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showSignInPw, setShowSignInPw] = useState(false);

  // Sign Up state
  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState(initialEmail || "");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showSignUpPw, setShowSignUpPw] = useState(false);

  // Feedback state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleSignInEmailChange = (val) => {
    setSignInEmail(val);
    if (onEmailChange) onEmailChange(val);
  };

  const handleSignUpEmailChange = (val) => {
    setSignUpEmail(val);
    if (onEmailChange) onEmailChange(val);
  };

  const switchMode = (nextMode) => {
    if (nextMode === mode) return;
    setError("");
    setNotice("");

    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileSweeping(true);
      window.setTimeout(() => {
        setMode(nextMode);
      }, 280);
      window.setTimeout(() => {
        setMobileSweeping(false);
      }, 640);
    } else {
      setMode(nextMode);
    }
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!signInEmail.trim() || !signInPassword) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      if (onSignIn) {
        await onSignIn({
          email: signInEmail.trim(),
          password: signInPassword,
          remember: rememberMe,
        });
      }
    } catch (err) {
      setError(err?.message || "Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!signUpEmail.trim() || signUpPassword.length < 6) {
      setError("Please enter a valid email and a password of at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (onSignUp) {
        await onSignUp({
          fullName: fullName.trim(),
          email: signUpEmail.trim(),
          password: signUpPassword,
        });
      }
    } catch (err) {
      setError(err?.message || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotClick = async () => {
    setError("");
    setNotice("");
    if (!signInEmail.trim()) {
      setError("Enter your email address first so we can send a reset link.");
      return;
    }
    setLoading(true);
    try {
      if (onForgotPassword) {
        await onForgotPassword(signInEmail.trim());
        setNotice("Password reset email sent! Check your inbox.");
      }
    } catch (err) {
      setError(err?.message || "Could not send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(signUpPassword);
  const strengthColors = ["bg-slate-200", "bg-red-500", "bg-orange-500", "bg-amber-400", "bg-emerald-500"];
  const isSignIn = mode === "signin";

  return (
    <div className="w-full flex flex-col items-center">
      <div className="ima-auth-card" data-mode={mode}>
        {/* Mobile vertical sweep curtain */}
        <div className="ima-mobile-curtain" data-sweeping={mobileSweeping ? "true" : "false"} aria-hidden="true" />

        {/* Mobile diagonal brand header */}
        <div className="ima-mobile-header">
          <div className="mb-3">
            <DualLogoLockup appName={appName} logoSrc={logoSrc} parentLogoSrc={parentLogoSrc} compact />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">
            {brandTag}
          </p>
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-white mt-0.5">
            {isSignIn ? signInHeadline : signUpHeadline}{" "}
            <span className="italic font-semibold text-orange-300">
              {isSignIn ? signInAccent : signUpAccent}
            </span>
          </h2>
          <p className="text-xs text-blue-100/90 leading-relaxed max-w-xs mt-1.5">
            {isSignIn ? signInSubtext : signUpSubtext}
          </p>
        </div>

        {/* LEFT PANE: Sign In Form */}
        <div className="ima-auth-pane ima-auth-pane--signin" aria-hidden={!isSignIn}>
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-1">
              {appName}
            </p>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in</h1>
            <div className="w-9 h-1 rounded-full bg-gradient-to-r from-blue-600 to-orange-500 mt-2" />
          </div>

          {error && isSignIn && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
              <IconAlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {notice && isSignIn && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-start gap-2">
              <IconCheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-500" />
              <span>{notice}</span>
            </div>
          )}

          <form onSubmit={handleSignInSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => handleSignInEmailChange(e.target.value)}
                  tabIndex={isSignIn ? 0 : -1}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full bg-transparent border-0 border-b-2 border-slate-200 focus:border-blue-600 py-2.5 pr-9 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors"
                />
                <IconMail size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showSignInPw ? "text" : "password"}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  tabIndex={isSignIn ? 0 : -1}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-transparent border-0 border-b-2 border-slate-200 focus:border-blue-600 py-2.5 pr-10 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPw(!showSignInPw)}
                  tabIndex={isSignIn ? 0 : -1}
                  aria-label={showSignInPw ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showSignInPw ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  tabIndex={isSignIn ? 0 : -1}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Keep me signed in
              </label>
              <button
                type="button"
                onClick={handleForgotClick}
                tabIndex={isSignIn ? 0 : -1}
                className="font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-2 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              tabIndex={isSignIn ? 0 : -1}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 hover:from-blue-800 hover:to-blue-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/25 hover:shadow-blue-700/35 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in <IconArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            New to {appName}?{" "}
            <button
              type="button"
              onClick={() => switchMode("signup")}
              tabIndex={isSignIn ? 0 : -1}
              className="font-bold text-slate-900 hover:text-orange-600 underline underline-offset-4 decoration-orange-500 decoration-2 transition-colors"
            >
              Create an account
            </button>
          </p>
        </div>

        {/* RIGHT PANE: Create Account Form */}
        <div className="ima-auth-pane ima-auth-pane--signup" aria-hidden={isSignIn}>
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600 mb-1">
              {appName}
            </p>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create account</h2>
            <div className="w-9 h-1 rounded-full bg-gradient-to-r from-orange-500 to-blue-600 mt-2" />
          </div>

          {error && !isSignIn && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
              <IconAlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {notice && !isSignIn && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-start gap-2">
              <IconCheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-500" />
              <span>{notice}</span>
            </div>
          )}

          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Full name (optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  tabIndex={!isSignIn ? 0 : -1}
                  placeholder="Alex Morgan"
                  autoComplete="name"
                  className="w-full bg-transparent border-0 border-b-2 border-slate-200 focus:border-orange-500 py-2.5 pr-9 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors"
                />
                <IconUser size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => handleSignUpEmailChange(e.target.value)}
                  tabIndex={!isSignIn ? 0 : -1}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full bg-transparent border-0 border-b-2 border-slate-200 focus:border-orange-500 py-2.5 pr-9 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors"
                />
                <IconMail size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showSignUpPw ? "text" : "password"}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  tabIndex={!isSignIn ? 0 : -1}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="w-full bg-transparent border-0 border-b-2 border-slate-200 focus:border-orange-500 py-2.5 pr-10 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPw(!showSignUpPw)}
                  tabIndex={!isSignIn ? 0 : -1}
                  aria-label={showSignUpPw ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-orange-600 transition-colors"
                >
                  {showSignUpPw ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                </button>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="flex gap-1.5 flex-1">
                  {[1, 2, 3, 4].map((level) => (
                    <span
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        strength >= level ? strengthColors[strength] : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Use 8+ chars</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              tabIndex={!isSignIn ? 0 : -1}
              className="w-full py-3.5 px-6 mt-2 rounded-full bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/25 hover:shadow-orange-600/35 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create account <IconArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("signin")}
              tabIndex={!isSignIn ? 0 : -1}
              className="font-bold text-slate-900 hover:text-blue-700 underline underline-offset-4 decoration-blue-600 decoration-2 transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>

        {/* DESKTOP DIAGONAL SWEEPING BLADE (clip-path for 100% razor-sharp text & logos) */}
        <div className="ima-auth-band-seam" aria-hidden="true" />
        <div className="ima-auth-band" aria-hidden="true">
          {/* Left blade content (visible when blade sweeps LEFT in Sign Up mode) */}
          <div className="ima-band-page ima-band-page--left">
            <DualLogoLockup appName={appName} logoSrc={logoSrc} parentLogoSrc={parentLogoSrc} />
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-orange-300 mb-2">
              {brandTag}
            </p>
            <h3 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white mb-4">
              {signUpHeadline}
              <br />
              <span className="italic font-semibold text-orange-300">{signUpAccent}</span>
            </h3>
            <p className="text-sm text-blue-100/90 leading-relaxed max-w-[260px]">
              {signUpSubtext}
            </p>
          </div>

          {/* Right blade content (visible when blade rests RIGHT in Sign In mode) */}
          <div className="ima-band-page ima-band-page--right">
            <DualLogoLockup appName={appName} logoSrc={logoSrc} parentLogoSrc={parentLogoSrc} />
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-orange-300 mb-2">
              {brandTag}
            </p>
            <h3 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white mb-4">
              {signInHeadline}
              <br />
              <span className="italic font-semibold text-orange-300">{signInAccent}</span>
            </h3>
            <p className="text-sm text-blue-100/90 leading-relaxed max-w-[260px]">
              {signInSubtext}
            </p>
          </div>
        </div>
      </div>

      {footerNote && (
        <p className="mt-4 text-xs text-slate-500 text-center">{footerNote}</p>
      )}
    </div>
  );
}
