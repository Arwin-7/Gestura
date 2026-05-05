import { useEffect, useState, useCallback } from 'react';
import { socket } from '../services/socket';

export const useGestureSocket = () => {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [currentGesture, setCurrentGesture] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Connect to the socket server
        socket.connect();

        const onConnect = () => {
            setIsConnected(true);
            setError(null);
        };

        const onDisconnect = () => {
            setIsConnected(false);
            setCurrentGesture(null);
        };

        const onGesture = (data) => {
            if (data.error) {
                // E.g., "No hand detected" or "Could not classify"
                setCurrentGesture(null);
            } else if (data.gesture) {
                // Update the current predicted gesture (e.g., 'A')
                setCurrentGesture(data.gesture);
            }
        };

        const onError = (data) => {
            setError(data.message);
        };

        // Attach event listeners
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('gesture', onGesture);
        socket.on('error', onError);

        // Cleanup: remove listeners and disconnect when the component unmounts
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('gesture', onGesture);
            socket.off('error', onError);
            socket.disconnect();
        };
    }, []);

    // Helper function to send video frames to the backend
    const sendFrame = useCallback((base64Image) => {
        if (isConnected) {
            socket.emit('process_frame', base64Image);
        }
    }, [isConnected]);

    return { isConnected, currentGesture, error, sendFrame };
};
