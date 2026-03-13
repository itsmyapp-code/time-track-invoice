import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { getApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
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
import Layout from "./components/Layout";
import AuthView from "./components/AuthView";
import LandingPage from "./components/LandingPage";
import Paywall from "./components/Paywall";
import AdminPage from "./components/AdminPage";
import { FaSignOutAlt, FaCog, FaQuestionCircle, FaUserShield } from "react-icons/fa";
import { addOfflineAction, getOfflineActions, clearOfflineActions } from './offlineActions';
import { usePwsReminders } from './hooks/usePwsReminders';
// serviceWorkerRegistration.register();




const SettingsView = ({ settings, updateSettings, navigate }) => {
  const [form, setForm] = useState(settings || {});
  const [loadingPortal, setLoadingPortal] = useState(false);
  useEffect(() => { setForm(settings || {}); }, [settings]);

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const functions = getFunctions(getApp(), 'us-central1');
      const functionRef = httpsCallable(functions, 'ext-firestore-stripe-payments-createPortalLink');
      const { data } = await functionRef({ returnUrl: window.location.origin + "/dashboard" });
      if (data && data.url) {
        window.location.assign(data.url);
      } else {
        alert("Could not load Stripe portal.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting the billing system. Are you subscribed yet? " + err.message);
    }
    setLoadingPortal(false);
  };

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
      <div className="flex gap-4 mt-6">
        <button className="bg-slate-200 text-slate-800 px-4 py-2 rounded hover:bg-slate-300" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50" disabled={loadingPortal} type="button" onClick={handleManageSubscription}>
          {loadingPortal ? "Loading Portal..." : "Manage Subscription"}
        </button>
      </div>
    </div>
  );
};


const App = () => {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [clients, setClients] = useState([]);
  const [dayItems, setDayItems] = useState([]);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [settings, setSettings] = useState({});
  const [authError, setAuthError] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSignUp, setPendingSignUp] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isLoadingPro, setIsLoadingPro] = useState(true);

  // --- Hourly Reminders Hook ---
  usePwsReminders(!!user);

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
            if (action.type === 'deleteDayItem') {
              await deleteDoc(doc(db, "users", user.uid, "dayItems", action.itemId));
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
    let unsubscribeSettings = () => { };
    const unsubscribeAuth = onAuthStateChanged(auth, async user => {
      setUser(user);
      if (user) {
        try {
          // Save or update user email in the database for admin reference
          if (user.email) {
            await setDoc(doc(db, "users", user.uid), { email: user.email }, { merge: true });
          }

          onSnapshot(query(collection(db, "users", user.uid, "jobs"), orderBy("createdAt")), snapshot => setJobs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
          onSnapshot(query(collection(db, "users", user.uid, "sessions"), orderBy("startTime")), snapshot => setSessions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
          onSnapshot(query(collection(db, "users", user.uid, "clients"), orderBy("createdAt")), snapshot => setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
          onSnapshot(query(collection(db, "users", user.uid, "dayItems"), orderBy("date")), snapshot => setDayItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
          onSnapshot(query(collection(db, "users", user.uid, "dayItems"), orderBy("date")), snapshot => setDayItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
          onSnapshot(query(collection(db, "users", user.uid, "invoices"), orderBy("createdAt")), snapshot => setSavedInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));

          // Combined Pro listener
          let subscriptionActive = false;
          let overrideActive = false;

          const updateProStatus = (sub, override) => {
            const isAdmin = user.email && user.email.toLowerCase() === 'martin@cozens.me.uk';
            setIsPro(sub || override || isAdmin);
            setIsLoadingPro(false);
          };

          // 1. Subscription listener
          const subRef = collection(db, "users", user.uid, "subscriptions");
          const unsubSub = onSnapshot(subRef, snap => {
            subscriptionActive = false;
            snap.forEach(doc => {
              const data = doc.data();
              if (data.status === 'active' || data.status === 'trialing') subscriptionActive = true;
            });
            updateProStatus(subscriptionActive, overrideActive);
          }, (err) => {
            console.error("Subscription snapshot error:", err);
            updateProStatus(subscriptionActive, overrideActive);
          });

          // 2. Pro Override listener
          const unsubUserDoc = onSnapshot(doc(db, "users", user.uid), userDocSnap => {
            overrideActive = false;
            if (userDocSnap.exists() && userDocSnap.data().proOverride) {
              overrideActive = true;
            }
            updateProStatus(subscriptionActive, overrideActive);
          });

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
        setDayItems([]);
        setClients([]);
        setClients([]);
        setSavedInvoices([]);
        setSettings({});
        setIsPro(false);
        setIsLoadingPro(false);
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

  const handleManualEntry = useCallback(async (jobId, { startTime, endTime, duration, description }) => {
    if (user) {
      if (!isOnline) {
        await addOfflineAction({ type: 'manualEntry', jobId, startTime, endTime, duration, description });
        return;
      }
      try {
        await addDoc(collection(db, "users", user.uid, "sessions"), { jobId, startTime, endTime, duration, description, createdAt: serverTimestamp() });
      } catch (error) {
        console.error("Manual entry error:", error);
      }
    }
  }, [user, isOnline]);

  const handleAddDayItem = useCallback(async (jobId, { date, type }) => {
    if (user) {
      if (!isOnline) {
        // Simple offline fallback
        await addOfflineAction({ type: 'addDayItem', jobId, date, itemType: type });
        return;
      }
      try {
        await addDoc(collection(db, "users", user.uid, "dayItems"), { jobId, date, type, createdAt: serverTimestamp() });
      } catch (error) {
        console.error("Add day item error:", error);
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

  const archiveClient = useCallback(async (clientId, isArchived) => {
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid, "clients", clientId), { isArchived });
      } catch (error) {
        console.error("Archive client error:", error);
      }
    }
  }, [user]);

  const archiveJob = useCallback(async (jobId, isArchived) => {
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid, "jobs", jobId), { isArchived });
      } catch (error) {
        console.error("Archive job error:", error);
      }
    }
  }, [user]);

  const saveInvoice = useCallback(async invoiceData => {
    if (user) {
      if (!isOnline) {
        await addOfflineAction({ type: 'saveInvoice', invoiceData });
        return;
      }
      try {
        if (invoiceData.id) {
          const { id, ...data } = invoiceData;
          await setDoc(doc(db, "users", user.uid, "invoices", id), data, { merge: true });
        } else {
          await addDoc(collection(db, "users", user.uid, "invoices"), invoiceData);
        }
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

  const deleteDayItem = useCallback(async (itemId) => {
    if (user) {
      if (!isOnline) {
        await addOfflineAction({ type: 'deleteDayItem', itemId });
        return;
      }
      try {
        await deleteDoc(doc(db, "users", user.uid, "dayItems", itemId));
      } catch (error) {
        console.error("Delete day item error:", error);
      }
    }
  }, [user, isOnline]);

  const deleteInvoice = useCallback(async (invoiceId) => {
    console.log("Delete invoice called with:", invoiceId, "User:", user?.uid);
    if (!invoiceId) {
      console.error("Invalid invoiceId:", invoiceId);
      return;
    }
    if (typeof invoiceId !== 'string') {
      console.error("Invalid invoiceId type:", typeof invoiceId, invoiceId);
      return;
    }

    if (user) {
      if (!isOnline) {
        await addOfflineAction({ type: 'deleteInvoice', invoiceId });
        return;
      }
      try {
        const docRef = doc(db, "users", user.uid, "invoices", invoiceId);
        console.log("Deleting doc ref:", docRef.path);
        await deleteDoc(docRef);
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
    <div className="min-h-screen app-bg-gradient">
      {!isOnline && (
        <div className="bg-yellow-200 text-yellow-800 text-center p-2 mb-2">
          Offline: changes will be synced when connection is restored.
        </div>
      )}

      {/* If absolutely not logged in, we only allow access to landing page, or they hit auth view. If they hit / we show landing page, if they hit /app we show auth view */}
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Everything else requires login */}
        <Route path="*" element={
          !user ? (
            <AuthView
              handleLogin={handleLogin}
              handleSignUp={handleSignUp}
              authError={authError}
              handlePasswordReset={handlePasswordReset}
              email={authEmail}
              setEmail={setAuthEmail}
              onSignUpSuccess={() => setPendingSignUp(true)}
            />
          ) : isLoadingPro && user.email !== 'martin@cozens.me.uk' ? (
            <div className="flex h-screen items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your account...</p>
              </div>
            </div>
          ) : (!isPro && (!user.email || user.email.toLowerCase() !== 'martin@cozens.me.uk')) ? (
            <Layout user={user} isPro={isPro} handleLogout={handleLogout}>
              <Paywall
                db={db}
                user={user}
                onSuccess={() => setIsPro(true)}
              />
            </Layout>
          ) : (
            <Layout user={user} isPro={isPro} handleLogout={handleLogout}>
              <Routes>
                <Route path="/app" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={
                  <DashboardPage
                    jobs={jobs}
                    clients={clients}
                    sessions={sessions}
                    handleManualEntry={handleManualEntry}
                    handleAddDayItem={handleAddDayItem}
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
                    archiveJob={archiveJob}
                    dayItems={dayItems}
                    deleteDayItem={deleteDayItem}
                    setActiveView={view => navigate(`/${view}`)}
                  />
                } />
                <Route path="/invoices" element={
                  <InvoicesPage
                    jobs={jobsWithSessions}
                    clients={clients}
                    savedInvoices={savedInvoices}
                    sessions={sessions}
                    dayItems={dayItems}
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
                    archiveClient={archiveClient}
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
                    invoices={savedInvoices}
                    settings={settings}
                    generateReport={() => window.print()}
                    setActiveView={view => navigate(`/${view}`)}
                  />
                } />
                <Route path="/settings" element={
                  <SettingsView settings={settings} updateSettings={updateSettings} navigate={navigate} />
                } />
                <Route path="/help" element={<HelpPage />} />

                {/* Admin Route */}
                {user.email && user.email.toLowerCase() === 'martin@cozens.me.uk' && (
                  <Route path="/admin" element={<AdminPage d={db} navigate={navigate} />} />
                )}

              </Routes>
            </Layout>
          )
        } />
      </Routes>
    </div>
  );
};

export default App;