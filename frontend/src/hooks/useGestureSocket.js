import { useEffect, useState, useCallback } from 'react';
import { socket } from '../services/socket';

export const useGestureSocket = () => {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [currentGesture, setCurrentGesture] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        socket.connect();

        const onConnect    = () => { setIsConnected(true);  setError(null); };
        const onDisconnect = () => { setIsConnected(false); setCurrentGesture(null); };
        const onGesture    = (data) => {
            setCurrentGesture(data.error ? null : (data.gesture || null));
        };
        const onError = (data) => setError(data.message);

        socket.on('connect',    onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('gesture',    onGesture);
        socket.on('error',      onError);

        return () => {
            socket.off('connect',    onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('gesture',    onGesture);
            socket.off('error',      onError);
            socket.disconnect();
        };
    }, []);

    /**
     * Send a flat array of 63 landmark numbers to the backend.
     * The backend normalises them and runs the Random Forest model.
     */
    const sendLandmarks = useCallback((landmarkArray) => {
        if (isConnected && landmarkArray) {
            socket.emit('send_landmarks', { landmarks: landmarkArray });
        }
    }, [isConnected]);

    return { isConnected, currentGesture, error, sendLandmarks };
};
