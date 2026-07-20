import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Send, Download } from 'lucide-react';
import api from '../../lib/axios';
import PermissionGate from '../../components/PermissionGate';
import toast from 'react-hot-toast';

export default function ReceiptDetail() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfError, setPdfError] = useState(false);

  const fetchReceipt = async () => {
    try {
      const response = await api.get(`/receipts/id/${id}`);
      setReceipt(response.data.data || response.data.receipt || response.data);
    } catch (error) {
      console.error('Failed to load receipt:', error);
      toast.error('Failed to load receipt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  // The PDF is archived on Cloudinary, which blocks unauthenticated delivery of raw
  // PDF files by default. Fetching it through our authenticated API (as a blob) and
  // rendering it via an object URL avoids that restriction and avoids the blank
  // preview caused by loading the Cloudinary URL directly in an <iframe>.
  useEffect(() => {
    let objectUrl = null;
    const loadPdf = async () => {
      try {
        const response = await api.get(`/receipts/id/${id}/pdf`, { responseType: 'blob' });
        objectUrl = URL.createObjectURL(response.data);
        setPdfBlobUrl(objectUrl);
      } catch (error) {
        console.error('Failed to load receipt PDF:', error);
        setPdfError(true);
      }
    };
    loadPdf();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post(`/receipts/id/${id}/resend`);
      toast.success('Receipt queued for resending!');
    } catch (error) {
      console.error('Failed to resend receipt:', error);
      toast.error('Failed to resend receipt');
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-slate-500">Loading receipt...</p>
      </div>
    );
  }

  if (!receipt) return <div className="text-center py-12">Receipt not found</div>;

  return (
    <div className="w-[95%] lg:w-[80%] mx-auto px-4 py-8 max-w-none">
      <Link to="/receipts" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Receipts
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white break-words">Receipt {receipt.receiptNumber}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Issued on {new Date(receipt.issuedAt).toLocaleString()}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <a href={pdfBlobUrl || undefined} download={`${receipt.receiptNumber}.pdf`} target="_blank" rel="noreferrer" className="flex-1 md:flex-none justify-center px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Download size={16} /> Download
          </a>
          
          <PermissionGate permission="RECEIPTS_RESEND">
            <button onClick={handleResend} disabled={resending} className="flex-1 md:flex-none justify-center px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              {resending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} 
              Resend SMS/Email
            </button>
          </PermissionGate>
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-800 overflow-hidden h-[60vh] sm:h-[70vh] md:h-[800px] relative">
        {pdfBlobUrl ? (
          <iframe 
            src={`${pdfBlobUrl}#toolbar=0`} 
            className="w-full h-full border-0" 
            title="PDF Receipt"
          />
        ) : pdfError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <p>Unable to load the receipt preview.</p>
            <button onClick={() => window.location.reload()} className="text-primary text-sm font-medium">Try again</button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p>Loading preview...</p>
          </div>
        )}
      </div>
    </div>
  );
}
