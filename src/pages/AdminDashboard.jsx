import React, { useState, useEffect } from 'react';
import { Activity, Users, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react';
import api from '../lib/axios';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocket();

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/summary');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard stats', error);
      toast.error('Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleDashboardUpdate = (data) => {
      // Silently re-fetch when we get a dashboard.updated event
      console.log('Dashboard update received:', data);
      fetchStats();
    };

    socket.on('dashboard.updated', handleDashboardUpdate);

    return () => {
      socket.off('dashboard.updated', handleDashboardUpdate);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-[95%] lg:w-[80%] mx-auto px-4 py-8 max-w-none">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            Real-time hospital metrics
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-slate-400'}`}></span>
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Activity className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today's Revenue</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(stats?.revenueToday || 0)}
          </h3>
        </div>

        {/* Patients Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Patients</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats?.totalPatients || 0}
          </h3>
        </div>

        {/* Paid Invoices Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-success/10 rounded-xl">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Invoices Paid Today</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats?.paidInvoicesToday || 0}
          </h3>
        </div>

        {/* Pending Invoices Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Payments</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats?.pendingInvoices || 0}
          </h3>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
        <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">Welcome to MediTrust Admin</h2>
        <p className="text-slate-500 mt-2">Use the navigation menu to manage patients, billing, and system settings.</p>
      </div>
    </div>
  );
}
