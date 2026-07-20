import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Stethoscope, CheckCircle, Clock, Copy, Building, ShieldCheck } from 'lucide-react';

export default function PatientInvoice() {
  const { reference } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/billing/invoice/public/${reference}`);
        if (!response.ok) {
          throw new Error('Invoice not found');
        }
        const data = await response.json();
        setInvoice(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoice();
    
    // Connect to WebSockets to listen for payment status
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/api/v1/ws/live-board`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'INVOICE_PAID' && invoice && data.invoice_id === invoice.payment_reference) {
          // The event payload might send invoice_id or payment_reference.
          // Wait, the backend sends the UUID. Let's just re-fetch the invoice if ANY payment goes through
          // just to be safe, or check if we can parse it.
          fetchInvoice();
        } else if (data.type === 'INVOICE_PAID') {
           // Safest bet for the public page: if there's any PAID event, just refetch to check if it's ours.
           fetchInvoice();
        }
      } catch (err) {}
    };
    
    return () => ws.close();
  }, [reference]);

  const copyToClipboard = () => {
    if (invoice?.account_number) {
      navigator.clipboard.writeText(invoice.account_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">Loading invoice details...</div>;
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
        <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Invoice Not Found</h1>
        <p className="text-slate-500 mt-2">The link may be invalid or expired.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/10 rounded-b-[50%] blur-3xl pointer-events-none"></div>

      <div className="max-w-md mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">MediTrust Hospital</h1>
          <p className="text-slate-500 mt-1">Hello, {invoice.patient_name}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          
          <div className="p-8 text-center border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-2 uppercase tracking-widest">Total Amount Due</p>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(invoice.amount)}
            </h2>
            
            <div className="mt-6 flex justify-center">
              {invoice.status === 'PAID' ? (
                <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-bold border border-success/20 animate-in zoom-in">
                  <CheckCircle className="w-5 h-5" /> PAYMENT SUCCESSFUL
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full text-sm font-bold border border-orange-500/20">
                  <Clock className="w-5 h-5 animate-pulse" /> AWAITING PAYMENT
                </div>
              )}
            </div>
          </div>

          {invoice.status !== 'PAID' && (
            <div className="p-8">
              <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
                Please transfer the exact amount to the account below. Your payment will be confirmed automatically.
              </p>
              
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Bank Name</span>
                    <Building className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{invoice.bank_name}</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 flex justify-between items-center group cursor-pointer hover:bg-primary/5 transition-colors" onClick={copyToClipboard}>
                  <div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Account Number</div>
                    <div className="font-mono text-2xl font-bold text-primary tracking-wider">{invoice.account_number}</div>
                  </div>
                  <div className={`p-3 rounded-xl transition-all ${copied ? 'bg-success/20 text-success' : 'bg-primary/10 text-primary group-hover:scale-110'}`}>
                    {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Account Name</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{invoice.account_name}</div>
                </div>
              </div>
            </div>
          )}

          {invoice.status === 'PAID' && (
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">You are cleared to go!</h3>
              <p className="text-slate-500">
                Your payment was received. Please present your reference number <span className="font-mono font-bold text-slate-700 dark:text-slate-300">({invoice.payment_reference})</span> at the pharmacy to collect your items.
              </p>
            </div>
          )}

        </div>
        
        <div className="text-center mt-8">
          <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">Secured by Monnify</p>
        </div>
      </div>
    </div>
  );
}
