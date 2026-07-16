import { useState, useEffect } from 'react';
import { Copy, CheckCircle, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [formData, setFormData] = useState({ full_name: '', phone_number: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  // Poll for payment status
  useEffect(() => {
    if (!invoice || paid) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/billing/invoice/${invoice.invoice_id}`);
        const data = await res.json();
        if (data.status === 'PAID') setPaid(true);
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [invoice, paid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/billing/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          amount: parseFloat(formData.amount)
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Unknown Server Error");
      }
      setInvoice(data);
      setPaid(false);
    } catch (err) {
      alert(`Failed to generate invoice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invoice.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
      <div className="glass-panel w-full max-w-md p-8 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">MediTrust</h1>
          <p className="text-muted mt-2">Generate instant invoice</p>
        </div>

        {!invoice ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Patient Name</label>
              <input type="text" required className="input-field" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
              <input type="tel" required className="input-field" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} placeholder="08012345678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Amount (NGN)</label>
              <input type="number" required min="100" step="0.01" className="input-field" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="5000" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-4 flex justify-center items-center h-12">
              {loading ? <Loader2 className="animate-spin" /> : "Generate Payment Account"}
            </button>
          </form>
        ) : (
          <div className="animate-in fade-in zoom-in duration-300">
            {paid ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-success mb-2">Payment Confirmed!</h2>
                <p className="text-slate-300">Receipt has been sent via SMS.</p>
                <button onClick={() => setInvoice(null)} className="btn-primary mt-8">Create New Invoice</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-muted text-sm uppercase tracking-wider mb-2">Transfer to</p>
                  <h3 className="text-xl font-medium text-white">{invoice.bank_name}</h3>
                  <div className="flex items-center justify-center gap-3 mt-3 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <span className="text-3xl font-bold font-mono tracking-widest">{invoice.account_number}</span>
                    <button onClick={copyToClipboard} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white" title="Copy Account">
                      {copied ? <CheckCircle className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-slate-400 mt-3">{invoice.account_name}</p>
                </div>
                
                <div className="border-t border-slate-700/50 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-muted">Amount Due</span>
                    <span className="text-2xl font-semibold text-white">NGN {invoice.amount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 text-slate-400 bg-slate-800/30 py-3 rounded-lg border border-slate-700/50">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span>Waiting for payment...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
