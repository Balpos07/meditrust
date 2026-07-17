import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Search, Loader2, Camera, X } from 'lucide-react';
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
    <div className="container mx-auto px-4 py-12 flex justify-center items-start min-h-screen pt-24">
      <div className="glass-panel w-full max-w-md p-8 relative z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            Security Verifier
          </h1>
          <p className="text-muted text-sm mt-1">Scan Receipt QR to clear patient</p>
        </div>

        {!result && !isScanning && (
          <div className="space-y-6">
            <button 
              onClick={() => setIsScanning(true)} 
              className="w-full bg-primary/20 border border-primary/50 text-primary hover:bg-primary hover:text-white transition-colors py-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-lg"
            >
              <Camera className="w-6 h-6" /> Scan QR Code
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-muted text-sm uppercase">Or type manually</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Invoice ID</label>
                <input type="text" required className="input-field py-2" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Cryptographic Signature</label>
                <input type="text" required className="input-field py-2 font-mono text-xs" value={sig} onChange={e => setSig(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-800 hover:bg-slate-700 text-white transition-colors py-3 rounded-lg flex items-center justify-center font-medium mt-2">
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify Receipt"}
              </button>
            </form>
          </div>
        )}

        {isScanning && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium">Scanning...</h3>
              <button onClick={() => setIsScanning(false)} className="text-muted hover:text-white bg-white/5 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div id="reader" className="rounded-xl overflow-hidden border border-white/10"></div>
            <style>{`
              #reader video {
                border-radius: 0.75rem !important;
                object-fit: cover !important;
              }
              #reader__dashboard_section_csr span {
                color: #f8fafc !important;
              }
              #reader__dashboard_section_swaplink {
                color: #3b82f6 !important;
              }
              #reader__camera_selection {
                background: #1e293b !important;
                color: white !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
                padding: 0.5rem !important;
                border-radius: 0.5rem !important;
              }
            `}</style>
          </div>
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
            
            <button onClick={() => { setResult(null); setInvoiceId(''); setSig(''); }} className="w-full mt-6 text-sm text-slate-400 hover:text-white transition-colors">
              Verify another receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
