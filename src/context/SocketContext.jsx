import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect if we have a valid token and user
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Construct Socket.IO URL with proper protocol handling
    let socketUrl;
    if (import.meta.env.VITE_WS_URL) {
      // Use configured backend URL - ensure proper protocol
      socketUrl = import.meta.env.VITE_WS_URL.includes('http') 
        ? import.meta.env.VITE_WS_URL 
        : `https://${import.meta.env.VITE_WS_URL}`;
    } else {
      // Fallback to current domain
      socketUrl = window.location.origin;
    }

    const eventsUrl = `${socketUrl}/events`;
    console.log('🔌 Attempting Socket.IO connection to:', eventsUrl);

    const newSocket = io(eventsUrl, {
      auth: { token },
      // Start with polling — Vercel can proxy HTTP but not WebSocket upgrades.
      // Socket.IO will try to upgrade to WebSocket after the initial handshake.
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      setIsConnected(true);
      
      // Based on roles, join specific rooms.
      // Everyone who is logged in might join their own user room if needed,
      // but the README says hospital:global and department:reception.
      
      // Let's join rooms based on permissions or role.
      if (user.role?.name === 'ADMIN') {
        newSocket.emit('join_room', 'hospital:global');
      }
      
      // Join reception if they have invoice create permissions
      if (user.role?.permissions?.includes('INVOICES_CREATE') || user.role?.permissions?.includes('VIRTUAL_ACCOUNTS_GENERATE')) {
         newSocket.emit('join_room', 'department:reception');
      }

      // Add other rooms here as needed...
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('⚠️ Socket connection error:', err);
      console.log('Retrying with polling fallback...');
    });

    newSocket.on('error', (error) => {
      console.error('⚠️ Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
