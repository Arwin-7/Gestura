import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGestureSocket } from '../hooks/useGestureSocket';
import { useHandLandmarker } from '../hooks/useHandLandmarker';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function PracticeMode() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const animFrameRef = useRef(null);

  const { isConnected, currentGesture, sendLandmarks } = useGestureSocket();
  const { isReady: mpReady, detectLandmarks } = useHandLandmarker();

  const [targetGesture, setTargetGesture]     = useState('A');
  const [score, setScore]                     = useState(0);
  const [gameTimeLeft, setGameTimeLeft]       = useState(60);
  const [gestureTimeLeft, setGestureTimeLeft] = useState(10);
  const [isGameActive, setIsGameActive]       = useState(false);
  const [feedback, setFeedback]               = useState({ message: '', type: '' });

  // ── Webcam setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    let stream;
    const startCam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Webcam error:', err);
      }
    };
    startCam();
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  // ── Landmark detection loop (requestAnimationFrame) ─────────────────────────
  useEffect(() => {
    if (!isGameActive || !mpReady || !isConnected) return;

    let lastSent = 0;
    const INTERVAL_MS = 150;

    const loop = () => {
      animFrameRef.current = requestAnimationFrame(loop);
      const now = performance.now();
      if (now - lastSent < INTERVAL_MS) return;
      lastSent = now;

      const landmarks = detectLandmarks(videoRef.current);
      if (landmarks) sendLandmarks(landmarks);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isGameActive, mpReady, isConnected, detectLandmarks, sendLandmarks]);

  // ── Main game timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isGameActive) return;
    if (gameTimeLeft <= 0) {
      setIsGameActive(false);
      navigate('/result', { state: { score } });
      return;
    }
    const id = setInterval(() => setGameTimeLeft(p => p - 1), 1000);
    return () => clearInterval(id);
  }, [isGameActive, gameTimeLeft, navigate, score]);

  // ── Per-gesture timer (timeout = -2) ────────────────────────────────────────
  useEffect(() => {
    if (!isGameActive) return;
    if (gestureTimeLeft <= 0) {
      setScore(p => Math.max(0, p - 2));
      showFeedback('-2 Timeout', 'error');
      nextGesture();
      return;
    }
    const id = setInterval(() => setGestureTimeLeft(p => p - 1), 1000);
    return () => clearInterval(id);
  }, [isGameActive, gestureTimeLeft]);

  // ── Scoring logic ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isGameActive || !currentGesture) return;
    if (currentGesture === targetGesture) {
      const timeTaken = 10 - gestureTimeLeft;
      if (timeTaken <= 3) {
        setScore(p => p + 15);
        showFeedback('+15 Fast Bonus!', 'bonus');
      } else {
        setScore(p => p + 10);
        showFeedback('+10 Correct', 'success');
      }
      nextGesture();
    }
  }, [currentGesture]);

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 1500);
  };

  const nextGesture = () => {
    setTargetGesture(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
    setGestureTimeLeft(10);
  };

  const startGame = () => {
    setScore(0);
    setGameTimeLeft(60);
    setGestureTimeLeft(10);
    setTargetGesture(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
    setIsGameActive(true);
    setFeedback({ message: '', type: '' });
  };

  const statusOk = isConnected && mpReady;

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Camera */}
      <div className="flex-1">
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full shadow-sm text-sm font-medium">
            <div className={`w-2.5 h-2.5 rounded-full ${statusOk ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
            {!isConnected ? 'Backend connecting…' : !mpReady ? 'Loading MediaPipe…' : 'Ready'}
          </div>

          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"  /* mirror */
            />
            {currentGesture && (
              <div className="absolute bottom-4 right-4 bg-white/90 px-4 py-2 rounded-lg shadow text-gray-800 font-bold">
                Detected: <span className="text-primary">{currentGesture}</span>
              </div>
            )}
            {feedback.message && (
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold px-6 py-3 rounded-xl shadow-lg ${
                feedback.type === 'error'   ? 'bg-red-100 text-red-600'    :
                feedback.type === 'bonus'   ? 'bg-yellow-100 text-yellow-600' :
                                              'bg-green-100 text-green-600'
              }`}>
                {feedback.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game panel */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm text-center">
          <h2 className="text-gray-500 font-medium mb-1">Target Gesture</h2>
          <div className="text-6xl font-bold text-gray-900 mb-2">{targetGesture}</div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-4">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${gestureTimeLeft <= 3 ? 'bg-red-500' : 'bg-primary'}`}
              style={{ width: `${(gestureTimeLeft / 10) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{gestureTimeLeft}s to answer</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm text-center">
            <h3 className="text-gray-500 text-sm font-medium">Game Time</h3>
            <div className={`text-2xl font-bold ${gameTimeLeft <= 10 ? 'text-red-500' : 'text-gray-900'}`}>
              00:{gameTimeLeft.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm text-center">
            <h3 className="text-gray-500 text-sm font-medium">Score</h3>
            <div className="text-2xl font-bold text-primary">{score}</div>
          </div>
        </div>

        {!isGameActive ? (
          <button
            onClick={startGame}
            disabled={!statusOk}
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {statusOk ? 'Start Game' : 'Initializing…'}
          </button>
        ) : (
          <button
            onClick={() => setIsGameActive(false)}
            className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            End Game
          </button>
        )}
      </div>
    </div>
  );
}
