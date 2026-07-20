import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Loader2, ChevronLeft, ChevronRight, FileCheck } from 'lucide-react';
import api from '../../lib/axios';
import PermissionGate from '../../components/PermissionGate';

export default function ReceiptList() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });

  const fetchReceipts = async (currentPage) => {
    setLoading(true);
    try {
      const response = await api.get(`/receipts?page=${currentPage}&limit=20`);
      setReceipts(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Failed to fetch receipts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts(page);
  }, [page]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Receipts</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage issued payment receipts.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800">Receipt #</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800">Issue Date</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800">Status</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                    <p className="text-slate-500">Loading receipts...</p>
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    No receipts found.
                  </td>
                </tr>
              ) : (
                receipts.map(receipt => (
                  <tr key={receipt._id || receipt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center text-success">
                          <FileCheck size={16} />
                        </div>
                        <span className="font-mono font-medium text-slate-900 dark:text-slate-200">{receipt.receiptNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(receipt.issuedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-success bg-success/10 px-2 py-1 rounded-full text-xs font-bold border border-success/20">ISSUED</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/receipts/${receipt._id || receipt.id}`} className="text-primary hover:text-primary/80 font-medium text-sm">
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
        {!loading && receipts.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-white">{receipts.length}</span> of <span className="font-medium text-slate-900 dark:text-white">{meta.total}</span> receipts
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
