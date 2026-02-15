import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import {
  doc,
  collection,
  onSnapshot,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDocs,
  updateDoc
} from "firebase/firestore";
import { Routes, Route, Navigate } from "react-router-dom";
import ClientsPage from "./ClientsPage";
import InvoicesPage from "./InvoicesPage";
import JobsPage from "./JobsPage";
import DashboardPage from "./DashboardPage";
import ReportsPage from "./ReportsPage";
import HelpPage from "./HelpPage";
import { FaSignOutAlt, FaCog, FaQuestionCircle } from "react-icons/fa";
import { addOfflineAction, getOfflineActions, clearOfflineActions } from './offlineActions';
// serviceWorkerRegistration.register();

const AuthView = ({
  handleLogin,
  handleSignUp,
  authError,
  handlePasswordReset,
  email,
  setEmail,
  onSignUpSuccess
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-lg"
      style={{ background: "linear-gradient(135deg, #00AEEF, #FFFFFF, #F58220)" }}>
      <div className="flex items-center mb-4 logo-container">
        <a href="https://itsmyapp.co.uk" target="_blank" rel="noopener noreferrer">
          <img src="/logo.png" alt="Logo" className="logo-image" style={{ height: "48px", width: "48px", objectFit: "contain" }} />
        </a>
        <h2 className="text-2xl font-bold text-gray-800">Time Track Invoice</h2>
      </div>
      <input className="w-full p-2 mb-2 border rounded-lg" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <div className="relative">
        <input className="w-full p-2 mb-2 border rounded-lg" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <button type="button" className="absolute right-2 top-2 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      {authError && <p className="text-red-500 mb-2">{authError}</p>}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg mb-2"
        onClick={() => handleLogin(email, password)}>Login</button>
      <button className="w-full bg-green-700 hover:bg-green-800 text-white p-2 rounded-lg mb-2 transition duration-200"
        onClick={async () => {
          const success = await handleSignUp(email, password);
          if (success && onSignUpSuccess) onSignUpSuccess();
        }}>
        Create Account
      </button>
      <button className="w-full bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition duration-200"
        onClick={() => handlePasswordReset(email)} disabled={!email}>Forgot Password?</button>
    </div>
  );
};


const SettingsView = ({ settings, updateSettings, navigate }) => {
  const [form, setForm] = useState(settings || {});
  useEffect(() => { setForm(settings || {}); }, [settings]);
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Business Details (for invoices)</h2>
      <form onSubmit={e => { e.preventDefault(); updateSettings(form); }}>
        {["ownerName", "address", "town", "county", "postcode", "phone", "email", "vatNumber", "bankAccountName", "sortCode", "accountNumber", "termsConditions"].map(field => (
          <div key={field} className="mb-2">
            <label className="mr-2">{field.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}:</label>
            {field === "termsConditions" ? (
              <textarea className="border rounded px-2 py-1 w-full" rows={4}
                value={form[field] || ""}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              />
            ) : (
              <input className="border rounded px-2 py-1 w-full"
                value={form[field] || ""}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              />
            )}
          </div>
        ))}
        <button className="bg-blue-600 text-white rounded px-3 py-2 mt-2">Save</button>
      </form>
      <button className="bg-blue-600 text-white px-4 py-2 rounded mt-4" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );
};


const App = () => {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [clients, setClients] = useState([]);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [settings, setSettings] = useState({});
  const [authError, setAuthError] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSignUp, setPendingSignUp] = useState(false);

  // --- Reports Page State & Filtering ---
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (pendingSignUp && user) {
      setPendingSignUp(false);
    }
  }, [pendingSignUp, user]);

  useEffect(() => {
    if (isOnline && user) {
      (async () => {
        const actions = await getOfflineActions();
        for (const action of actions) {
          try {
            if (action.type === 'startTimer') {
              await addDoc(collection(db, "users", user.uid, "sessions"), {
                jobId: action.jobId,
                startTime: action.timestamp,
                createdAt: serverTimestamp(),
                endTime: null,
                duration: 0
              });
            }
            if (action.type === 'stopTimer') {
              const q = query(
                collection(db, "users", user.uid, "sessions"),
                where("jobId", "==", action.jobId),
                where("endTime", "==", null)
              );
              const snapshot = await getDocs(q);
              if (!snapshot.empty) {
                const sessionDoc = snapshot.docs[0];
                if (sessionDoc.data().startTime)
                  await setDoc(doc(db, "users", user.uid, "sessions", sessionDoc.id), {
                    endTime: action.timestamp,
                    duration: action.duration
                  }, { merge: true });
              }
            }
            if (action.type === 'addJob') {
              await addDoc(collection(db, "users", user.uid, "jobs"), {
                name: action.name,
                hourlyRate: action.rate,
                clientId: action.clientId,
                createdAt: serverTimestamp()
              });
            }
            if (action.type === 'manualEntry') {
              await addDoc(collection(db, "users", user.uid, "sessions"), {
                jobId: action.jobId,
                startTime: action.startTime,
                endTime: action.endTime,
                duration: action.duration,
                createdAt: serverTimestamp()
              });
            }
            if (action.type === 'addClient') {
              await addDoc(collection(db, "users", user.uid, "clients"), {
                ...action.client,
                createdAt: serverTimestamp()
              });
            }
            if (action.type === 'editClient') {
              await setDoc(doc(db, "users", user.uid, "clients", action.clientId), action.client, { merge: true });
            }
            if (action.type === 'saveInvoice') {
              await addDoc(collection(db, "users", user.uid, "invoices"), action.invoiceData);
            }
            if (action.type === 'updateSettings') {
              await setDoc(doc(db, "users", user.uid, "settings", "userSettings"), action.settings, { merge: true });
            }
            if (action.type === 'deleteSession') {
              await deleteDoc(doc(db, "users", user.uid, "sessions", action.sessionId));
            }
            if (action.type === 'deleteInvoice') {
              await deleteDoc(doc(db, "users", user.uid, "invoices", action.invoiceId));
            }
            if (action.type === 'deleteJob') {
              await deleteDoc(doc(db, "users", user.uid, "jobs", action.jobId));
            }
            if (action.type === 'deleteClient') {
              await deleteDoc(doc(db, "users", user.uid, "clients", action.clientId));
            }
          } catch (err) {
            console.error("Error syncing offline action:", action, err);
          }
        }
        await clearOfflineActions();
      })();
    }
  }, [isOnline, user]);

  const navigate = useNavigate();
  useEffect(() => {
    let unsubscribeSettings = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, async user => {
      setUser(user);
      if (user) {
        try {
          onSnapshot(query(collection(db, "users", user.uid, "jobs"), orderBy("createdAt")), snapshot => setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
          onSnapshot(query(collection(db, "users", user.uid, "sessions"), orderBy("startTime")), snapshot => setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
          onSnapshot(query(collection(db, "users", user.uid, "clients"), orderBy("createdAt")), snapshot => setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
          onSnapshot(query(collection(db, "users", user.uid, "invoices"), orderBy("createdAt")), snapshot => setSavedInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
          const settingsRef = doc(db, "users", user.uid, "settings", "userSettings");
          unsubscribeSettings = onSnapshot(settingsRef, docSnap => {
            if (docSnap.exists()) setSettings(docSnap.data());
            else setSettings({});
          });
        } catch (error) {
          console.error("Auth state change error:", error);
        }
      } else {
        setJobs([]);
        setSessions([]);
        setClients([]);
        setSavedInvoices([]);
        setSettings({});
      }
    });
    return () => { unsubscribeAuth(); unsubscribeSettings(); };
  }, []);

  const jobsWithSessions = useMemo(() =>
    jobs.map(job => ({
      ...job,
      sessions: sessions.filter(s => s.jobId === job.id && s.duration).sort((a, b) => b.startTime - a.startTime)
    })).reverse(), [jobs, sessions]);

  // Auth handlers
  const handleLogin = (email, password) => {
    setAuthError(null);
    signInWithEmailAndPassword(auth, email, password)
      .then(() => navigate("/dashboard"))
      .catch(e => setAuthError(e.message));
  };
  const handleSignUp = async (email, password) => {
    setAuthError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setPendingSignUp(true);
      navigate("/dashboard");
      return true;
    } catch (e) {
      setAuthError(e.message);
      return false;
    }
  };
  const handleLogout = () => signOut(auth);
  const handlePasswordReset = async email => {
    setAuthError(null);
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent! Redirecting to login...");
        setUser(null);
      } catch (e) {
        setAuthError(e.message);
      }
    } else setAuthError("Enter email first.");
  };

  // CRUD handlers WITH OFFLINE SUPPORT!
  const handleAddJob = useCallback(async ({ name, rate, clientId }) => {
    if (user && name) {
      if (!isOnline) {
        await addOfflineAction({ type: 'addJob', name, rate, clientId });
        return;
      }
      try {
        await addDoc(collection(db, "users", user.uid, "jobs"), { name, hourlyRate: rate, clientId, createdAt: serverTimestamp() });
      } catch (error) {
        console.error("Add job error:", error);
      }
    }
  }, [user, isOnline]);

  const startTimer = useCallback(async jobId => {
    if (user) {
      if (!isOnline) {
        await addOfflineAction({ type: 'startTimer', jobId, timestamp: Date.now() });
        return;
      }
      try {
        await addDoc(collection(db, "users", user.uid, "sessions"), { jobId, startTime: Date.now(), createdAt: serverTimestamp(), endTime: null, duration: 0 });
      } catch (error) {
        console.error("Start timer error:", error);
      }
    }
  }, [user, isOnline]);

  const stopTimer = useCallback(async jobId => {
    if (user) {
      if (!isOnline) {
        const session = sessions.find(s => s.jobId === jobId && !s.endTime);
        if (session) {
          const now = Date.now();
          const duration = Math.ceil((now - session.startTime) / 60000 / 15) * 15 * 60000;
          await addOfflineAction({ type: 'stopTimer', jobId, timestamp: now, duration });
        }
        return;
      }
      try {
        const q = query(collection(db, "users", user.uid, "sessions"), where("jobId", "==", jobId), where("endTime", "==", null));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const sessionDoc = snapshot.docs[0];
          if (sessionDoc.data().startTime)
            await setDoc(doc(db, "users", user.uid, "sessions", sessionDoc.id), { endTime: Date.now(), duration: Math.ceil((Date.now() - sessionDoc.data().startTime) / 60000 / 15) * 15 * 60000 }, { merge: true });
        }
      } catch (error) {
        console.error("Stop timer error:", error);
      }
    }
  }, [user, isOnline, sessions]);

  const handleManualEntry = useCallback(async (jobId, { startTime, endTime, duration }) => {
    if (user) {
      if (!isOnline) {
        await addOfflineAction({ type: 'manualEntry', jobId, startTime, endTime, duration });
        return;
      }
      try {
        await addDoc(collection(db, "users", user.uid, "sessions"), { jobId, startTime, endTime, duration, createdAt: serverTimestamp() });
      } catch (error) {
        console.error("Manual entry error:", error);
      }
    }
  }, [user, isOnline]);

  const addClient = useCallback(async client => {
    if (user) {
      if (!isOnline) {
        await addOfflineAction({ type: 'addClient', client });
        return;
      }
      try {
        await addDoc(collection(db, "users", user.uid, "clients"), {
          ...client,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Add client error:", error);
      }
    }
  }, [user, isOnline]);

  const editClient = useCallback(async (clientId, client) => {
    if (user) {
      if (!isOnline) {
        await addOfflineAction({ type: 'editClient', clientId, client });
        return;
      }
      try {
        await setDoc(doc(db, "users", user.uid, "clients", clientId), client, { merge: true });
      } catch (error) {
        console.error("Edit client error:", error);
      }
    }
  }, [user, isOnline]);

  const deleteClient = useCallback(async (clientId) => {
    if (user) {
      if (!isOnline) {
        await addOfflineAction({ type: 'deleteClient', clientId });
        return;
      }
      try {
        await deleteDoc(doc(db, "users", user.uid, "clients", clientId));
      } catch (error) {
        console.error("Delete client error:", error);
      }
    }
  }, [user, isOnline]);

  const saveInvoice = useCallback(async invoiceData => {
    if (user) {
      if (!isOnline) {
        await addOfflineAction({ type: 'saveInvoice', invoiceData });
        return;
      }
      try {
        await addDoc(collection(db, "users", user.uid, "invoices"), invoiceData);
      } catch (error) {
        console.error("Save invoice error:", error);
      }
    }
  }, [user, isOnline]);

  const updateSettings = useCallback(async settingsData => {
    if (user) {
      if (!isOnline) {
        await addOfflineAction({ type: 'updateSettings', settings: settingsData });
        setSettings(settingsData);
        return;
      }
      try {
        await setDoc(doc(db, "users", user.uid, "settings", "userSettings"), settingsData, { merge: true });
      } catch (error) {
        console.error("Update settings error:", error);
      }
    }
  }, [user, isOnline]);

  const deleteSession = useCallback(async (sessionId) => {
    if (user) {
      if (!isOnline) {
        await addOfflineAction({ type: 'deleteSession', sessionId });
        return;
      }
      try {
        await deleteDoc(doc(db, "users", user.uid, "sessions", sessionId));
      } catch (error) {
        console.error("Delete session error:", error);
      }
    }
  }, [user, isOnline]);

  const deleteInvoice = useCallback(async (invoiceId) => {
    if (user) {
      if (!isOnline) {
        await addOfflineAction({ type: 'deleteInvoice', invoiceId });
        return;
      }
      try {
        await deleteDoc(doc(db, "users", user.uid, "invoices", invoiceId));
      } catch (error) {
        console.error("Delete invoice error:", error);
      }
    }
  }, [user, isOnline]);

  const deleteJob = useCallback(async (jobId) => {
    if (user) {
      if (!isOnline) {
        await addOfflineAction({ type: 'deleteJob', jobId });
        return;
      }
      try {
        await deleteDoc(doc(db, "users", user.uid, "jobs", jobId));
      } catch (error) {
        console.error("Delete job error:", error);
      }
    }
  }, [user, isOnline]);

  const updateInvoiceStatus = useCallback(async (invoiceId, status) => {
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid, "invoices", invoiceId), { status });
      } catch (error) {
        console.error("Update invoice status error:", error);
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #00AEEF, #FFFFFF, #F58220)" }}>
      {!isOnline && (
        <div className="bg-yellow-200 text-yellow-800 text-center p-2 mb-2">
          Offline: changes will be synced when connection is restored.
        </div>
      )}
      {!user ? (
        <AuthView
          handleLogin={handleLogin}
          handleSignUp={handleSignUp}
          authError={authError}
          handlePasswordReset={handlePasswordReset}
          email={authEmail}
          setEmail={setAuthEmail}
          onSignUpSuccess={() => setPendingSignUp(true)}
        />
      ) : (
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-between items-center mb-6 pt-6 logo-container">
            <a href="https://itsmyapp.co.uk" target="_blank" rel="noopener noreferrer">
              <img src={`/logo.png?v=${new Date().getTime()}`} alt="Logo" className="logo-image" style={{ height: "48px", width: "48px", objectFit: "contain" }} />
            </a>
            <div className="flex items-center space-x-2">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition duration-200"
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
              >
                <FaSignOutAlt size={20} />
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 p-2 rounded-lg transition duration-200"
                onClick={() => navigate("/settings")}
                title="Settings"
                aria-label="Settings"
              >
                <FaCog size={20} />
              </button>
              <button
                className="bg-purple-500 hover:bg-purple-700 p-2 rounded-lg transition duration-200"
                onClick={() => navigate("/help")}
                title="Help"
                aria-label="Help"
              >
                <FaQuestionCircle size={20} />
              </button>
            </div>
          </div>
          {/* Removed old Menu navigation for mobile-friendly dropdowns on each page */}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={
              <DashboardPage
                jobs={jobs}
                clients={clients}
                sessions={sessions}
                invoices={savedInvoices}
                setActiveView={view => navigate(`/${view}`)}
              />
            } />
            <Route path="/jobs" element={
              <JobsPage
                clients={clients}
                jobs={jobsWithSessions}
                startTimer={startTimer}
                stopTimer={stopTimer}
                handleManualEntry={handleManualEntry}
                sessions={sessions}
                handleAddJob={handleAddJob}
                deleteSession={deleteSession}
                deleteJob={deleteJob}
                setActiveView={view => navigate(`/${view}`)}
              />
            } />
            <Route path="/invoices" element={
              <InvoicesPage
                jobs={jobsWithSessions}
                clients={clients}
                savedInvoices={savedInvoices}
                sessions={sessions}
                saveInvoice={saveInvoice}
                settings={settings}
                deleteInvoice={deleteInvoice}
                updateInvoiceStatus={updateInvoiceStatus}
                setActiveView={view => navigate(`/${view}`)}
              />
            } />
            <Route path="/clients" element={
              <ClientsPage
                clients={clients}
                addClient={addClient}
                editClient={editClient}
                savedInvoices={savedInvoices}
                deleteClient={deleteClient}
                setActiveView={view => navigate(`/${view}`)}
              />
            } />
            <Route path="/reports" element={
              <ReportsPage
                jobs={jobs}
                clients={clients}
                sessions={sessions}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                selectedClientId={selectedClientId}
                setSelectedClientId={setSelectedClientId}
                generateReport={() => window.print()}
                setActiveView={view => navigate(`/${view}`)}
              />
            } />
            <Route path="/settings" element={
              <SettingsView settings={settings} updateSettings={updateSettings} navigate={navigate} />
            } />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
        </div>
      )}
    </div>
  );
};

export default App;