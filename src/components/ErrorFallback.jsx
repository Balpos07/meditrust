import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          An unexpected error occurred. Our team has been notified.
        </p>

        <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-lg text-left overflow-x-auto mb-8 border border-slate-200 dark:border-slate-800">
          <code className="text-sm text-danger whitespace-pre-wrap break-words">
            {error.message}
          </code>
        </div>

        <button 
          onClick={resetErrorBoundary}
          className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-sky-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm focus-visible:ring-4 focus-visible:ring-primary/50 focus-visible:outline-none"
        >
          <RefreshCcw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    </div>
  );
}
