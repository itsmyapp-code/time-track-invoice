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
    FaMoon,
    FaSun,
    FaUserShield
} from 'react-icons/fa';

export default function Layout({ children, user, isPro, handleLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Dark mode state with system preference fallback
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

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
        <div className="flex min-h-screen bg-slate-50">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
            >
                {/* Logo Area */}
                <div className="flex items-center justify-center h-20 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
                        <span className="font-bold text-xl text-slate-800 tracking-tight">TimeTrack</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => {
                                navigate(item.path);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive(item.path)
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <div className="space-y-1">
                        <button
                            onClick={() => { navigate('/settings'); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive('/settings') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}
                        >
                            <FaCog /> Settings
                        </button>
                        <button
                            onClick={() => { navigate('/help'); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive('/help') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}
                        >
                            <FaQuestionCircle /> Help
                        </button>
                        <button
                            onClick={() => { setIsDarkMode(!isDarkMode); setSidebarOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors text-slate-500 hover:bg-white hover:text-slate-800"
                        >
                            {isDarkMode ? <FaSun /> : <FaMoon />} {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>

                        {user && user.email && user.email.toLowerCase() === 'martin@cozens.me.uk' && (
                            <button
                                onClick={() => { navigate('/admin'); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${isActive('/admin') ? 'bg-indigo-100 text-indigo-700' : 'text-indigo-600 hover:bg-slate-50'}`}
                            >
                                <FaUserShield /> Admin Console
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg text-red-500 hover:bg-red-50 transition-colors mt-2"
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                    <div className="mt-4 flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                {user?.email || 'User'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                                {isPro ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                        Pro Version
                                    </span>
                                ) : (
                                    <span className="text-slate-400">Free Tier</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen lg:ml-64 relative">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white shadow-sm flex items-center justify-between px-4 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-slate-500 hover:text-slate-700 focus:outline-none p-2"
                    >
                        <FaBars size={24} />
                    </button>
                    <span className="font-bold text-lg text-slate-800">TimeTrack</span>
                    {/* Placeholder for balance/notification if needed, or empty div to balance flex */}
                    <div className="w-8"></div>
                </header>

                {/* Page Content */}
                <main className="flex-1 bg-slate-50 p-2 md:p-4 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <GlobalFooter theme="light" />
            </div>
        </div>
    );
}
