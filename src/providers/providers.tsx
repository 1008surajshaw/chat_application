'use client';
import { FC, ReactNode } from 'react';
import AuthProvider from './auth-provider';
import { ThemeProvider } from './theme-provider';
import { Toaster } from '@/components/ui/sonner';
import SocketProvider from './socket-provider';

const Provider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SocketProvider>
          <Toaster 
            position="top-center" 
            duration={3000} 
            closeButton 
            richColors 
          />
          {children}
        </SocketProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default Provider;
