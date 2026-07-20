import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const { token } = useAuth();
  const { socket } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.data?.count || 0);
    } catch (error) {
      console.error('Failed to load unread notification count', error);
    }
  }, [token]);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!socket) return;

    const handleNotificationCreated = () => {
      // Re-fetch rather than manually incrementing to avoid drift between tabs/sessions.
      refreshUnreadCount();
    };

    socket.on('notification.created', handleNotificationCreated);
    return () => {
      socket.off('notification.created', handleNotificationCreated);
    };
  }, [socket, refreshUnreadCount]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
