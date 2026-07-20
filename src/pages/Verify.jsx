import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Loader2, Camera, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../lib/axios';

export default function Verify() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tokenParam) {
      handleVerify(tokenParam);
    }
  }, [tokenParam]);

  useEffect(() => {
    let scanner = null;
    if (isScanning) {
      scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      }, false);
      scanner.render(
        (decodedText) => {
          // Expected format: https://domain.com/verify?token=XXX
          try {
            scanner.clear();
            setIsScanning(false);
            const url = new URL(decodedText);
            const token = url.searchParams.get('token');
            if (token) {
              handleVerify(token);
            } else {
              setError("Invalid QR Code: Missing token parameter.");
            }
          } catch (e) {
            scanner.clear();
            setIsScanning(false);
            setError("Invalid QR Code format.");
          }
        },
        (err) => {
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

  const handleVerify = async (token) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // Endpoint is NO AUTH REQUIRED
      const res = await api.post('/verification/verify', { token }, {
        // Overriding the interceptor by not passing authorization header is handled 
        // by the backend which ignores missing tokens on public routes,
        // but we can also just use standard axios config if needed.
      });
      // The API response is wrapped as { success, data: { status, message, receiptDetails } }
      // by the global TransformResponseInterceptor — the actual receipt fields live under
      // `data.receiptDetails`, not directly on `data`.
      setResult({ isValid: true, data: res.data.data.receiptDetails });
    } catch (err) {
      setResult({ isValid: false, message: err.response?.data?.message || 'Verification failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[95%] lg:w-[80%] mx-auto  max-w-nonepx-4 py-12 flex justify-center items-start min-h-screen pt-12 md:pt-24 bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-8 md:p-10 relative z-10 shadow-lg transition-all duration-500">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Receipt Verification
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Automated cryptographic clearance checker
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-slate-500 font-medium tracking-wide animate-pulse">Verifying cryptographic signature...</p>
          </div>
        ) : !result && !isScanning ? (
          <div className="space-y-6">
            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-center text-sm font-medium">
                {error}
              </div>
            )}
            <button 
              onClick={() => setIsScanning(true)} 
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors py-8 rounded-2xl flex flex-col items-center justify-center gap-3 font-semibold shadow-sm"
            >
              <Camera className="w-10 h-10 text-slate-400 mb-2 group-hover:text-primary transition-colors" /> 
              Tap to Scan Physical Receipt
            </button>
            <p className="text-center text-xs text-slate-400">
              Patients can also scan the QR code using their mobile phone camera to verify themselves.
            </p>
          </div>
        ) : isScanning ? (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Scanning...</h3>
              <button onClick={() => setIsScanning(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div id="reader" className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black"></div>
            <style>{`
              #reader video {
                border-radius: 0.75rem !important;
                object-fit: cover !important;
              }
              #reader__dashboard_section_csr span { color: #1e293b !important; }
              #reader__camera_selection {
                background: white !important;
                color: #1e293b !important;
                border: 1px solid #e2e8f0 !important;
                padding: 0.5rem !important;
                border-radius: 0.5rem !important;
              }
            `}</style>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            {result.isValid ? (
              <div className="bg-success/5 border border-success/20 rounded-2xl p-6 text-center">
                <ShieldCheck className="w-20 h-20 text-success mx-auto mb-4 drop-shadow-md" />
                <h2 className="text-3xl font-bold text-success mb-1 tracking-wide">CLEARED</h2>
                <p className="text-success/80 text-sm font-bold tracking-widest uppercase mb-6">Authentic Receipt</p>
                
                <div className="space-y-4 text-left bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-xl shadow-sm mt-6">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Receipt Number</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono font-bold">{result.data.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Patient ID</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono text-sm">{result.data.patientId}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Amount Paid</span>
                    <span className="text-slate-900 dark:text-white font-bold font-mono text-lg">
                      {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(result.data.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Issued</span>
                    <span className="text-slate-800 dark:text-slate-200 text-sm">
                      {new Date(result.data.issuedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Clearance Status</span>
                    <span className="text-success font-bold bg-success/10 px-3 py-1 rounded-full text-xs tracking-wider uppercase">PAID & CLEARED</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-danger/5 border border-danger/20 rounded-2xl p-6 text-center">
                <ShieldAlert className="w-20 h-20 text-danger mx-auto mb-4 drop-shadow-md" />
                <h2 className="text-3xl font-bold text-danger mb-2 tracking-wide">INVALID</h2>
                <p className="text-danger/80 font-bold uppercase tracking-widest">Fraud Alert</p>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl mt-6">
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{result.message}</p>
                </div>
              </div>
            )}
            
            <button onClick={() => { setResult(null); setError(null); }} className="w-full mt-6 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Scan another receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
