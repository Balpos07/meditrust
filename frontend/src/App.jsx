import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import StaffDashboard from './pages/StaffDashboard';
import { Stethoscope, ShieldCheck, Activity } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-success/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Navigation Bar */}
        <nav className="relative z-20 border-b border-white/10 bg-card/50 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text font-bold text-xl">
              <Stethoscope className="text-primary w-6 h-6" />
              <span>MediTrust</span>
            </div>
            <div className="flex gap-6">
              <Link to="/" className="flex items-center gap-2 text-muted hover:text-primary transition-colors font-medium">
                <Activity className="w-4 h-4" /> Cashier
              </Link>
              <Link to="/staff" className="flex items-center gap-2 text-muted hover:text-success transition-colors font-medium">
                <Activity className="w-4 h-4" /> Live Board
              </Link>
              <Link to="/verify" className="flex items-center gap-2 text-muted hover:text-white transition-colors font-medium">
                <ShieldCheck className="w-4 h-4" /> Security Scanner
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/verify" element={<Verify />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
