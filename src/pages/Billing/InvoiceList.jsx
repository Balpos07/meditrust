import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Loader2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import api from '../../lib/axios';
import PermissionGate from '../../components/PermissionGate';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });

  const fetchInvoices = async (currentPage) => {
    setLoading(true);
    try {
      const response = await api.get(`/billing/invoices?page=${currentPage}&limit=20`);
      setInvoices(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Failed to fetch invoices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(page);
  }, [page]);

  return (
    <div className="w-[95%] lg:w-[80%] mx-auto px-4 py-8 max-w-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Billing & Invoices</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage hospital billing and track payments.</p>
        </div>
        
        <PermissionGate permission="INVOICES_CREATE">
          <Link to="/billing/new" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Create Invoice
          </Link>
        </PermissionGate>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800">Invoice #</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800">Patient</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800">Amount</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800">Status</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                    <p className="text-slate-500">Loading invoices...</p>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map(invoice => (
                  <tr key={invoice._id || invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-medium text-slate-900 dark:text-slate-200">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {invoice.patientId ? "Linked Patient" : "Unknown"} {/* In a real app, backend returns patient details embedded or we show ID */}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-600 dark:text-slate-300">
                      {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(invoice.grandTotal)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {invoice.status === 'PAID' && <span className="text-success bg-success/10 px-2 py-1 rounded-full text-xs font-bold">PAID</span>}
                      {invoice.status === 'PENDING_PAYMENT' && <span className="text-yellow-600 bg-yellow-500/10 px-2 py-1 rounded-full text-xs font-bold">PENDING</span>}
                      {invoice.status === 'PARTIALLY_PAID' && <span className="text-orange-600 bg-orange-500/10 px-2 py-1 rounded-full text-xs font-bold">PARTIAL</span>}
                      {invoice.status === 'CANCELLED' && <span className="text-danger bg-danger/10 px-2 py-1 rounded-full text-xs font-bold">CANCELLED</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/billing/${invoice._id || invoice.id}`} className="text-primary hover:text-primary/80 font-medium text-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && invoices.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-white">{invoices.length}</span> of <span className="font-medium text-slate-900 dark:text-white">{meta.total}</span> invoices
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">
                Page {page} of {meta.totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
