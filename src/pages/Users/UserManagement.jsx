import React from 'react';
import { Users, Shield, Loader2 } from 'lucide-react';

export default function UserManagement() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" /> User Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage hospital staff roles and permissions.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
        <Shield className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Coming Soon</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          User management and role-based access control configuration UI will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
}
