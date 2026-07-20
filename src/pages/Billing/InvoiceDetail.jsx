import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, FileText, CheckCircle, Radar, Building, Copy, ArrowLeft } from 'lucide-react';
import api from '../../lib/axios';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

export default function InvoiceDetail() {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { socket } = useSocket();

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/billing/invoices/${invoiceId}`);
      const fetchedInvoice = response.data.data;
      console.log('Fetched Invoice from backend:', fetchedInvoice);
      // The backend populates the linked virtual account under `virtualAccountId`
      // (the schema's ref field name), not `virtualAccount`. Normalize it here so the
      // UI shows already-generated accounts immediately instead of waiting forever
      // for a socket event that may have already fired before this page was open.
      setInvoice({
        ...fetchedInvoice,
        virtualAccount: fetchedInvoice.virtualAccountId || fetchedInvoice.virtualAccount || null,
      });
    } catch (error) {
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  useEffect(() => {
    if (!socket || !invoice) return;

    // Join the specific invoice room
    socket.emit('join_room', `invoice:${invoiceId}`, (response) => {
      console.log('Joined invoice room:', response);
    });

    const handleVirtualAccountCreated = (data) => {
      console.log('Socket event virtual_account.created:', data);
      const incomingId = data.invoiceId || data.id || data._id;
      if (String(incomingId) === String(invoiceId)) {
        // Handle case where virtualAccount is nested or is the root object
        const vaData = data.virtualAccount ? data.virtualAccount : data;
        setInvoice(prev => ({ ...prev, virtualAccount: vaData }));
        toast.success('Payment accounts generated!');
      }
    };

    const handlePaymentCompleted = (data) => {
      console.log('Socket event payment.completed:', data);
      const incomingId = data.invoiceId || data.id || data._id;
      if (String(incomingId) === String(invoiceId)) {
        setInvoice(prev => ({ ...prev, status: 'PAID' }));
        toast.success('Payment received successfully!', { duration: 5000, icon: '🎉' });
      }
    };

    socket.on('virtual_account.created', handleVirtualAccountCreated);
    socket.on('payment.completed', handlePaymentCompleted);

    return () => {
      socket.off('virtual_account.created', handleVirtualAccountCreated);
      socket.off('payment.completed', handlePaymentCompleted);
    };
  }, [socket, invoiceId, invoice]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-slate-500">Loading invoice details...</p>
      </div>
    );
  }

  if (!invoice) return <div className="text-center py-12">Invoice not found</div>;

  return (
    <div className="w-[95%] lg:w-[80%] mx-auto px-4 py-8 max-w-none">
      <Link to="/billing" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Invoices
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Invoice Detail</h1>
            {invoice.status === 'PAID' && <span className="text-success bg-success/10 px-3 py-1 rounded-full text-sm font-bold border border-success/20 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> PAID</span>}
            {invoice.status === 'PENDING_PAYMENT' && <span className="text-yellow-600 bg-yellow-500/10 px-3 py-1 rounded-full text-sm font-bold border border-yellow-500/20">PENDING</span>}
            {invoice.status === 'CANCELLED' && <span className="text-danger bg-danger/10 px-3 py-1 rounded-full text-sm font-bold border border-danger/20">CANCELLED</span>}
          </div>
          <p className="font-mono text-slate-500 dark:text-slate-400">{invoice.invoiceNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Col: Invoice Summary */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <FileText className="w-5 h-5 text-primary" /> Invoice Summary
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left mb-4">
                <thead className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="pb-3">Description</th>
                    <th className="pb-3 text-right">Qty</th>
                    <th className="pb-3 text-right">Price</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 text-sm text-slate-700 dark:text-slate-300">
                        {item.description}
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{item.serviceCode}</div>
                      </td>
                      <td className="py-3 text-sm text-slate-600 dark:text-slate-400 text-right">{item.quantity}</td>
                      <td className="py-3 text-sm font-mono text-slate-600 dark:text-slate-400 text-right">
                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(item.unitPrice)}
                      </td>
                      <td className="py-3 text-sm font-mono text-slate-800 dark:text-slate-200 text-right font-medium">
                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(invoice.subTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-bold text-lg pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Total Due</span>
                  <span className="font-mono text-primary">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(invoice.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Payment / Status */}
        <div className="lg:col-span-2">
          {invoice.status === 'PAID' ? (
            <div className="bg-success/5 border border-success/20 rounded-2xl p-8 text-center animate-in zoom-in">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <CheckCircle className="w-10 h-10 text-success relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-success mb-2">Payment Cleared!</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">The automated receipt has been generated.</p>
              <Link to="/receipts" className="btn-primary w-full block">View Receipts</Link>
            </div>
          ) : invoice.status === 'PENDING_PAYMENT' ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4">Payment Collection</h3>
              
              {!invoice.virtualAccount ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <Loader2 className="w-8 h-8 text-primary relative z-10 animate-spin" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">Generating Accounts...</p>
                    <p className="text-xs text-slate-500 mt-1">Contacting Monnify</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-center mb-6">
                    <p className="text-sm text-primary font-medium mb-1">Amount to Pay</p>
                    <p className="text-2xl font-mono font-bold text-primary">
                      {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(invoice.grandTotal)}
                    </p>
                  </div>

                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Patient can transfer to any of these accounts:</p>
                  
                  <div className="space-y-3">
                    {invoice.virtualAccount.accounts.map((acc, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex justify-between items-center group">
                        <div>
                          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                            <Building className="w-3 h-3" /> {acc.bankName}
                          </div>
                          <div className="font-mono text-xl font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                            {acc.accountNumber}
                          </div>
                        </div>
                        <button onClick={() => copyToClipboard(acc.accountNumber)} className="p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-primary/10 hover:text-primary hover:border-primary/30 rounded-lg transition-all text-slate-500 shadow-sm" title="Copy Account">
                          {copied ? <CheckCircle className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
                    <Radar className="w-6 h-6 text-primary animate-spin-slow" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Listening for bank transfer...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 text-center text-slate-500">
              Invoice is {invoice.status.toLowerCase()}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
