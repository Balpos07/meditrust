import React, { useState, useEffect } from 'react';
import { Activity, Users, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react';
import api from '../lib/axios';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Mon', revenue: 400000, patients: 24 },
  { name: 'Tue', revenue: 300000, patients: 18 },
  { name: 'Wed', revenue: 550000, patients: 35 },
  { name: 'Thu', revenue: 450000, patients: 28 },
  { name: 'Fri', revenue: 600000, patients: 42 },
  { name: 'Sat', revenue: 350000, patients: 20 },
  { name: 'Sun', revenue: 500000, patients: 30 },
];

const mockRecentActivity = [
  { id: 1, action: 'Invoice Paid', detail: '#INV-8923 - ₦45,000', time: '5 mins ago', type: 'success' },
  { id: 2, action: 'New Patient', detail: 'John Doe admitted', time: '12 mins ago', type: 'info' },
  { id: 3, action: 'Receipt Verified', detail: 'By external auditor', time: '1 hour ago', type: 'warning' },
  { id: 4, action: 'Invoice Generated', detail: '#INV-8924 - ₦120,000', time: '2 hours ago', type: 'default' },
  { id: 5, action: 'System Backup', detail: 'Blockchain sync completed', time: '5 hours ago', type: 'success' },
];

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Revenue Trend (7 Days)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(value) => `₦${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#0ea5e9' }}
                  formatter={(value) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4 items-start">
                <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-success' : 
                  activity.type === 'warning' ? 'bg-amber-500' : 
                  activity.type === 'info' ? 'bg-primary' : 'bg-slate-400'
                }`}></div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activity.action}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.detail}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-primary hover:text-sky-600 transition-colors bg-primary/5 hover:bg-primary/10 rounded-lg">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
