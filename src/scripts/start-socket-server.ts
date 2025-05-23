import { initSocketServer } from '../utils/socket-server';

// Initialize the socket server
const io = initSocketServer();

console.log('Socket.IO server started successfully');