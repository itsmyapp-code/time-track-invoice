import React, { useState, useEffect, useMemo, useContext, createContext, memo, useCallback } from "react";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  addDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  deleteDoc,
  where,
  getDocs,
  getDoc
} from "firebase/firestore";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import ClientsPage from "./ClientsPage";
import InvoicesPage from "./InvoicesPage";

// Register the service worker for offline support
serviceWorkerRegistration.register();

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export const AppContext = createContext();

const formatCurrency = amount => "GBP " + amount.toFixed(2);
const formatTime = ms => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};
const roundToNext15 = ms => Math.ceil(ms / 60000 / 15) * 15 * 60000;
const formatUKDate = date => new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

const AuthView = memo(({ handleLogin, handleSignUp, authError, handlePasswordReset, email, setEmail }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-lg"
      style={{ background: "linear-gradient(135deg, #00AEEF, #FFFFFF, #F58220)" }}>
      <div className="flex items-center mb-4 logo-container">
        <a href="https://itsmyapp.co.uk" target="_blank" rel="noopener noreferrer">
          <img src="/logo.png" alt="Logo" className="logo-image" />
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
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg mb-2 transition duration-200"
        onClick={() => handleLogin(email, password)}>Login</button>
      <button className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg mb-2 transition duration-200"
        onClick={() => handleSignUp(email, password)}>Sign Up</button>
      <button className="w-full bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition duration-200"
        onClick={() => handlePasswordReset(email)} disabled={!email}>Forgot Password?</button>
    </div>
  );
});

const JobsView = memo(({ clients }) => {
  const {
    jobs,
    sessions,
    startTimer,
    stopTimer,
    handleAddJob,
    handleManualEntry,
    deleteSession,
    assignJobToClient,
    deleteJob
  } = useContext(AppContext);
  const [jobName, setJobName] = useState("");
  const [rate, setRate] = useState("");
  const [manualJob, setManualJob] = useState(null);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedClient, setSelectedClient] = useState("");

  const activeSession = useMemo(() => sessions.find(s => !s.endTime), [sessions]);
  useEffect(() => {
    let interval;
    if (activeSession) {
      interval = setInterval(() => setElapsedTime(Date.now() - activeSession.startTime), 1000);
    } else setElapsedTime(0);
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleManualSubmit = e => {
    e.preventDefault();
    if (manualJob && manualDate && manualStart && manualEnd) {
      const startTime = new Date(`${manualDate}T${manualStart}`).getTime();
      const endTime = new Date(`${manualDate}T${manualEnd}`).getTime();
      if (endTime > startTime)
        handleManualEntry(manualJob.id, {
          startTime,
          endTime,
          duration: roundToNext15(endTime - startTime)
        });
      setManualJob(null);
      setManualDate(new Date().toISOString().split("T")[0]);
      setManualStart("");
      setManualEnd("");
    }
  };

  return (
    <div className="p-4" style={{ background: "linear-gradient(135deg, #00AEEF, #FFFFFF, #F58220)" }}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Jobs</h2>
      <div className="mb-4">
        <input className="w-full p-2 mb-2 border rounded-lg" value={jobName} onChange={e => setJobName(e.target.value)} placeholder="Job Name" />
        <input className="w-full p-2 mb-2 border rounded-lg" type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="Rate (GBP)" />
        <select className="w-full p-2 mb-2 border rounded-lg" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
          <option value="">Select Client</option>
          {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
        </select>
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition duration-200"
          onClick={() => {
            handleAddJob({ name: jobName, rate: parseFloat(rate) || 0, clientId: selectedClient });
            setJobName("");
            setRate("");
            setSelectedClient("");
          }}>Add Job</button>
      </div>
      {jobs.map(job => {
        const totalTime = job.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const totalEarnings = (totalTime / 3600000) * (job.hourlyRate || 0);
        const isJobActive = activeSession && activeSession.jobId === job.id;
        const client = clients.find(c => c.id === job.clientId);
        return (
          <div key={job.id} className="mb-2 p-2 border rounded-lg shadow">
            <h3 className="font-bold text-gray-800">{job.name} (Client: {client ? client.name : "None"})</h3>
            <p>Total Time: {formatTime(totalTime)}</p>
            <p>Amount Charged: {formatCurrency(totalEarnings)}</p>
            {isJobActive && <p className="font-bold text-green-600">Timer: {formatTime(elapsedTime)}</p>}
            <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg mr-2 disabled:bg-gray-400 transition duration-200"
              onClick={() => startTimer(job.id)} disabled={!!activeSession}>Start</button>
            <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg disabled:bg-gray-400 transition duration-200"
              onClick={() => stopTimer(job.id)} disabled={!isJobActive}>Stop</button>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg ml-2 transition duration-200"
              onClick={() => setManualJob(job)}>Add Manual Time</button>
            <select className="w-full p-2 mt-2 border rounded-lg"
              value={job.clientId || ""}
              onChange={e => assignJobToClient(job.id, e.target.value)}>
              <option value="">No Client</option>
              {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
            <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg mt-2 transition duration-200"
              onClick={() => { if (window.confirm("Delete job?")) deleteJob(job.id); }}>Delete</button>
            {job.sessions.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold text-gray-800">Sessions:</h4>
                {job.sessions.map(session => (
                  <div key={session.id} className="flex items-center text-sm mb-1">
                    <p>Date: {formatUKDate(session.startTime)}, Duration: {formatTime(session.duration)}</p>
                    <button className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-lg ml-2 text-xs transition duration-200"
                      onClick={() => { if (window.confirm("Delete session?")) deleteSession(session.id); }}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {manualJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold mb-2 text-gray-800">Add Time for {manualJob.name}</h3>
            <form onSubmit={handleManualSubmit}>
              <input className="w-full p-2 mb-2 border rounded-lg" type="date" value={manualDate} onChange={e => setManualDate(e.target.value)} />
              <input className="w-full p-2 mb-2 border rounded-lg" type="time" value={manualStart} onChange={e => setManualStart(e.target.value)} placeholder="Start" />
              <input className="w-full p-2 mb-2 border rounded-lg" type="time" value={manualEnd} onChange={e => setManualEnd(e.target.value)} placeholder="End" />
              <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg mr-2 transition duration-200" type="submit">Save</button>
              <button className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg transition duration-200" onClick={() => setManualJob(null)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

const HelpView = memo(() => {
  const [version] = useState("1.0.0");
  const usageInstructions = `
### Getting Started with Time Track Invoice

The Help page is accessible without logging in, allowing you to review these instructions at any time. To use the full features, you’ll need to log in or sign up. Here’s a step-by-step guide to using the app, following the recommended workflow:

#### 1. Settings
- **Purpose**: Configure your business details to personalize invoices and manage your account.
- **Steps**:
  - Navigate to the Settings tab after logging in.
  - Enter your name, address, town, county, postcode, phone number, email, VAT number, terms and conditions, and bank details (account name, sort code, account number).
  - Click "Save" to store your information. This data will appear on generated invoices.
  - Tip: Update these details whenever your business information changes.

#### 2. Clients
- **Purpose**: Manage client information and link them to jobs for invoicing.
- **Steps**:
  - Go to the Clients tab.
  - Add a new client by filling in their name, email, phone, address, town, county, postcode, and custom terms. Click "Add Client."
  - Edit existing clients by clicking "Edit" and updating their details, then "Update Client."
  - Delete a client by clicking "Delete" and confirming (note: this unlinks associated jobs).
  - Tip: Ensure client details are accurate for professional invoices.

#### 3. Jobs
- **Purpose**: Track work time and earnings per job, linked to clients.
- **Steps**:
  - Navigate to the Jobs tab.
  - Add a job by entering a name, hourly rate, and selecting a client (if applicable). Click "Add Job."
  - Start a timer for a job by clicking "Start," then "Stop" when finished. The duration rounds to the nearest 15 minutes.
  - Add manual time by clicking "Add Manual Time," selecting a date and time range, and saving.
  - Assign or reassign a client to a job using the dropdown, or delete a job/session with confirmation.
  - Tip: Use the timer for real-time tracking or manual entries for past work.

#### 4. Invoices
- **Purpose**: Generate and save invoices based on tracked job time.
- **Steps**:
  - Go to the Invoices tab.
  - Select a client, set a date range, and add optional items with descriptions and amounts.
  - Click "Download Invoice" to generate a PDF, or "Save Invoice" to store it for the client and yourself.
  - Edit or delete saved invoices using the respective buttons.
  - Tip: Review invoices before downloading to ensure all data is correct.

#### 5. Help
- **Purpose**: Access these detailed instructions and contact support.
- **Steps**:
  - Visit the Help tab anytime (no login required).
  - Review the usage guide or contact the developer at hello@itsmyapp.co.uk for assistance.

  `;
  return (
    <div className="p-4 max-w-2xl mx-auto" style={{ background: "linear-gradient(135deg, #00AEEF, #FFFFFF, #F58220)" }}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Help</h2>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Usage Instructions</h3>
        <p className="text-gray-600 whitespace-pre-wrap">{usageInstructions}</p>
      </div>
      <div className="mb-4 logo-container">
        <h3 className="text-lg font-semibold text-gray-800">Developer Details</h3>
        <div className="flex items-center">
          <img src="/itsmyapp-logo.png" alt="itsmyapp Logo" className="logo-image" />
          <div>
            <p className="text-gray-600">Developed by: itsmyapp.co.uk</p>
            <p className="text-gray-600">Contact: hello@itsmyapp.co.uk</p>
          </div>
        </div>
      </div>
      <div>
        <p className="text-gray-600">Version: {version}</p>
        <p className="text-gray-600">© 2025 itsmyapp.co.uk</p>
      </div>
    </div>
  );
});

const SettingsView = memo(() => {
  const { user, updateSettings } = useContext(AppContext);
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [town, setTown] = useState("");
  const [county, setCounty] = useState("");
  const [postcode, setPostcode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [termsConditions, setTermsConditions] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [sortCode, setSortCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [version] = useState("1.0.0");

  useEffect(() => {
    if (user) {
      const settingsRef = doc(db, "users", user.uid, "settings", "userSettings");
      onSnapshot(settingsRef, doc => {
        const data = doc.data() || {};
        setOwnerName(data.ownerName || "");
        setAddress(data.address || "");
        setTown(data.town || "");
        setCounty(data.county || "");
        setPostcode(data.postcode || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setVatNumber(data.vatNumber || "");
        setTermsConditions(data.termsConditions || "");
        setBankAccountName(data.bankAccountName || "");
        setSortCode(data.sortCode || "");
        setAccountNumber(data.accountNumber || "");
      }, error => console.error("Snapshot error:", error));
    }
  }, [user]);

  const handleSave = async () => {
    if (user) {
      try {
        const settingsRef = doc(db, "users", user.uid, "settings", "userSettings");
        await setDoc(settingsRef, {
          ownerName,
          address,
          town,
          county,
          postcode,
          phone,
          email,
          vatNumber,
          termsConditions,
          bankAccountName,
          sortCode,
          accountNumber
        }, { merge: true });
        alert("Settings saved!");
      } catch (error) {
        console.error("Save error:", error.message);
        alert("Save failed: " + error.message);
      }
    }
  };

  const usageInstructions = `
- **Login/Sign Up**: Use the login page to access your account or sign up if new.
- **Jobs**: Add jobs, start/stop timers, and log manual time. Assign jobs to clients.
- **Invoices**: Generate or save invoices for clients based on job time.
- **Clients**: Manage client details and link them to jobs. Delete clients as needed.
- **Settings**: Update your business details and terms.
- **Help**: View these instructions and contact the developer for support.
  `;

  return (
    <div className="p-4" style={{ background: "linear-gradient(135deg, #00AEEF, #FFFFFF, #F58220)" }}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Settings</h2>
      <input className="w-full p-2 mb-2 border rounded-lg" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Your Name" />
      <input className="w-full p-2 mb-2 border rounded-lg" value={address} onChange={e => setAddress(e.target.value)} placeholder="Address Line 1" />
      <input className="w-full p-2 mb-2 border rounded-lg" value={town} onChange={e => setTown(e.target.value)} placeholder="Town" />
      <input className="w-full p-2 mb-2 border rounded-lg" value={county} onChange={e => setCounty(e.target.value)} placeholder="County" />
      <input className="w-full p-2 mb-2 border rounded-lg" value={postcode} onChange={e => setPostcode(e.target.value)} placeholder="Postcode" />
      <input className="w-full p-2 mb-2 border rounded-lg" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" />
      <input className="w-full p-2 mb-2 border rounded-lg" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input className="w-full p-2 mb-2 border rounded-lg" value={vatNumber} onChange={e => setVatNumber(e.target.value)} placeholder="VAT Number" />
      <textarea className="w-full p-2 mb-2 border rounded-lg" value={termsConditions} onChange={e => setTermsConditions(e.target.value)} placeholder="Terms and Conditions" rows="4" />
      <input className="w-full p-2 mb-2 border rounded-lg" value={bankAccountName} onChange={e => setBankAccountName(e.target.value)} placeholder="Bank Account Name" />
      <input className="w-full p-2 mb-2 border rounded-lg" value={sortCode} onChange={e => setSortCode(e.target.value)} placeholder="Sort Code" />
      <input className="w-full p-2 mb-2 border rounded-lg" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Account Number" />
      <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition duration-200" onClick={handleSave}>Save</button>
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800">Usage Instructions</h3>
        <p className="text-gray-600">{usageInstructions}</p>
      </div>
      <div className="mt-2">
        <p className="text-gray-600">Version: {version}</p>
        <p className="text-gray-600">Contact Developer: support@x.ai</p>
      </div>
      <p className="mt-4 text-sm text-gray-500">© 2025 MC</p>
    </div>
  );
});

const App = () => {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [clients, setClients] = useState([]);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [authError, setAuthError] = useState(null);
  const [activeView, setActiveView] = useState("jobs");
  const [authEmail, setAuthEmail] = useState("");

  // ----------- OFFLINE STATUS DETECTION -----------
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
  // -----------------------------------------------

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async user => {
      setUser(user);
      if (user) {
        try {
          const settingsRef = doc(db, "users", user.uid, "settings", "userSettings");
          const settingsSnap = await getDoc(settingsRef);
          if (!settingsSnap.exists()) {
            await setDoc(settingsRef, {
              ownerName: "",
              address: "",
              town: "",
              county: "",
              postcode: "",
              phone: "",
              email: "",
              vatNumber: "",
              termsConditions: "",
              bankAccountName: "",
              sortCode: "",
              accountNumber: ""
            }, { merge: true });
          }
          onSnapshot(query(collection(db, "users", user.uid, "jobs"), orderBy("createdAt")), snapshot => setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
          onSnapshot(query(collection(db, "users", user.uid, "sessions"), orderBy("startTime")), snapshot => setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
          onSnapshot(query(collection(db, "users", user.uid, "clients"), orderBy("createdAt")), snapshot => setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
          onSnapshot(query(collection(db, "users", user.uid, "invoices"), orderBy("createdAt")), snapshot => setSavedInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        } catch (error) {
          console.error("Auth state change error:", error);
        }
      } else {
        setJobs([]);
        setSessions([]);
        setClients([]);
        setSavedInvoices([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const jobsWithSessions = useMemo(() =>
    jobs.map(job => ({
      ...job,
      sessions: sessions.filter(s => s.jobId === job.id && s.duration).sort((a, b) => b.startTime - a.startTime)
    })).reverse(), [jobs, sessions]);

  // Auth handlers
  const handleLogin = (email, password) => {
    setAuthError(null);
    signInWithEmailAndPassword(auth, email, password).catch(e => setAuthError(e.message));
  };
  const handleSignUp = (email, password) => {
    setAuthError(null);
    createUserWithEmailAndPassword(auth, email, password).catch(e => setAuthError(e.message));
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

  // CRUD handlers
  const handleAddJob = useCallback(async ({ name, rate, clientId }) => {
    if (user && name) {
      try {
        await addDoc(collection(db, "users", user.uid, "jobs"), { name, hourlyRate: rate, clientId, createdAt: serverTimestamp() });
      } catch (error) {
        console.error("Add job error:", error);
      }
    }
  }, [user]);

  const startTimer = useCallback(async jobId => {
    if (user) {
      try {
        await addDoc(collection(db, "users", user.uid, "sessions"), { jobId, startTime: Date.now(), createdAt: serverTimestamp(), endTime: null, duration: 0 });
      } catch (error) {
        console.error("Start timer error:", error);
      }
    }
  }, [user]);

  const stopTimer = useCallback(async jobId => {
    if (user) {
      try {
        const q = query(collection(db, "users", user.uid, "sessions"), where("jobId", "==", jobId), where("endTime", "==", null));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const session = snapshot.docs[0].data();
          if (session.startTime)
            await setDoc(doc(db, "users", user.uid, "sessions", snapshot.docs[0].id), { endTime: Date.now(), duration: roundToNext15(Date.now() - session.startTime) }, { merge: true });
        }
      } catch (error) {
        console.error("Stop timer error:", error);
      }
    }
  }, [user]);

  const handleManualEntry = useCallback(async (jobId, { startTime, endTime, duration }) => {
    if (user) {
      try {
        await addDoc(collection(db, "users", user.uid, "sessions"), { jobId, startTime, endTime, duration, createdAt: serverTimestamp() });
      } catch (error) {
        console.error("Manual entry error:", error);
      }
    }
  }, [user]);

  const deleteSession = useCallback(async sessionId => {
    if (user) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "sessions", sessionId));
      } catch (error) {
        console.error("Delete session error:", error);
      }
    }
  }, [user]);

  const deleteJob = useCallback(async jobId => {
    if (user) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "jobs", jobId));
      } catch (error) {
        console.error("Delete job error:", error);
      }
    }
  }, [user]);

  const updateSettings = useCallback(async settings => {
    if (user) {
      try {
        const settingsRef = doc(db, "users", user.uid, "settings", "userSettings");
        await setDoc(settingsRef, settings, { merge: true });
      } catch (error) {
        console.error("Update settings error:", error);
      }
    }
  }, [user]);

  const addClient = useCallback(async client => {
    if (user) {
      try {
        await addDoc(collection(db, "users", user.uid, "clients"), client);
      } catch (error) {
        console.error("Add client error:", error);
      }
    }
  }, [user]);

  const saveInvoice = useCallback(async invoiceData => {
    if (user) {
      try {
        await addDoc(collection(db, "users", user.uid, "invoices"), invoiceData);
      } catch (error) {
        console.error("Save invoice error:", error);
      }
    }
  }, [user]);

  const updateInvoice = useCallback(async (invoiceId, invoiceData) => {
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid, "invoices", invoiceId), invoiceData, { merge: true });
      } catch (error) {
        console.error("Update invoice error:", error);
      }
    }
  }, [user]);

  const deleteInvoice = useCallback(async invoiceId => {
    if (user) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "invoices", invoiceId));
      } catch (error) {
        console.error("Delete invoice error:", error);
      }
    }
  }, [user]);

  const assignJobToClient = useCallback(async (jobId, clientId) => {
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid, "jobs", jobId), { clientId }, { merge: true });
      } catch (error) {
        console.error("Assign job to client error:", error);
      }
    }
  }, [user]);

  const updateClient = useCallback(async (clientId, clientData) => {
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid, "clients", clientId), clientData, { merge: true });
      } catch (error) {
        console.error("Update client error:", error);
      }
    }
  }, [user]);

  const deleteClient = useCallback(async clientId => {
    if (user) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "clients", clientId));
        const jobsQuery = query(collection(db, "users", user.uid, "jobs"), where("clientId", "==", clientId));
        const jobsSnapshot = await getDocs(jobsQuery);
        jobsSnapshot.forEach(async doc => {
          await setDoc(doc.ref, { clientId: null }, { merge: true });
        });
      } catch (error) {
        console.error("Delete client error:", error);
      }
    }
  }, [user]);

  // Generate Invoice (omitted for brevity - keep your previous implementation here if needed)

  const contextValue = {
    user,
    jobs: jobsWithSessions,
    sessions,
    clients,
    savedInvoices,
    startTimer,
    stopTimer,
    handleAddJob,
    handleManualEntry,
    updateSettings,
    addClient,
    saveInvoice,
    updateInvoice,
    deleteInvoice,
    deleteSession,
    assignJobToClient,
    updateClient,
    deleteJob,
    deleteClient
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #00AEEF, #FFFFFF, #F58220)" }}>
        {/* === OFFLINE BANNER === */}
        {!isOnline && (
          <div className="bg-yellow-200 text-yellow-800 text-center p-2 mb-2">
            Offline: changes will be synced when connection is restored.
          </div>
        )}
        {/* ====================== */}
        {!user ? (
          <AuthView
            handleLogin={handleLogin}
            handleSignUp={handleSignUp}
            authError={authError}
            handlePasswordReset={handlePasswordReset}
            email={authEmail}
            setEmail={setAuthEmail}
          />
        ) : (
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6 pt-6 logo-container">
              <a href="https://itsmyapp.co.uk" target="_blank" rel="noopener noreferrer">
                <img src="/logo.png" alt="Logo" className="logo-image" />
              </a>
              <div className="flex items-center space-x-2">
                <button className="bg-f58220 hover:bg-f58220-darker text-white p-2 rounded-lg transition duration-200"
                  onClick={handleLogout}
                  style={{ backgroundColor: "#F58220", "--hover-color": "#D46F1C" }}>Logout</button>
                <button className="bg-00aeef hover:bg-00aeef-darker p-2 rounded-lg transition duration-200"
                  onClick={() => setActiveView("settings")}
                  style={{ backgroundColor: "#00AEEF", "--hover-color": "#0099CC" }}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.14 12.94c.04-.31.06-.62.06-.94 0-.32-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.47-.12-.61l-2.03-1.58zm-7.14 3.06c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mb-4 mt-4">
              {["jobs", "invoices", "clients", "help"].map(view => (
                <button key={view}
                  className={`mr-2 p-2 rounded-lg ${activeView === view ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"} transition duration-200`}
                  onClick={() => setActiveView(view)}>
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
            {activeView === "jobs" && <JobsView clients={clients} />}
            {activeView === "invoices" && <InvoicesPage />}
            {activeView === "clients" && <ClientsPage />}
            {activeView === "settings" && <SettingsView />}
            {activeView === "help" && <HelpView />}
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
};

export default App;