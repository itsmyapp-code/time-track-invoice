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

            // Wait for the CheckoutSession to get attached by the extension
            onSnapshot(docRef, (snap) => {
                const { error, url } = snap.data() || {};
                if (error) {
                    console.error("An error occurred during checkout:", error.message);
                    setCheckoutLoading(false);
                    alert(`An error occurred: ${error.message}`);
                }
                if (url) {
                    // Redirect to Stripe Checkout
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
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-800 dark:text-slate-100">
                <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6">
                    <FaLock className="text-2xl" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Pro Plan Required</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    Upgrade to a premium subscription to unlock TimeTrack Invoice and empower your business.
                </p>

                <ul className="text-left space-y-4 mb-8">
                    {["Unlimited Invoices", "Client Management", "Offline Syncing", "Secure Cloud Backups"].map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <FaCheckCircle className="text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>

                {loading ? (
                    <div className="flex justify-center items-center py-4">
                        <FaSpinner className="animate-spin text-2xl text-indigo-500" />
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
                                        className="w-full flex-col flex justify-center items-center gap-1 py-3 px-6 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            {checkoutLoading ? <FaSpinner className="animate-spin" /> : null}
                                            {checkoutLoading ? "Redirecting to secure checkout..." : `Subscribe to ${product.name} (${(price.unit_amount / 100).toLocaleString('en-GB', { style: 'currency', currency: price.currency })}/${price.interval})`}
                                        </div>
                                        {!checkoutLoading && (
                                            <span className="text-xs font-normal text-indigo-200">
                                                Includes 14-day free trial &amp; cooling-off period
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ))}
                        <p className="text-[11px] text-slate-400 mt-3 leading-normal">
                            Total price shown is inclusive of all taxes (Anti-Drip Pricing). Features the statutory 14-day cooling-off guarantee and 1-click self-service cancellation via the customer portal.
                        </p>
                    </div>
                ) : (
                    <div className="py-4 border border-dashed border-red-300 bg-red-50 text-red-600 rounded-xl">
                        <p className="font-semibold">Setup Required</p>
                        <p className="text-sm">Please create a Recurring Product in your Stripe Dashboard.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
