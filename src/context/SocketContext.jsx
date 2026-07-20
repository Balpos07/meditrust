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

    const socketUrl = import.meta.env.VITE_WS_URL 
      ? `${import.meta.env.VITE_WS_URL}/events` 
      : '/events';

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
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
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
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
