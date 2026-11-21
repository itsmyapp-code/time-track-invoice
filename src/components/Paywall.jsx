import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { FaLock, FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function Paywall({ user }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const q = query(collection(db, "products"), where("active", "==", true));
                const querySnapshot = await getDocs(q);
                const productsMap = {};

                for (const element of querySnapshot.docs) {
                    const productDoc = element;
                    productsMap[productDoc.id] = productDoc.data();
                    const pSnapshot = await getDocs(query(collection(productDoc.ref, "prices"), where("active", "==", true)));
                    productsMap[productDoc.id].prices = pSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                }

                const validProducts = Object.values(productsMap).filter(p => p.prices && p.prices.length > 0);
                setProducts(validProducts);
            } catch (err) {
                console.error("Error fetching products:", err);
            }
            setLoading(false);
        };

        if (user) {
            fetchProducts();
        }
    }, [user]);

    const handleSubscribe = async (priceId) => {
        setCheckoutLoading(true);
        try {
            const docRef = await addDoc(collection(db, "users", user.uid, "checkout_sessions"), {
                price: priceId,
                success_url: window.location.origin + "/dashboard",
                cancel_url: window.location.origin,
                trial_period_days: 14
            });

            onSnapshot(docRef, (snap) => {
                const { error, url } = snap.data() || {};
                if (error) {
                    console.error("An error occurred during checkout:", error.message);
                    setCheckoutLoading(false);
                    alert(`An error occurred: ${error.message}`);
                }
                if (url) {
                    window.location.assign(url);
                }
            });
        } catch (err) {
            console.error("Failed to create checkout session:", err);
            setCheckoutLoading(false);
            alert("Failed to create checkout session. Are you in test mode?");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-10 px-4 h-full">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center text-slate-900">
                <div className="mx-auto w-16 h-16 bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl flex items-center justify-center mb-6">
                    <FaLock className="text-2xl" />
                </div>
                <h2 className="text-2xl font-extrabold mb-2 text-slate-900">Pro Plan Required</h2>
                <p className="text-sm text-slate-600 mb-7">
                    Upgrade to unlock Time Track Invoice and streamline your client billing and time tracking.
                </p>

                <ul className="text-left space-y-3 mb-8 text-sm text-slate-700">
                    {["Unlimited PDF Invoices", "Client & Job Management", "Offline Syncing (PWA)", "Secure UK GDPR Cloud Backups"].map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <FaCheckCircle className="text-emerald-600 shrink-0" />
                            <span className="font-medium">{feature}</span>
                        </li>
                    ))}
                </ul>

                {loading ? (
                    <div className="flex justify-center items-center py-4">
                        <FaSpinner className="animate-spin text-2xl text-blue-700" />
                    </div>
                ) : products.length > 0 ? (
                    <div className="space-y-4">
                        {products.map((product) => (
                            <div key={product.name || product.id}>
                                {product.prices.map(price => (
                                    <button
                                        key={price.id}
                                        onClick={() => handleSubscribe(price.id)}
                                        disabled={checkoutLoading}
                                        className="w-full flex-col flex justify-center items-center gap-1 py-3.5 px-6 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-700/20 transition disabled:opacity-50"
                                    >
                                        <div className="flex items-center gap-2 text-sm">
                                            {checkoutLoading ? <FaSpinner className="animate-spin" /> : null}
                                            {checkoutLoading ? "Redirecting to secure checkout..." : `Subscribe to ${product.name} (${(price.unit_amount / 100).toLocaleString('en-GB', { style: 'currency', currency: price.currency })}/${price.interval})`}
                                        </div>
                                        {!checkoutLoading && (
                                            <span className="text-xs font-medium text-orange-200">
                                                Includes 14-day free trial &amp; statutory cooling-off period
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ))}
                        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-[11px] text-slate-600 leading-relaxed space-y-1">
                            <p>
                                <strong className="text-slate-800">Anti-Drip Total Pricing (DMCCA 2024):</strong> Displayed total price is inclusive of all mandatory fees and applicable taxes.
                            </p>
                            <p>
                                <strong className="text-slate-800">14-Day Cooling-Off &amp; Same-Channel Exit:</strong> Statutory 14-day cooling-off applies on initial purchase, trial-to-paid conversion, and annual renewal. Cancel anytime in one click via Settings &rarr; Manage Subscription.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="py-4 px-4 border border-dashed border-red-300 bg-red-50 text-red-700 rounded-xl">
                        <p className="font-bold text-sm">Setup Required</p>
                        <p className="text-xs mt-1">Please create a Recurring Product in your Stripe Dashboard.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
