import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, doc, setDoc } from 'firebase/firestore';

export default function AdminPage({ d, navigate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllUsers = async () => {
            setIsLoading(true);
            try {
                const q = query(collection(d, "users"));
                const querySnapshot = await getDocs(q);
                const results = [];
                for (const userDoc of querySnapshot.docs) {
                    const userData = { id: userDoc.id, ...userDoc.data() };
                    // Fetch actual Stripe subscription status
                    try {
                        const subsSnapshot = await getDocs(collection(userDoc.ref, "subscriptions"));
                        let stripeStatus = null;
                        subsSnapshot.forEach(subDoc => {
                            const s = subDoc.data().status;
                            if (s === 'active' || s === 'trialing') stripeStatus = s;
                            else if (!stripeStatus) stripeStatus = s;
                        });
                        userData.stripeStatus = stripeStatus;
                    } catch {
                        userData.stripeStatus = null;
                    }
                    results.push(userData);
                }
                setAllUsers(results);
            } catch (err) {
                console.error("Error fetching all users:", err);
                setError("Failed to load users. Ensure security rules are updated.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllUsers();
    }, [d]);

    const toggleProStatus = async (userId, currentStatus) => {
        try {
            const userRef = doc(d, "users", userId);
            await setDoc(userRef, { proOverride: !currentStatus }, { merge: true });

            // Update local state to reflect change
            setAllUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, proOverride: !currentStatus } : u
            ));
        } catch (err) {
            console.error("Error updating pro status:", err);
            alert("Failed to update status. Please try again.");
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return allUsers;
        const q = searchQuery.toLowerCase();
        return allUsers.filter(u =>
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.name && u.name.toLowerCase().includes(q)) ||
            u.id.toLowerCase().includes(q))
    }, [searchQuery, allUsers]);

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Admin Console</h1>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium"
                >
                    &larr; Back to Dashboard
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-1 text-slate-800 dark:text-white">Customers</h2>
                        <p className="text-sm text-slate-500">Manage all registered users and their Pro access.</p>
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by name, email, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-96 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4 border border-red-100">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">User Email</th>
                                    <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Name / Extra Info</th>
                                    <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Stripe Subscription</th>
                                    <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Admin Override</th>
                                    <th className="p-4 font-semibold text-sm text-right text-slate-600 dark:text-slate-300">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="p-4 text-sm text-slate-800 dark:text-slate-200 font-medium">
                                            {user.email || 'No Email provided'}
                                            <div className="text-[10px] text-slate-400 font-mono mt-1 blur-[1px] hover:blur-none transition-all cursor-pointer" title="Hover to reveal User ID">
                                                UID: {user.id}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                            {user.name || user.displayName || <span className="text-slate-400 italic">Not provided</span>}
                                        </td>
                                        <td className="p-4">
                                            {user.stripeStatus === 'active' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm">
                                                    Active
                                                </span>
                                            ) : user.stripeStatus === 'trialing' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
                                                    Trialing
                                                </span>
                                            ) : user.stripeStatus ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm capitalize">
                                                    {user.stripeStatus}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 shadow-sm">
                                                    None
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {user.proOverride ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 shadow-sm">
                                                    Override On
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 shadow-sm">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => toggleProStatus(user.id, user.proOverride)}
                                                className={`px-4 py-2 rounded-lg font-medium text-xs transition shadow-sm ${user.proOverride
                                                    ? 'bg-white text-red-600 hover:bg-red-50 border border-red-200'
                                                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                                                    }`}
                                            >
                                                {user.proOverride ? 'Revoke Access' : 'Grant Pro Access'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        No users found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
