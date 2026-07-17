import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import StaffDashboard from './pages/StaffDashboard';
import { Stethoscope, ShieldCheck, Activity, Menu, X } from 'lucide-react';

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
      <div className="w-full mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-2xl">
          <Stethoscope className="text-primary w-7 h-7" />
          <span>MediTrust</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8">
          <Link to="/" className={`flex items-center gap-2 transition-colors font-medium ${isActive('/') ? 'text-primary' : 'text-slate-500 hover:text-slate-800'}`}>
             Cashier
          </Link>
          <Link to="/staff" className={`flex items-center gap-2 transition-colors font-medium ${isActive('/staff') ? 'text-success' : 'text-slate-500 hover:text-slate-800'}`}>
            Live Board
          </Link>
          <Link to="/verify" className={`flex items-center gap-2 transition-colors font-medium ${isActive('/verify') ? 'text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>
             Security Scanner
          </Link>
        </div>

        {/* Mobile Hamburger Icon */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <Link to="/" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-lg transition-colors font-medium ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Activity className="w-5 h-5" /> Cashier Terminal
          </Link>
          <Link to="/staff" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-lg transition-colors font-medium ${isActive('/staff') ? 'bg-success/10 text-success' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Activity className="w-5 h-5" /> Live Dispensary Board
          </Link>
          <Link to="/verify" onClick={closeMenu} className={`flex items-center gap-3 p-3 rounded-lg transition-colors font-medium ${isActive('/verify') ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}>
            <ShieldCheck className="w-5 h-5" /> Security Scanner
          </Link>
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background bg-dots-pattern relative flex flex-col overflow-hidden">
        
        {/* Premium Background Decorations */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0"></div>
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 pointer-events-none z-0"></div>
        <div className="absolute bottom-1/4 right-0 w-[40rem] h-[40rem] bg-success/5 rounded-full blur-3xl translate-x-1/4 pointer-events-none z-0"></div>

        <div className="w-full mx-auto flex flex-col flex-grow relative z-10">
          <Navigation />
          <main className="flex-grow relative">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/staff" element={<StaffDashboard />} />
              <Route path="/verify" element={<Verify />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
