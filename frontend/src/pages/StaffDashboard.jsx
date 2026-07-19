import { useState, useEffect } from 'react';
import { Activity, CheckCircle, Clock, User, Download, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StaffDashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { token } = useAuth();

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/billing/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/api/v1/ws/live-board`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'INVOICE_PAID') {
          setInvoices(prev => prev.map(inv => 
            inv.invoice_id === data.invoice_id ? { ...inv, status: 'PAID' } : inv
          ));
        } else if (data.type === 'NEW_INVOICE') {
          fetchInvoices(); // Refresh the list to grab the newly created invoice
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };
    
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("ping");
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, []);

  const handleExportCSV = () => {
    if (invoices.length === 0) return;
    
    const headers = ['Invoice ID', 'Patient Name', 'Amount (NGN)', 'Status', 'Date Created', 'Time'];
    const rows = invoices.map(inv => {
      const date = new Date(inv.created_at);
      return [
        inv.invoice_id.split('-')[0],
        `"${inv.patient_name}"`, // Quote in case of commas
        inv.amount,
        inv.status,
        date.toLocaleDateString(),
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `meditrust_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.invoice_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 pt-24 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Activity className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text">Live Dispensary Board</h1>
            <p className="text-muted">Real-time invoice tracking and pharmacy clearance</p>
          </div>
        </div>

        <button 
          onClick={handleExportCSV}
          disabled={invoices.length === 0}
          className="flex items-center gap-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 dark:border-slate-600 self-start md:self-auto"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="glass-panel p-6">
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              className="input-field pl-10" 
              placeholder="Search by patient name or invoice ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-slate-400" />
            </div>
            <select 
              className="input-field pl-10 bg-white dark:bg-slate-800 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Awaiting Payment</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-sm tracking-wider">
                <th className="pb-4 pr-4">Invoice ID</th>
                <th className="pb-4 px-4">Patient Name</th>
                <th className="pb-4 px-4 text-right">Amount (NGN)</th>
                <th className="pb-4 px-4">Time</th>
                <th className="pb-4 pl-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && invoices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted">Loading live feed...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted">No invoices found matching your criteria.</td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.invoice_id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors cursor-default">
                    <td className="py-4 pr-4 font-mono text-sm text-primary">{inv.invoice_id.split('-')[0]}...</td>
                    <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </div>
                        {inv.patient_name}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-text dark:text-slate-200 font-mono">
                      {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(inv.amount)}
                    </td>
                    <td className="py-4 px-4 text-muted dark:text-slate-400 text-sm">
                      {new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 pl-4 flex justify-center">
                      {inv.status === 'PAID' ? (
                        <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1 rounded-full text-sm font-semibold border border-success/20">
                          <CheckCircle className="w-4 h-4" /> PAID & CLEARED
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium border border-orange-500/30">
                          <Clock className="w-4 h-4 animate-pulse" /> AWAITING PAYMENT
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
