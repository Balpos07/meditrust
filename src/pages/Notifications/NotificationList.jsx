import React, { useState, useEffect } from 'react';
import { Bell, Loader2, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../lib/axios';

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications?limit=50');
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => (n._id || n.id) === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="w-[95%] lg:w-[80%] mx-auto px-4 py-8 max-w-none">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-3">
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

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-slate-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            You have no notifications.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((notification) => (
              <div 
                key={notification._id || notification.id} 
                className={`p-4 sm:p-6 transition-colors flex gap-4 ${!notification.isRead ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div className="pt-1 shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-semibold text-sm sm:text-base ${!notification.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-slate-400 shrink-0 ml-4">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm ${!notification.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="shrink-0 flex items-center">
                    <button 
                      onClick={() => markAsRead(notification._id || notification.id)}
                      className="w-2.5 h-2.5 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors"
                      title="Mark as read"
                    ></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
