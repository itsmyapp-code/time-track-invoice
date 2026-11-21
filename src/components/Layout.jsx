import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GlobalFooter from './GlobalFooter';
import {
    FaChartPie,
    FaBriefcase,
    FaUsers,
    FaFileInvoiceDollar,
    FaChartBar,
    FaCog,
    FaQuestionCircle,
    FaSignOutAlt,
    FaBars,
    FaUserShield
} from 'react-icons/fa';

export default function Layout({ children, user, isPro, handleLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Enforce ItsMyApp Light-Mode Standard across all sessions
    useEffect(() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        try {
            localStorage.removeItem('theme');
        } catch (e) {}
    }, []);

    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { label: 'Dashboard', path: '/dashboard', icon: <FaChartPie /> },
        { label: 'Jobs', path: '/jobs', icon: <FaBriefcase /> },
        { label: 'Clients', path: '/clients', icon: <FaUsers /> },
        { label: 'Invoices', path: '/invoices', icon: <FaFileInvoiceDollar /> },
        { label: 'Reports', path: '/reports', icon: <FaChartBar /> },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex min-h-screen bg-slate-100 text-slate-900">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
            >
                {/* Logo Area */}
                <div className="px-4 py-5 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Time Track Invoice" className="h-10 w-10 object-contain shrink-0" />
                        <div className="min-w-0">
                            <span className="block font-extrabold text-base text-slate-900 tracking-tight leading-tight">
                                Time Track Invoice
                            </span>
                            <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                                <img src="/itsmyapp-logo.png" alt="ItsMyApp" className="h-3.5 w-3.5 object-contain" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                    Part of ItsMyApp
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => {
                                navigate(item.path);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-150 ${isActive(item.path)
                                ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                        >
                            <span className={`text-lg ${isActive(item.path) ? 'text-orange-300' : 'text-slate-400'}`}>
                                {item.icon}
                            </span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/80">
                    <div className="space-y-1">
                        <button
                            onClick={() => { navigate('/settings'); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${isActive('/settings') ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
                        >
                            <FaCog /> Settings
                        </button>
                        <button
                            onClick={() => { navigate('/help'); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${isActive('/help') ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
                        >
                            <FaQuestionCircle /> Help
                        </button>

                        {user && user.email && user.email.toLowerCase() === 'martin@cozens.me.uk' && (
                            <button
                                onClick={() => { navigate('/admin'); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-bold rounded-xl transition-colors ${isActive('/admin') ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'text-blue-700 hover:bg-white'}`}
                            >
                                <FaUserShield /> Admin Console
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold rounded-xl text-red-600 hover:bg-red-50 transition-colors mt-1"
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                            {user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">
                                {user?.email || 'User'}
                            </p>
                            <p className="text-[10px] mt-0.5">
                                {isPro ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                                        Pro Version
                                    </span>
                                ) : (
                                    <span className="text-slate-500">Free Tier</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen lg:ml-64 relative">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white border-b border-slate-200 shadow-xs flex items-center justify-between px-4 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open navigation menu"
                        className="text-slate-600 hover:text-blue-700 focus:outline-none p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <FaBars size={22} />
                    </button>
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Time Track Invoice" className="h-7 w-7 object-contain" />
                        <span className="font-extrabold text-base text-slate-900 tracking-tight">Time Track Invoice</span>
                    </div>
                    <div className="w-9"></div>
                </header>

                {/* Page Content */}
                <main className="flex-1 bg-slate-100 p-3 md:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <GlobalFooter />
            </div>
        </div>
    );
}
