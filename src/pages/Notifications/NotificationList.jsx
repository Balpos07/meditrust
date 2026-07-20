import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Loader2, Info, CheckCircle, AlertTriangle, XCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import { useNotifications } from '../../context/NotificationsContext';
import toast from 'react-hot-toast';

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'UNREAD', label: 'Unread' },
  { key: 'READ', label: 'Read' },
];

const TYPES = [
  { key: 'ALL', label: 'All Types' },
  { key: 'INFO', label: 'Info' },
  { key: 'SUCCESS', label: 'Success' },
  { key: 'WARNING', label: 'Warning' },
  { key: 'ERROR', label: 'Error' },
];

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
  const notificationsCtx = useNotifications();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filter === 'UNREAD') params.set('isRead', 'false');
      if (filter === 'READ') params.set('isRead', 'true');
      if (typeFilter !== 'ALL') params.set('type', typeFilter);

      const response = await api.get(`/notifications?${params.toString()}`);
      setNotifications(response.data.data || []);
      setMeta(response.data.meta || { totalPages: 1, total: 0 });
    } catch (error) {
      console.error('Failed to load notifications', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page, filter, typeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => (n._id || n.id) === id ? { ...n, isRead: true } : n));
      notificationsCtx?.refreshUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      notificationsCtx?.refreshUnreadCount();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => (n._id || n.id) !== id));
      notificationsCtx?.refreshUnreadCount();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification', error);
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'ERROR': return <XCircle className="w-5 h-5 text-danger" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="w-[95%] lg:w-[80%] mx-auto px-4 py-8 max-w-none">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Bell className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0" /> Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">System alerts and payment updates</p>
        </div>
        
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllAsRead} className="text-sm font-medium text-primary hover:underline self-start sm:self-auto">
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === f.key ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="bg-slate-100 dark:bg-slate-800/50 border-0 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {TYPES.map(t => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-slate-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            You have no notifications{filter !== 'ALL' ? ' matching this filter' : ''}.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((notification) => (
              <div 
                key={notification._id || notification.id} 
                className={`p-4 sm:p-6 transition-colors flex gap-3 sm:gap-4 group ${!notification.isRead ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div className="pt-1 shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start gap-3 mb-1">
                    <h4 className={`font-semibold text-sm sm:text-base ${!notification.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-slate-400 shrink-0">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm ${!notification.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    {notification.message}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {!notification.isRead && (
                    <button 
                      onClick={() => markAsRead(notification._id || notification.id)}
                      className="w-2.5 h-2.5 rounded-full bg-primary hover:bg-primary/80 transition-colors"
                      title="Mark as read"
                    ></button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id || notification.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && notifications.length > 0 && meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Page <span className="font-medium text-slate-900 dark:text-white">{page}</span> of <span className="font-medium text-slate-900 dark:text-white">{meta.totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
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
