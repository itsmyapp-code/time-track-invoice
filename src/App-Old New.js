import React, { useState, useEffect, useMemo, useContext, createContext, memo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, collection, onSnapshot, addDoc, setDoc, serverTimestamp, query, orderBy, deleteDoc, where, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PDFDocument, StandardFonts } from 'pdf-lib';

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
const functions = getFunctions(firebaseApp);
const storage = getStorage(firebaseApp);
export const AppContext = createContext();

const formatCurrency = (amount) => `£${amount.toFixed(2)}`;
const formatTime = (ms) => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};
const roundToNext15 = (ms) => {
  const minutes = Math.ceil(ms / 60000 / 15) * 15;
  return minutes * 60000;
};

const AuthView = memo(({ handleLogin, handleSignUp, authError, handlePasswordReset, email, setEmail }) => {
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{isLogin ? 'Login' : 'Sign Up'}</h2>
      <input
        className="w-full p-2 mb-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <div className="relative w-full mb-2">
        <input
          className="w-full p-2 border rounded pr-10"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>

      {authError && <p className="text-red-500 mb-2">{authError}</p>}
      <button
        className="w-full bg-blue-500 text-white p-2 rounded mb-2"
        onClick={() => (isLogin ? handleLogin(email, password) : handleSignUp(email, password))}
      >
        {isLogin ? 'Login' : 'Sign Up'}
      </button>
      <button
        className="w-full bg-gray-200 p-2 rounded mb-2"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? 'Sign Up' : 'Login'}
      </button>

      {isLogin && (
        <button
          className="w-full bg-transparent text-blue-500 p-2 rounded"
          onClick={() => handlePasswordReset(email)}
          disabled={!email}
        >
          Forgot Password?
        </button>
      )}
    </div>
  );
});

const TasksView = memo(() => {
    const { tasks, sessions, startTimer, stopTimer, handleAddTask, handleManualEntry, deleteSession } = useContext(AppContext);
    const [taskName, setTaskName] = useState('');
    const [rate, setRate] = useState('');
    const [manualTask, setManualTask] = useState(null);
    const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
    const [manualStart, setManualStart] = useState('');
    const [manualEnd, setManualEnd] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);

    const activeSession = useMemo(() => sessions.find(s => !s.endTime), [sessions]);

    useEffect(() => {
        let interval;
        if (activeSession) {
            interval = setInterval(() => {
                const now = Date.now();
                const elapsed = now - activeSession.startTime;
                setElapsedTime(elapsed);
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [activeSession]);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualTask && manualDate && manualStart && manualEnd) {
            const startTime = new Date(`${manualDate}T${manualStart}`).getTime();
            const endTime = new Date(`${manualDate}T${manualEnd}`).getTime();
            if (endTime > startTime) {
                const duration = roundToNext15(endTime - startTime);
                handleManualEntry(manualTask.id, { startTime, endTime, duration });
                setManualTask(null);
                setManualDate(new Date().toISOString().split('T')[0]);
                setManualStart('');
                setManualEnd('');
            }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Tasks</h2>
            <div className="mb-4">
                <input className="w-full p-2 mb-2 border rounded" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Task Name" />
                <input className="w-full p-2 mb-2 border rounded" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="Rate (£)" />
                <button className="bg-blue-500 text-white p-2 rounded" onClick={() => { handleAddTask({ name: taskName, rate: parseFloat(rate) || 0 }); setTaskName(''); setRate(''); }}>Add Task</button>
            </div>
            {tasks.map(task => {
                const totalTime = task.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
                const totalEarnings = (totalTime / 3600000) * (task.hourlyRate || 0);
                const isTaskActive = activeSession && activeSession.taskId === task.id;

                return (
                    <div key={task.id} className="mb-2 p-2 border rounded">
                        <h3 className="font-bold">{task.name}</h3>
                        <p>Total Time: {formatTime(totalTime)}</p>
                        <p>Amount Charged: {formatCurrency(totalEarnings)}</p>
                        {isTaskActive && (
                            <p className="font-bold text-green-600">Timer: {formatTime(elapsedTime)}</p>
                        )}
                        <button className="bg-green-500 text-white p-2 rounded mr-2 disabled:bg-gray-400" onClick={() => startTimer(task.id)} disabled={!!activeSession}>Start</button>
                        <button className="bg-red-500 text-white p-2 rounded disabled:bg-gray-400" onClick={() => stopTimer(task.id)} disabled={!isTaskActive}>Stop</button>
                        <button className="bg-yellow-500 text-white p-2 rounded ml-2" onClick={() => setManualTask(task)}>Add Manual Time</button>
                        {task.sessions.length > 0 && (
                            <div className="mt-2">
                                <h4 className="font-semibold">Sessions:</h4>
                                {task.sessions.map((session) => (
                                    <div key={session.id} className="flex items-center text-sm mb-1">
                                        <p>Date: {new Date(session.startTime).toLocaleDateString()}, Duration: {formatTime(session.duration)}</p>
                                        <button className="bg-red-500 text-white p-1 rounded ml-2 text-xs" onClick={() => { if (window.confirm('Are you sure you want to delete this session?')) { deleteSession(session.id); } }}>Delete</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }); // Line 194 of the *original error* report. Removed trailing comment.

const SettingsView = memo(() => {
  const { user, updateSettings } = useContext(AppContext);
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [isVatRegistered, setIsVatRegistered] = useState(false);
  const [vatNumber, setVatNumber] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  const [defaultRate, setDefaultRate] = useState('');

  useEffect(() => {
    if (user) {
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'userSettings');
      const unsubscribe = onSnapshot(settingsRef, (doc) => {
        const data = doc.data() || {};
        setOwnerName(data.ownerName || '');
        setAddress(data.address || '');
        setEmail(data.email || '');
        setIsVatRegistered(data.isVatRegistered || false);
        setVatNumber(data.vatNumber || '');
        setTermsConditions(data.termsConditions || '');
        setDefaultRate(data.defaultRate || '');
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleSave = async () => {
    if (user) {
      try {
        await updateSettings({ ownerName, address, email, isVatRegistered, vatNumber, termsConditions, defaultRate: parseFloat(defaultRate) || 0 });
        alert('Settings saved successfully!');
      } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings.');
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <div className="mb-4">
        <input className="w-full p-2 mb-2 border rounded" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Your Name" />
        <input className="w-full p-2 mb-2 border rounded" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
        <input className="w-full p-2 mb-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" />
        <label className="flex items-center mb-2">
          <input type="checkbox" checked={isVatRegistered} onChange={(e) => setIsVatRegistered(e.target.checked)} className="mr-2" />
          VAT Registered
        </label>
        {isVatRegistered && (
          <input className="w-full p-2 mb-2 border rounded" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder="VAT Number" />
        )}
        <textarea className="w-full p-2 mb-2 border rounded" value={termsConditions} onChange={(e) => setTermsConditions(e.target.value)} placeholder="Terms and Conditions" rows="4" />
        <input className="w-full p-2 mb-2 border rounded" type="number" value={defaultRate} onChange={(e) => setDefaultRate(e.target.value)} placeholder="Default Rate (£)" />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
});

const ClientsView = memo(() => {
  const { clients, addClient } = useContext(AppContext);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  const handleAddClient = () => {
    if (clientName && clientEmail) {
      addClient({ name: clientName, email: clientEmail, phone: clientPhone, address: clientAddress, notes: clientNotes, createdAt: serverTimestamp() });
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setClientAddress('');
      setClientNotes('');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Clients</h2>
      <div className="mb-4">
        <input className="w-full p-2 mb-2 border rounded" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client Name" />
        <input className="w-full p-2 mb-2 border rounded" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Client Email" />
        <input className="w-full p-2 mb-2 border rounded" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Phone Number" />
        <input className="w-full p-2 mb-2 border rounded" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Address" />
        <textarea className="w-full p-2 mb-2 border rounded" value={clientNotes} onChange={(e) => setClientNotes(e.target.value)} placeholder="Notes" rows="2" />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={handleAddClient}>Add Client</button>
      </div>
      {clients.map(client => (
        <div key={client.id} className="mb-2 p-2 border rounded">
          <p>{client.name} - {client.email}</p>
          <p>Phone: {client.phone || 'N/A'}</p>
          <p>Address: {client.address || 'N/A'}</p>
          <p>Notes: {client.notes || 'N/A'}</p>
        </div>
      ))}
    </div>
  );
}); // Removed trailing comment from here.

const FinancialsView = memo(() => {
    const { tasks, sessions, generateInvoice } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [taskId, setTaskId] = useState('');
    const [message, setMessage] = useState('');

    const handleInvoice = async (sendEmail = false) => {
        try {
            await generateInvoice(taskId, email, sendEmail);
            setMessage(sendEmail ? 'Email sent!' : 'Downloaded!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Financials</h2>
            <div className="mb-4">
                <select className="w-full p-2 mb-2 border rounded" value={taskId} onChange={(e) => setTaskId(e.target.value)}>
                    <option value="">Select Task</option>
                    {tasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}
                </select>
                <input className="w-full p-2 mb-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Recipient Email" />
                <button className="bg-blue-500 text-white p-2 rounded mr-2" onClick={() => handleInvoice(false)} disabled={!taskId}>Download Invoice</button>
                <button className="bg-green-500 text-white p-2 rounded" onClick={() => handleInvoice(true)} disabled={!taskId || !email}>Email Invoice</button>
                {message && <p className={message.includes('Error') ? 'text-red-500' : 'text-green-500'}>{message}</p>}
            </div>
        </div>
    );
}); // Removed trailing comment from here.

const App = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [clients, setClients] = useState([]);
  const [authError, setAuthError] = useState(null);
  const [activeView, setActiveView] = useState('tasks');
  const [authEmail, setAuthEmail] = useState(''); // State to hold email in AuthView

  // FIX 2: STABLE DATA LOADING
  // This useEffect now only depends on `user` and correctly sets up listeners.
  // It no longer tries to merge data, preventing bugs and infinite loops.
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);

    if (user) {
      // Clear any previous data when user changes
      setTasks([]);
      setSessions([]);
      setClients([]);
      
      const unsubscribeTasks = onSnapshot(query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt')), (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasks(tasksData);
      }, (error) => console.error("Tasks error:", error));

      const unsubscribeSessions = onSnapshot(query(collection(db, 'users', user.uid, 'sessions'), orderBy('createdAt')), (snapshot) => {
        const sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSessions(sessionsData);
      }, (error) => console.error("Sessions error:", error));

      const unsubscribeClients = onSnapshot(query(collection(db, 'users', user.uid, 'clients'), orderBy('createdAt')), (snapshot) => {
        const clientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClients(clientsData);
      }, (error) => console.error("Clients error:", error));

      return () => {
        unsubscribeTasks();
        unsubscribeSessions();
        unsubscribeClients();
      };
    } else {
      // If no user, clear all data
      setTasks([]);
      setSessions([]);
      setClients([]);
    }
    
    return () => unsubscribeAuth();
  }, [user]);
  
  // FIX 2 (CONTINUED): SAFE DATA MERGING
  // useMemo combines tasks and sessions for display. It only re-calculates when
  // the raw `tasks` or `sessions` data changes, which is very efficient.
  const tasksWithSessions = useMemo(() => {
    return tasks.map(task => ({
        ...task,
        sessions: sessions.filter(s => s.taskId === task.id && s.duration).sort((a,b) => b.startTime - a.startTime)
    })).reverse();
  }, [tasks, sessions]);

  // Updated handleLogin to give better error messages
  const handleLogin = (email, password) => {
    setAuthError(null);
    signInWithEmailAndPassword(auth, email, password)
      .catch(e => {
        let errorMessage = e.message;
        if (e.code === 'auth/wrong-password') {
          errorMessage = 'Incorrect password. Please try again.';
        } else if (e.code === 'auth/user-not-found') {
          errorMessage = 'No account found with that email. Please sign up or check your email.';
        } else if (e.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email format.';
        }
        setAuthError(errorMessage);
      });
  };

  // Updated handleSignUp to give better error messages
  const handleSignUp = (email, password) => {
    setAuthError(null);
    createUserWithEmailAndPassword(auth, email, password)
      .catch(e => {
        let errorMessage = e.message;
        if (e.code === 'auth/email-already-in-use') {
          errorMessage = 'This email is already registered. Please log in instead.';
        } else if (e.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email format.';
        } else if (e.code === 'auth/weak-password') {
          errorMessage = 'Password is too weak. Please use at least 6 characters.';
        }
        setAuthError(errorMessage);
      });
  };

  const handleLogout = () => signOut(auth);

  // handlePasswordReset function
  const handlePasswordReset = async (email) => {
    setAuthError(null); // Clear previous errors
    if (!email) {
      setAuthError('Please enter your email to reset password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent! Check your inbox.'); // Using alert for simplicity, can be improved
    } catch (e) {
      let errorMessage = e.message;
      if (e.code === 'auth/user-not-found') {
        errorMessage = 'No account found with that email.';
      } else if (e.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      }
      setAuthError(errorMessage);
    }
  };

  const handleAddTask = useCallback(async ({ name, rate }) => {
    if (user && name) {
      const tasksRef = collection(doc(db, 'users', user.uid), 'tasks');
      await addDoc(tasksRef, { name, hourlyRate: rate, createdAt: serverTimestamp() });
    }
  }, [user]);

  const startTimer = useCallback(async (taskId) => {
    if (user) {
      const sessionsRef = collection(doc(db, 'users', user.uid), 'sessions');
      await addDoc(sessionsRef, { taskId, startTime: Date.now(), createdAt: serverTimestamp(), endTime: null, duration: 0 });
    }
  }, [user]);

  // FIX 3: RELIABLE STOP TIMER
  // This function now queries the database directly to find the running timer,
  // making it much more reliable than searching the local state.
  const stopTimer = useCallback(async (taskId) => {
    if (user) {
      const sessionsRef = collection(doc(db, 'users', user.uid), 'sessions');
      const q = query(sessionsRef, where("taskId", "==", taskId), where("endTime", "==", null));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const sessionDoc = querySnapshot.docs[0];
        const session = sessionDoc.data();
        if (session.startTime) {
            const duration = roundToNext15(Date.now() - session.startTime);
            await setDoc(sessionDoc.ref, { endTime: Date.now(), duration }, { merge: true });
        }
      }
    }
  }, [user]);

  const handleManualEntry = useCallback(async (taskId, { startTime, endTime, duration }) => {
    if (user) {
      const sessionsRef = collection(doc(db, 'users', user.uid), 'sessions');
      await addDoc(sessionsRef, { taskId, startTime, endTime, duration, createdAt: serverTimestamp() });
    }
  }, [user]);

  const deleteSession = useCallback(async (sessionId) => {
    if (user) {
      const sessionRef = doc(db, 'users', user.uid, 'sessions', sessionId);
      await deleteDoc(sessionRef);
    }
  }, [user]);

  const updateSettings = useCallback(async (settings) => {
    if (user) {
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'userSettings');
      await setDoc(settingsRef, settings, { merge: true });
    }
  }, [user]);

  const addClient = useCallback(async (client) => {
    if (user) {
      const clientsRef = collection(doc(db, 'users', user.uid), 'clients');
      await addDoc(clientsRef, client);
    }
  }, [user]);

  const generateInvoice = useCallback(async (taskId, recipientEmail, sendEmail) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    const taskSessions = sessions.filter(s => s.taskId === taskId && s.duration);
    if (!taskSessions.length) throw new Error('No time tracked');

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    page.drawText(`Invoice for ${task.name}`, { x: 50, y: 700, font });
    let total = 0;
    taskSessions.forEach((s, i) => {
      const hours = s.duration / 3600000;
      const earnings = hours * (task.hourlyRate || 0);
      total += earnings;
      page.drawText(`${i + 1}. ${new Date(session.startTime).toLocaleDateString()}, Duration: ${formatTime(s.duration)} - ${formatCurrency(earnings)}`, { x: 50, y: 600 - (i * 20), font, size: 12 });
    });
    page.drawText(`Total: ${formatCurrency(total)}`, { x: 50, y: 500, font });

    const pdfBytes = await pdfDoc.save();

    if (sendEmail) {
        // Upload PDF to Firebase Storage first
        const invoiceFileName = `invoices/${user.uid}/${task.id}-${Date.now()}.pdf`; // Path in storage
        const storageRef = ref(storage, invoiceFileName);
        const uploadResult = await uploadBytes(storageRef, pdfBytes); // Upload bytes
        const pdfDownloadURL = await getDownloadURL(uploadResult.ref); // Get URL

        console.log("PDF uploaded to Storage. URL:", pdfDownloadURL); // Log URL for debugging

      const sendEmailFunc = httpsCallable(functions, 'sendInvoiceEmail');
      // Send the URL instead of base64 data
      await sendEmailFunc({ 
            email: recipientEmail, 
            pdfURL: pdfDownloadURL, // Send URL instead of pdfData
            totalAmount: total.toFixed(2), 
            taskName: task.name 
        });
    } else {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${task.name}.pdf`;
      URL.revokeObjectURL(url);
    }
  }, [tasks, sessions, user]); // Added 'user' to dependency array for 'user.uid'

  const contextValue = {
    user,
    tasks: tasksWithSessions,
    sessions,
    clients,
    startTimer,
    stopTimer,
    handleAddTask,
    handleManualEntry,
    generateInvoice,
    updateSettings,
    addClient,
    deleteSession,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-100">
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
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">Time Tracker</h1>
              <button className="bg-red-500 text-white p-2 rounded" onClick={handleLogout}>Logout</button>
            </div>
            <div className="mb-4">
              {['tasks', 'financials', 'settings', 'clients'].map(view => (
                <button
                  key={view}
                  className={`mr-2 p-2 rounded ${activeView === view ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setActiveView(view)}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
            {activeView === 'tasks' && <TasksView />}
            {activeView === 'financials' && <FinancialsView />}
            {activeView === 'settings' && <SettingsView />}
            {activeView === 'clients' && <ClientsView />}
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
};

export default App;