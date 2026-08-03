import React, { useState, useEffect, Suspense, lazy } from 'react';
// Force re-deployment update for routing and navigation
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationsProvider, useNotifications } from './context/NotificationsContext';
import PermissionGate from './components/PermissionGate';
import ErrorFallback from './components/ErrorFallback';
import Loader from './components/Loader';
import CommandPalette from './components/CommandPalette';
import ScrollToTop from './components/ScrollToTop';
import { AnimatePresence } from 'framer-motion';

// Icons
import { Stethoscope, ShieldCheck, Activity, Menu, X, Sun, Moon, LogOut, Users, FileText, Settings as SettingsIcon, Bell } from 'lucide-react';

// Pages (Lazy Loaded)
const Login = lazy(() => import('./pages/Login'));
const Verify = lazy(() => import('./pages/Verify'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PatientList = lazy(() => import('./pages/Patients/PatientList'));
const PatientCreate = lazy(() => import('./pages/Patients/PatientCreate'));
const PatientProfile = lazy(() => import('./pages/Patients/PatientProfile'));
const CreateInvoice = lazy(() => import('./pages/Billing/CreateInvoice'));
const InvoiceDetail = lazy(() => import('./pages/Billing/InvoiceDetail'));
const InvoiceList = lazy(() => import('./pages/Billing/InvoiceList'));
const ReceiptList = lazy(() => import('./pages/Receipts/ReceiptList'));
const ReceiptDetail = lazy(() => import('./pages/Receipts/ReceiptDetail'));
const NotificationList = lazy(() => import('./pages/Notifications/NotificationList'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const UserManagement = lazy(() => import('./pages/Users/UserManagement'));
const Landing = lazy(() => import('./pages/Landing'));

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-[80vh] flex items-center justify-center text-slate-500">Loading...</div>;
  }
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function Navigation({ theme, toggleTheme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, token, logout } = useAuth();
  const { unreadCount } = useNotifications() || {};

  const closeMenu = () => setIsMenuOpen(false);
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Activity className="w-5 h-5" />, perm: 'DASHBOARD_READ' },
    { name: 'Patients', path: '/patients', icon: <Users className="w-5 h-5" />, perm: 'PATIENTS_READ' },
    { name: 'Invoices', path: '/billing', icon: <FileText className="w-5 h-5" />, perm: 'INVOICES_READ' },
    { name: 'Receipts', path: '/receipts', icon: <ShieldCheck className="w-5 h-5" />, perm: 'RECEIPTS_READ' },
    { name: 'Scanner', path: '/verify', icon: <ShieldCheck className="w-5 h-5" />, perm: null }, // Publicly accessible scanner? Or is it protected? The README says POST /verify is no auth, but the scanner page could be public. Actually, the prompt says "Verification (Public - No Auth Required)".
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-500">
      <div className="w-full mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-2xl transition-colors">
          <Stethoscope className="text-primary w-7 h-7" />
          <span>MediTrust</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <PermissionGate key={link.path} permission={link.perm}>
              <Link to={link.path} className={`flex items-center gap-2 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none rounded-md px-1 ${isActive(link.path) && link.path !== '/' ? 'text-primary' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                {link.name}
              </Link>
            </PermissionGate>
          ))}
          
          <PermissionGate permission="DASHBOARD_READ">
            <Link to="/notifications" className={`relative flex items-center gap-2 transition-colors font-medium ${isActive('/notifications') ? 'text-primary' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}>
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-danger text-white text-[10px] font-bold leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </PermissionGate>

          {user?.role?.name === 'ADMIN' && (
            <Link to="/settings" className={`flex items-center gap-2 transition-colors font-medium ${isActive('/settings') ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}>
               <SettingsIcon className="w-5 h-5" />
            </Link>
          )}

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
          
          {token && (
            <>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Hi, {user?.firstName}
              </span>
              <button onClick={logout} aria-label="Logout" className="flex items-center gap-2 text-slate-500 hover:text-danger transition-colors font-medium text-sm focus-visible:ring-2 focus-visible:ring-danger/50 focus-visible:outline-none rounded-md p-1">
                <LogOut size={18} aria-hidden="true" />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
            </>
          )}

          <button onClick={toggleTheme} aria-label="Toggle Dark Mode" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none" title="Toggle Dark Mode">
            {theme === 'dark' ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Hamburger & Theme Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggleTheme} aria-label="Toggle Dark Mode" className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none">
            {theme === 'dark' ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
          </button>
          <button 
            className={`p-2.5 rounded-full transition-all duration-300 shadow-sm ${isMenuOpen ? 'bg-primary text-white shadow-primary/30' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 top-20 bg-slate-900/20 dark:bg-slate-900/60 backdrop-blur-sm z-40"
            onClick={closeMenu}
          ></div>
          <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-2xl py-6 px-4 flex flex-col gap-2 z-50 animate-in slide-in-from-top-2 duration-300">
            {navLinks.map(link => (
              <PermissionGate key={link.path} permission={link.perm}>
                <Link to={link.path} onClick={closeMenu} className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 font-medium ${isActive(link.path) ? 'bg-primary/10 text-primary scale-[0.98]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-[0.98]'}`}>
                  {link.icon} <span className="text-lg">{link.name}</span>
                </Link>
              </PermissionGate>
            ))}
            <PermissionGate permission="DASHBOARD_READ">
              <Link to="/notifications" onClick={closeMenu} className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 font-medium ${isActive('/notifications') ? 'bg-primary/10 text-primary scale-[0.98]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-[0.98]'}`}>
                <span className="relative"><Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-danger text-white text-[9px] font-bold leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                <span className="text-lg">Notifications</span>
              </Link>
            </PermissionGate>
            {user?.role?.name === 'ADMIN' && (
              <Link to="/settings" onClick={closeMenu} className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 font-medium ${isActive('/settings') ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 scale-[0.98]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-[0.98]'}`}>
                <SettingsIcon className="w-6 h-6" /> <span className="text-lg">Admin Settings</span>
              </Link>
            )}
            
            <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-2"></div>
            
            {token && (
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role?.name.toLowerCase()}</p>
                  </div>
                </div>
                <button onClick={() => { logout(); closeMenu(); }} className="p-2.5 rounded-lg text-danger hover:bg-danger/10 transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
}

function MainApp({ theme, toggleTheme }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 bg-dots-pattern relative flex flex-col overflow-hidden text-text dark:text-slate-200 transition-colors duration-500">
      <Toaster position="top-right" />
      <CommandPalette />
      <ScrollToTop />
      
      {/* Premium Background Decorations (Dark Mode Only) */}
      <div className="hidden dark:block absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none z-0"></div>
      <div className="hidden dark:block absolute top-1/4 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 pointer-events-none z-0 animate-breathe"></div>
      <div className="hidden dark:block absolute bottom-1/4 right-0 w-[40rem] h-[40rem] bg-success/10 rounded-full blur-3xl translate-x-1/4 pointer-events-none z-0 animate-float"></div>

      <div className="w-full mx-auto flex flex-col flex-grow relative z-10">
        <Navigation theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-grow relative">
          <Suspense fallback={<Loader fullScreen={true} />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify" element={<Verify />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute><PermissionGate permission="DASHBOARD_READ"><AdminDashboard /></PermissionGate></ProtectedRoute>
                } />

                <Route path="/patients" element={
                  <ProtectedRoute><PermissionGate permission="PATIENTS_READ"><PatientList /></PermissionGate></ProtectedRoute>
                } />
                <Route path="/patients/new" element={
                  <ProtectedRoute><PermissionGate permission="PATIENTS_CREATE"><PatientCreate /></PermissionGate></ProtectedRoute>
                } />
                <Route path="/patients/:id" element={
                  <ProtectedRoute><PermissionGate permission="PATIENTS_READ"><PatientProfile /></PermissionGate></ProtectedRoute>
                } />

                <Route path="/billing" element={
                  <ProtectedRoute><PermissionGate permission="INVOICES_READ"><InvoiceList /></PermissionGate></ProtectedRoute>
                } />
                <Route path="/billing/new" element={
                  <ProtectedRoute><PermissionGate permission="INVOICES_CREATE"><CreateInvoice /></PermissionGate></ProtectedRoute>
                } />
                <Route path="/billing/:invoiceId" element={
                  <ProtectedRoute><PermissionGate permission="INVOICES_READ"><InvoiceDetail /></PermissionGate></ProtectedRoute>
                } />

                <Route path="/receipts" element={
                  <ProtectedRoute><PermissionGate permission="RECEIPTS_READ"><ReceiptList /></PermissionGate></ProtectedRoute>
                } />
                <Route path="/receipts/:id" element={
                  <ProtectedRoute><PermissionGate permission="RECEIPTS_READ"><ReceiptDetail /></PermissionGate></ProtectedRoute>
                } />

                <Route path="/notifications" element={
                  <ProtectedRoute><PermissionGate permission="DASHBOARD_READ"><NotificationList /></PermissionGate></ProtectedRoute>
                } />

                <Route path="/users" element={
                  <ProtectedRoute><PermissionGate permission="ADMIN"><UserManagement /></PermissionGate></ProtectedRoute>
                } />

                <Route path="/settings" element={
                  <ProtectedRoute><PermissionGate permission="ADMIN"><AdminSettings /></PermissionGate></ProtectedRoute>
                } />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <AuthProvider>
        <SocketProvider>
          <NotificationsProvider>
            <BrowserRouter>
              <MainApp theme={theme} toggleTheme={toggleTheme} />
            </BrowserRouter>
          </NotificationsProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
