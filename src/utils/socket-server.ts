import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { createServer } from 'http';

// Global variable to store the Socket.IO server instance
let io: SocketIOServer | null = null;
// Track online users and typing status
const onlineUsers = new Map<string, string>(); // userId -> socketId
const typingUsers = new Map<string, {chatId: string, timestamp: number}>(); // userId -> {chatId, timestamp}

export const initSocketServer = () => {
  if (!io) {
    console.log('Initializing Socket.IO server...');
    
    const httpServer = createServer();
    
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*', // More permissive for development
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    
    const PORT = parseInt(process.env.PORT || '3001', 10);
    httpServer.listen(PORT, () => {
      console.log(`Socket.IO server running on port ${PORT}`);
    });
    
    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      
      // User comes online
      socket.on('user-online', (userId: string) => {
        if (userId) {
          onlineUsers.set(userId, socket.id);
          // Broadcast to all clients that this user is online
          io?.emit('user-status-change', { userId, status: 'online' });
          console.log(`User ${userId} is online`);
        }
      });
      
      // Join a chat room
      socket.on('join-chat', (chatId: string) => {
        socket.join(chatId);
        console.log(`Socket ${socket.id} joined chat: ${chatId}`);
      });
      
      // Leave a chat room
      socket.on('leave-chat', (chatId: string) => {
        socket.leave(chatId);
        console.log(`Socket ${socket.id} left chat: ${chatId}`);
      });
      
      // Handle typing status
      socket.on('typing-start', ({ userId, chatId }) => {
        if (userId && chatId) {
          typingUsers.set(userId, { chatId, timestamp: Date.now() });
          // Broadcast to chat room that user is typing
          socket.to(chatId).emit('user-typing', { userId, isTyping: true });
          console.log(`User ${userId} started typing in chat ${chatId}`);
        }
      });
      
      socket.on('typing-stop', ({ userId, chatId }) => {
        if (userId && chatId) {
          typingUsers.delete(userId);
          // Broadcast to chat room that user stopped typing
          socket.to(chatId).emit('user-typing', { userId, isTyping: false });
          console.log(`User ${userId} stopped typing in chat ${chatId}`);
        }
      });
      
      // Handle new messages
      socket.on('send-message', async (messageData) => {
        try {
          const { chatId, content, userId } = messageData;
          
          console.log(`New message in chat ${chatId} from user ${userId}: ${content}`);
          
          // Broadcast the message to all clients in the chat room
          io?.to(chatId).emit('new-message', {
            chatId,
            message: messageData
          });
        } catch (error) {
          console.error('Error handling new message:', error);
        }
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        
        // Find the user ID associated with this socket
        let disconnectedUserId: string | undefined;
        for (const [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            disconnectedUserId = userId;
            break;
          }
        }
        
        // Remove user from online users and clear typing status
        if (disconnectedUserId) {
          onlineUsers.delete(disconnectedUserId);
          typingUsers.delete(disconnectedUserId);
          
          // Broadcast to all clients that this user is offline
          io?.emit('user-status-change', { userId: disconnectedUserId, status: 'offline' });
          console.log(`User ${disconnectedUserId} is offline`);
        }
      });
    });
    
    // Clean up typing indicators that are older than 5 seconds
    setInterval(() => {
      const now = Date.now();
      for (const [userId, { chatId, timestamp }] of typingUsers.entries()) {
        if (now - timestamp > 5000) {
          typingUsers.delete(userId);
          io?.to(chatId).emit('user-typing', { userId, isTyping: false });
        }
      }
    }, 5000);
  }
  
  return io;
};

// Function to get the Socket.IO server instance
export const getIO = () => io;

