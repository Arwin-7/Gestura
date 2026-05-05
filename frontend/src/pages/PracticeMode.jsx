import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { useGestureSocket } from '../hooks/useGestureSocket';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function PracticeMode() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const { isConnected, currentGesture, sendFrame } = useGestureSocket();
  
  const [targetGesture, setTargetGesture] = useState('A');
  const [score, setScore] = useState(0);
  const [gameTimeLeft, setGameTimeLeft] = useState(60); // 60 seconds total
  const [gestureTimeLeft, setGestureTimeLeft] = useState(10); // 10 seconds per gesture
  const [isGameActive, setIsGameActive] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' }); // 'success', 'error', 'bonus'

  // Capture frames and send to backend
  useEffect(() => {
    if (!isGameActive || !isConnected) return;

    const interval = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) sendFrame(imageSrc);
      }
    }, 150); // Send frame every 150ms

    return () => clearInterval(interval);
  }, [isGameActive, isConnected, sendFrame]);

  // Handle Main Game Timer
  useEffect(() => {
    if (!isGameActive) return;
    
    if (gameTimeLeft <= 0) {
      setIsGameActive(false);
      navigate('/result', { state: { score } });
      return;
    }

    const timerId = setInterval(() => setGameTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [isGameActive, gameTimeLeft, navigate, score]);

  // Handle Gesture Timer (Timeout = -2)
  useEffect(() => {
    if (!isGameActive) return;

    if (gestureTimeLeft <= 0) {
      // Timeout occurred
      setScore(prev => Math.max(0, prev - 2)); // Deduct 2 points, floor at 0
      showFeedback('-2 Timeout', 'error');
      nextGesture();
      return;
    }

    const timerId = setInterval(() => setGestureTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [isGameActive, gestureTimeLeft]);

  // Handle Scoring Logic (Correct = +10, Fast Bonus = +5)
  useEffect(() => {
    if (isGameActive && currentGesture === targetGesture) {
      const timeTaken = 10 - gestureTimeLeft;
      
      if (timeTaken <= 3) {
        setScore(prev => prev + 15); // +10 Base + 5 Bonus
        showFeedback('+15 Fast Bonus!', 'bonus');
      } else {
        setScore(prev => prev + 10); // +10 Base
        showFeedback('+10 Correct', 'success');
      }
      
      nextGesture();
    }
  }, [currentGesture, targetGesture, isGameActive, gestureTimeLeft]);

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 1500); // Clear after 1.5s
  };

  const nextGesture = () => {
    const randomLetter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    setTargetGesture(randomLetter);
    setGestureTimeLeft(10); // Reset timer for next gesture
  };

  const startGame = () => {
    setScore(0);
    setGameTimeLeft(60);
    setGestureTimeLeft(10);
    setTargetGesture(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
    setIsGameActive(true);
    setFeedback({ message: '', type: '' });
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Left Column: Camera */}
      <div className="flex-1">
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full shadow-sm text-sm font-medium">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {isConnected ? 'Backend Connected' : 'Connecting...'}
          </div>

          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              className="w-full h-full object-cover"
            />
            {currentGesture && (
              <div className="absolute bottom-4 right-4 bg-white/90 px-4 py-2 rounded-lg shadow text-gray-800 font-bold">
                Detected: <span className="text-primary">{currentGesture}</span>
              </div>
            )}
            {/* Feedback Animation Overlay */}
            {feedback.message && (
              <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold px-6 py-3 rounded-xl shadow-lg transition-all ${
                feedback.type === 'error' ? 'bg-red-100 text-red-600' : 
                feedback.type === 'bonus' ? 'bg-yellow-100 text-yellow-600' : 
                'bg-green-100 text-green-600'
              }`}>
                {feedback.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Game Info */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm text-center relative overflow-hidden">
          <h2 className="text-gray-500 font-medium mb-1">Target Gesture</h2>
          <div className="text-6xl font-bold text-gray-900 mb-2">{targetGesture}</div>
          
          {/* Gesture Timer Bar */}
          <div className="w-full bg-gray-200 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${gestureTimeLeft <= 3 ? 'bg-red-500' : 'bg-primary'}`}
              style={{ width: `${(gestureTimeLeft / 10) * 100}%` }}
            ></div>
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
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            Start Game
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
