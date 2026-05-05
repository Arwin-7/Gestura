import { io } from 'socket.io-client';

// For local development, the Python backend runs on port 5000.
// Once deployed, VITE_BACKEND_URL will be used.
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';

export const socket = io(SOCKET_URL, {
    autoConnect: false, // We connect manually only when entering Practice Mode
    transports: ['websocket'], // Force WebSocket protocol for lower latency
});
