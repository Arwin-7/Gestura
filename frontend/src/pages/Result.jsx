import { useLocation, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Trophy, ArrowRight, RotateCcw, Save, Loader2 } from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Result() {
  const location = useLocation();
  const score = location.state?.score;

  const [playerName, setPlayerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [error, setError] = useState('');

  // Fetch leaderboard on component mount
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const scoresRef = collection(db, "scores");
        const q = query(scoresRef, orderBy("score", "desc"), limit(5));
        const querySnapshot = await getDocs(q);
        
        const topScores = [];
        querySnapshot.forEach((doc) => {
          topScores.push({ id: doc.id, ...doc.data() });
        });
        
        setLeaderboard(topScores);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        // Catch gracefully in case Firebase isn't configured yet by the student
        setError("Firebase config is required to load the leaderboard.");
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [isSaved]); // Re-fetch when a new score is saved

  const handleSaveScore = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setIsSaving(true);
    try {
      await addDoc(collection(db, "scores"), {
        name: playerName,
        score: score,
        timestamp: new Date()
      });
      setIsSaved(true);
    } catch (err) {
      console.error("Error saving score: ", err);
      setError("Failed to save score. Check Firebase config.");
    } finally {
      setIsSaving(false);
    }
  };

  // Prevent direct access to result page without playing
  if (score === undefined) {
    return <Navigate to="/practice" />;
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-start justify-center min-h-[60vh]">
      
      {/* Left Column: Result & Save Form */}
      <div className="flex-1 w-full bg-white border border-gray-200 shadow-sm rounded-2xl p-8 text-center">
        <div className="bg-blue-50 p-6 rounded-full mb-6 inline-flex border border-blue-100">
          <Trophy className="w-12 h-12 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Time's Up!</h1>
        <p className="text-gray-600 mb-6">Great job practicing your sign language.</p>

        <div className="bg-gray-50 border border-gray-200 w-full rounded-xl p-6 mb-8">
          <h2 className="text-gray-500 font-medium mb-1 uppercase tracking-wide text-xs">Final Score</h2>
          <div className="text-5xl font-bold text-primary">{score}</div>
        </div>

        {!isSaved ? (
          <form onSubmit={handleSaveScore} className="mb-8 flex gap-2">
            <input 
              type="text" 
              placeholder="Enter your name" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={15}
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary bg-white"
            />
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save
            </button>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 font-medium">
            Score saved to leaderboard!
          </div>
        )}

        <div className="flex flex-col sm:flex-row w-full gap-3">
          <Link 
            to="/practice" 
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </Link>
          <Link 
            to="/learn" 
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Learning
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Right Column: Leaderboard */}
      <div className="w-full md:w-80 bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Players
        </h2>
        
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        
        {loadingLeaderboard ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No scores yet. Be the first!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {leaderboard.map((entry, index) => (
              <div key={entry.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-gray-400'}`}>
                    #{index + 1}
                  </span>
                  <span className="font-medium text-gray-800">{entry.name}</span>
                </div>
                <span className="font-bold text-primary">{entry.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
