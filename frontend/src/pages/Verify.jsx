import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Search, Loader2, Camera, X, Hash, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function Verify() {
  const [searchParams] = useSearchParams();
  const initialInvoiceId = searchParams.get('invoice_id') || '';
  const initialSig = searchParams.get('sig') || '';

  const [invoiceId, setInvoiceId] = useState(initialInvoiceId);
  const [sig, setSig] = useState(initialSig);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (initialInvoiceId && initialSig) {
      handleVerify(initialInvoiceId, initialSig);
    }
  }, [initialInvoiceId, initialSig]);

  useEffect(() => {
    let scanner = null;
    if (isScanning) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(
        (decodedText) => {
          // Expected format: http://localhost:5173/verify?invoice_id=XXX&sig=YYY
          try {
            scanner.clear();
            setIsScanning(false);
            const url = new URL(decodedText);
            const invId = url.searchParams.get('invoice_id');
            const signature = url.searchParams.get('sig');
            if (invId && signature) {
              setInvoiceId(invId);
              setSig(signature);
              handleVerify(invId, signature);
            } else {
              alert("Invalid QR Code format.");
            }
          } catch (e) {
            scanner.clear();
            setIsScanning(false);
            alert("Invalid QR Code URL.");
          }
        },
        (error) => {
          // ignore scan failures
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [isScanning]);

  const handleVerify = async (inv, signature) => {
    if (!inv || !signature) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/billing/verify?invoice_id=${inv}&sig=${signature}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
    <div className="container mx-auto px-4 py-12 flex justify-center items-start min-h-screen pt-12 md:pt-24">
      <div className="glass-panel w-full max-w-lg p-8 md:p-10 relative z-10 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-2xl transition-all duration-500">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text dark:text-white flex items-center justify-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            Security Verifier
          </h1>
          <p className="text-muted dark:text-slate-400 text-sm mt-1">Scan Receipt QR to clear patient</p>
        </div>

        {!result && !isScanning && (
          <div className="space-y-8">
            <button 
              onClick={() => setIsScanning(true)} 
              className="w-full bg-white dark:bg-slate-900 border-2 border-primary/20 dark:border-primary/50 text-primary hover:bg-primary hover:text-white transition-colors py-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-lg shadow-sm"
            >
              <Camera className="w-6 h-6" /> Scan QR Code
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-muted dark:text-slate-500 text-sm uppercase">Or type manually</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Invoice ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" required className="input-field pl-11 py-3" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} placeholder="e.g. inv-xyz..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cryptographic Signature</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" required className="input-field pl-11 py-3 font-mono text-sm" value={sig} onChange={e => setSig(e.target.value)} placeholder="e.g. 0xabc123..." />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center h-12 text-base font-semibold mt-4">
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify Receipt"}
              </button>
            </form>
          </div>
        )}

        {isScanning && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-text font-medium">Scanning...</h3>
              <button onClick={() => setIsScanning(false)} className="text-muted hover:text-text bg-slate-100 hover:bg-slate-200 transition-colors p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div id="reader" className="rounded-xl overflow-hidden border border-slate-200"></div>
            <style>{`
              #reader video {
                border-radius: 0.75rem !important;
                object-fit: cover !important;
              }
              #reader__dashboard_section_csr span {
                color: #1e293b !important;
              }
              #reader__dashboard_section_swaplink {
                color: #0ea5e9 !important;
              }
              #reader__camera_selection {
                background: white !important;
                color: #1e293b !important;
                border: 1px solid #e2e8f0 !important;
                padding: 0.5rem !important;
                border-radius: 0.5rem !important;
              }
            `}</style>
          </div>
        )}

        {result && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            {result.is_valid ? (
              <div className="bg-success/10 border border-success/30 dark:border-success/50 rounded-xl p-6 text-center">
                <ShieldCheck className="w-16 h-16 text-success mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-success mb-1 tracking-wide">VERIFIED</h2>
                <p className="text-success/80 text-sm font-medium mb-6">Cryptographic Signature Valid</p>
                
                <div className="space-y-4 text-left bg-white dark:bg-slate-900 border border-success/20 dark:border-success/40 p-5 rounded-xl shadow-sm mt-6">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Patient Name</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{result.patient_name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Amount Paid</span>
                    <span className="text-slate-900 dark:text-white font-bold font-mono text-lg">NGN {result.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Clearance Status</span>
                    <span className="text-success font-bold bg-success/10 dark:bg-success/20 px-3 py-1 rounded-full text-xs tracking-wider uppercase">{result.status}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-danger/10 border border-danger/30 dark:border-danger/50 rounded-xl p-6 text-center">
                <ShieldAlert className="w-16 h-16 text-danger mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-danger mb-2 tracking-wide">INVALID</h2>
                <p className="text-danger/80 font-medium">Potential Fraud Detected</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-4">The cryptographic signature does not match the invoice record or the invoice does not exist.</p>
              </div>
            )}
            
            <button onClick={() => { setResult(null); setInvoiceId(''); setSig(''); }} className="w-full mt-6 text-sm text-slate-500 hover:text-text transition-colors">
              Verify another receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
