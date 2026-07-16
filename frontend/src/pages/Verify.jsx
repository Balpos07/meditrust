import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Search, Loader2 } from 'lucide-react';

export default function Verify() {
  const [searchParams] = useSearchParams();
  const initialInvoiceId = searchParams.get('invoice_id') || '';
  const initialSig = searchParams.get('sig') || '';

  const [invoiceId, setInvoiceId] = useState(initialInvoiceId);
  const [sig, setSig] = useState(initialSig);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialInvoiceId && initialSig) {
      handleVerify(initialInvoiceId, initialSig);
    }
  }, [initialInvoiceId, initialSig]);

  const handleVerify = async (inv, signature) => {
    if (!inv || !signature) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/billing/verify?invoice_id=${inv}&sig=${signature}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ is_valid: false });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleVerify(invoiceId, sig);
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-start min-h-screen pt-20">
      <div className="glass-panel w-full max-w-md p-6 relative z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            Security Verifier
          </h1>
          <p className="text-muted text-sm mt-1">Validate Meditrust Receipts</p>
        </div>

        {!result && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Invoice ID</label>
              <input type="text" required className="input-field py-2" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Cryptographic Signature</label>
              <input type="text" required className="input-field py-2 font-mono text-xs" value={sig} onChange={e => setSig(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-2 flex justify-center items-center h-10">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify Receipt"}
            </button>
          </form>
        )}

        {result && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            {result.is_valid ? (
              <div className="bg-success/10 border border-success/30 rounded-xl p-6 text-center shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                <ShieldCheck className="w-16 h-16 text-success mx-auto mb-4 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <h2 className="text-2xl font-bold text-success mb-1 tracking-wide">VERIFIED</h2>
                <p className="text-success/80 text-sm font-medium mb-6">Cryptographic Signature Valid</p>
                
                <div className="space-y-3 text-left bg-black/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-sm">Patient</span>
                    <span className="text-white font-medium">{result.patient_name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-sm">Amount Paid</span>
                    <span className="text-white font-bold">NGN {result.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Status</span>
                    <span className="text-success font-semibold">{result.status}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-danger/10 border border-danger/30 rounded-xl p-6 text-center shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                <ShieldAlert className="w-16 h-16 text-danger mx-auto mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <h2 className="text-2xl font-bold text-danger mb-2 tracking-wide">INVALID</h2>
                <p className="text-danger/80 font-medium">Potential Fraud Detected</p>
                <p className="text-slate-400 text-sm mt-4">The cryptographic signature does not match the invoice record or the invoice does not exist.</p>
              </div>
            )}
            
            <button onClick={() => setResult(null)} className="w-full mt-6 text-sm text-slate-400 hover:text-white transition-colors">
              Verify another receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
