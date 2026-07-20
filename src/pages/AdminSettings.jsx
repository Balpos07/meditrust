import React from 'react';
import { Settings, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminSettings() {
  const { user } = useAuth();
  
  if (user?.role?.name !== 'ADMIN') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="w-16 h-16 text-danger mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Access Denied</h2>
          <p className="text-slate-500 mt-2">You must be an Administrator to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" /> Admin Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure global hospital system settings.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-4">System Configuration</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Global settings (like default Monnify payment methods, hospital name, and contact details) will be configurable here.
        </p>
      </div>
    </div>
  );
}
