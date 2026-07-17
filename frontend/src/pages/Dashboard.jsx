import { useState, useEffect } from 'react';
import { Copy, CheckCircle, Loader2, Plus, Trash2, Radar, User, Phone, FileText } from 'lucide-react';

export default function Dashboard() {
  const [formData, setFormData] = useState({ full_name: '', phone_number: '' });
  const [items, setItems] = useState([{ description: 'Consultation Fee', amount: '5000' }]);
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

  const handleAddItem = () => {
    setItems([...items, { description: '', amount: '' }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

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
          items: items.map(item => ({
            description: item.description,
            amount: parseFloat(item.amount) || 0
          }))
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

  const resetForm = () => {
    setInvoice(null);
    setFormData({ full_name: '', phone_number: '' });
    setItems([{ description: 'Consultation Fee', amount: '5000' }]);
  }

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
      <div className="glass-panel w-full max-w-lg p-8 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text tracking-tight">Generate Invoice</h1>
          <p className="text-muted mt-2">Cashier Billing Terminal</p>
        </div>

        {!invoice ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" /> Patient Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input type="text" required className="input-field pl-12" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="John Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input type="tel" required className="input-field pl-12" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} placeholder="080 1234 5678" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Billing Items
                </h2>
                <button type="button" onClick={handleAddItem} className="text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 font-medium transition-colors">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
              
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start group">
                    <div className="flex-grow">
                      <input type="text" required className="input-field" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} placeholder="Description (e.g. Blood Test)" />
                    </div>
                    <div className="w-1/3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-400 font-medium">₦</span>
                        </div>
                        <input type="number" required min="0" step="0.01" className="input-field pl-10" value={item.amount} onChange={e => handleItemChange(idx, 'amount', e.target.value)} placeholder="0.00" />
                      </div>
                    </div>
                    {items.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItem(idx)} className="p-3 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors mt-0.5">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex justify-between items-center shadow-inner">
              <span className="text-lg font-medium text-slate-700">Total Amount Due</span>
              <span className="text-2xl font-bold text-primary">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totalAmount)}</span>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center h-14 text-lg mt-2 font-semibold">
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Generate Secure Invoice"}
            </button>
          </form>
        ) : (
          <div className="animate-in fade-in zoom-in duration-300">
            {paid ? (
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full animate-ping bg-success/10"></div>
                  <CheckCircle className="w-12 h-12 text-success relative z-10" />
                </div>
                <h2 className="text-3xl font-bold text-success mb-2">Payment Cleared!</h2>
                <p className="text-muted mb-8">Patient can proceed to pharmacy. Receipt sent via SMS.</p>
                <button onClick={resetForm} className="btn-primary w-full py-4 text-lg">Create New Invoice</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-muted text-sm uppercase tracking-wider mb-2">Transfer exactly <span className="text-text font-bold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(invoice.amount)}</span> to:</p>
                  <h3 className="text-xl font-medium text-text">{invoice.bank_name}</h3>
                  <div className="flex items-center justify-center gap-3 mt-3 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-4xl font-bold font-mono tracking-widest text-primary">{invoice.account_number}</span>
                    <button onClick={copyToClipboard} className="p-3 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 hover:text-text" title="Copy Account">
                      {copied ? <CheckCircle className="w-6 h-6 text-success" /> : <Copy className="w-6 h-6" />}
                    </button>
                  </div>
                  <p className="text-muted mt-3 font-medium">{invoice.account_name}</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mt-6">
                  <h4 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wider">Itemized Bill</h4>
                  <ul className="space-y-2">
                    {invoice.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm text-slate-600">
                        <span>{item.description}</span>
                        <span className="font-mono">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(item.amount)}</span>
                      </li>
                    ))}
                    <li className="flex justify-between text-text font-bold border-t border-slate-200 pt-2 mt-2">
                      <span>Total</span>
                      <span className="font-mono">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(invoice.amount)}</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 text-primary mt-8">
                  <Radar className="w-12 h-12 animate-spin-slow opacity-80" />
                  <span className="font-medium animate-pulse">Awaiting Bank Transfer Confirmation...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
