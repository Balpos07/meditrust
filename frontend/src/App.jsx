import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import StaffDashboard from './pages/StaffDashboard';
import Login from './pages/Login';
import AdminSettings from './pages/AdminSettings';
import PatientInvoice from './pages/PatientInvoice';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Stethoscope, ShieldCheck, Activity, Menu, X, Sun, Moon, LogOut } from 'lucide-react';

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

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-500">
      <div className="w-full mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-2xl transition-colors">
          <Stethoscope className="text-primary w-7 h-7" />
          <span>MediTrust</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`flex items-center gap-2 transition-colors font-medium ${isActive('/') ? 'text-primary' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}>
             Cashier
          </Link>
          <Link to="/staff" className={`flex items-center gap-2 transition-colors font-medium ${isActive('/staff') ? 'text-success' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}>
            Live Board
          </Link>
          <Link to="/verify" className={`flex items-center gap-2 transition-colors font-medium ${isActive('/verify') ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}>
             Security Scanner
          </Link>
          
          {user?.role === 'ADMIN' && (
            <Link to="/settings" className={`flex items-center gap-2 transition-colors font-medium ${isActive('/settings') ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}>
               Settings
            </Link>
          )}

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
          
          {token && (
            <>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Hi, {user?.username}
              </span>
              <button onClick={logout} className="flex items-center gap-2 text-slate-500 hover:text-danger transition-colors font-medium text-sm">
                <LogOut size={18} />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
            </>
          )}

          <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" title="Toggle Dark Mode">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Hamburger & Theme Toggle */}
        <div className="md:hidden flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 focus:outline-none" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <Link to="/" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-lg transition-colors font-medium ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <Activity className="w-5 h-5" /> Cashier Terminal
          </Link>
          <Link to="/staff" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-lg transition-colors font-medium ${isActive('/staff') ? 'bg-success/10 text-success' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <Activity className="w-5 h-5" /> Live Dispensary Board
          </Link>
          <Link to="/verify" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-lg transition-colors font-medium ${isActive('/verify') ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <ShieldCheck className="w-5 h-5" /> Security Scanner
          </Link>
          {user?.role === 'ADMIN' && (
            <Link to="/settings" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-lg transition-colors font-medium ${isActive('/settings') ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <ShieldCheck className="w-5 h-5" /> Admin Settings
            </Link>
          )}
          {token && (
            <button onClick={() => { logout(); closeMenu(); }} className="flex items-center gap-3 p-3 rounded-lg transition-colors font-medium text-slate-600 dark:text-slate-300 hover:text-danger hover:bg-slate-50 dark:hover:bg-slate-800 w-full text-left">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          )}
        </div>
      )}
    </nav>
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
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background dark:bg-slate-950 bg-dots-pattern relative flex flex-col overflow-hidden text-text dark:text-slate-200 transition-colors duration-500">
          
          {/* Premium Background Decorations (Dark Mode Only) */}
          <div className="hidden dark:block absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none z-0"></div>
          <div className="hidden dark:block absolute top-1/4 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 pointer-events-none z-0 animate-breathe"></div>
          <div className="hidden dark:block absolute bottom-1/4 right-0 w-[40rem] h-[40rem] bg-success/10 rounded-full blur-3xl translate-x-1/4 pointer-events-none z-0 animate-float"></div>

          <div className="w-full mx-auto flex flex-col flex-grow relative z-10">
            <Navigation theme={theme} toggleTheme={toggleTheme} />
            <main className="flex-grow relative">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/pay/:reference" element={<PatientInvoice />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/staff" element={<ProtectedRoute><StaffDashboard /></ProtectedRoute>} />
                <Route path="/verify" element={<ProtectedRoute><Verify /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
