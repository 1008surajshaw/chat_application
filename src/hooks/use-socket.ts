import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/providers/auth-provider';
import { debounce } from 'lodash';
import { useSocketContext } from '@/providers/socket-provider';

export const useSocket = (chatId: string | null) => {
  const { socket, isConnected } = useSocketContext();
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, string>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effect to join chat room when connection status changes or chatId changes
  useEffect(() => {
    if (!chatId || !isConnected || !socket || !user?.id) return;
    
    console.log(`Joining chat room: ${chatId}`);
    socket.emit('join-chat', chatId);
    
    // Emit that user is online
    socket.emit('user-online', user.id);
    
    // Clean up when component unmounts or chatId changes
    return () => {
      if (isConnected && socket) {
        console.log(`Leaving chat room: ${chatId}`);
        socket.emit('leave-chat', chatId);
      }
    };
  }, [chatId, isConnected, socket, user?.id]);
  
  // Listen for typing status changes
  useEffect(() => {
    if (!socket || !chatId) return;
    
    const handleTyping = ({ userId, isTyping }: { userId: string, isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (isTyping && !prev.includes(userId)) {
          return [...prev, userId];
        } else if (!isTyping) {
          return prev.filter(id => id !== userId);
        }
        return prev;
      });
    };
    
    socket.on('user-typing', handleTyping);
    
    return () => {
      socket.off('user-typing', handleTyping);
    };
  }, [socket, chatId]);
  
  // Listen for online/offline status changes
  useEffect(() => {
    if (!socket) return;
    
    const handleStatusChange = ({ userId, status }: { userId: string, status: string }) => {
      setOnlineUsers(prev => ({
        ...prev,
        [userId]: status
      }));
    };
    
    socket.on('user-status-change', handleStatusChange);
    
    return () => {
      socket.off('user-status-change', handleStatusChange);
    };
  }, [socket]);
  
  // Create debounced typing functions
  const debouncedStopTyping = useCallback(
    debounce((userId: string, chatId: string) => {
      if (socket && isConnected) {
        socket.emit('typing-stop', { userId, chatId });
      }
    }, 1000),
    [socket, isConnected]
  );
  
  // Function to handle typing indicator
  const handleTyping = useCallback((value: string) => {
    if (!socket || !isConnected || !chatId || !user?.id) return;
    
    // If user starts typing, emit typing-start
    if (value.length > 0) {
      socket.emit('typing-start', { userId: user.id, chatId });
      
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set a timeout to stop typing after 2 seconds of inactivity
      debouncedStopTyping(user.id, chatId);
    } else {
      // If input is empty, stop typing immediately
      socket.emit('typing-stop', { userId: user.id, chatId });
      debouncedStopTyping.cancel();
    }
  }, [socket, isConnected, chatId, user?.id, debouncedStopTyping]);
  
  // Function to send a message via socket
  const sendSocketMessage = useCallback((message: any) => {
    if (!socket || !isConnected || !chatId) {
      console.warn('Cannot send message: Socket not connected or no chatId');
      return false;
    }
    
    // Clear typing indicator when sending a message
    if (user?.id) {
      socket.emit('typing-stop', { userId: user.id, chatId });
      debouncedStopTyping.cancel();
    }
    
    console.log('Sending socket message:', message);
    socket.emit('send-message', {
      ...message,
      chatId,
      userId: user?.id,
    });
    
    return true;
  }, [socket, isConnected, chatId, user?.id, debouncedStopTyping]);
  
  return {
    socket,
    isConnected,
    sendSocketMessage,
    handleTyping,
    typingUsers,
    onlineUsers,
  };
};
