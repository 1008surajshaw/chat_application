'use client';
import { FC, ReactNode, useEffect } from 'react';
import AuthProvider from './auth-provider';
import { ThemeProvider } from './theme-provider';
import { Toaster } from '@/components/ui/sonner';
import SocketProvider from './socket-provider';

const Provider: FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize socket server on client-side
  useEffect(() => {
    fetch('/api/socket')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('Socket server initialized');
        } else {
          console.error('Failed to initialize socket server');
        }
      })
      .catch(err => {
        console.error('Error initializing socket server:', err);
      });
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SocketProvider>
          <Toaster />
          {children}
        </SocketProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default Provider;
