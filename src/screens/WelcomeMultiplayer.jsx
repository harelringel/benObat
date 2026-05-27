import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useSocketGameStore, { GAME_STATES } from '../store/socketGameStore';

const WelcomeMultiplayer = () => {
  const { initializeSocket, connected, connectionError } = useSocketGameStore();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [roomPin, setRoomPin] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);

  const joinRoom = useSocketGameStore(state => state.joinRoom);
  const setGameState = useSocketGameStore(state => state.gameState);

  useEffect(() => {
    // Initialize socket connection on mount
    initializeSocket();
  }, [initializeSocket]);

  const handleJoinRoom = async () => {
    if (!roomPin || roomPin.length !== 6) {
      setJoinError('נא להזין קוד בן 6 ספרות');
      return;
    }

    if (!playerName.trim()) {
      setJoinError('נא להזין שם');
      return;
    }

    setJoining(true);
    setJoinError(null);

    const result = await joinRoom(roomPin, playerName.trim());

    if (result.success) {
      // Joined successfully - state will update via socket events
    } else {
      setJoinError(result.error);
    }

    setJoining(false);
  };

  const handleCreateRoom = () => {
    // Navigate to admin setup
    useSocketGameStore.setState({ gameState: GAME_STATES.ADMIN_SETUP });
  };

  if (showJoinForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8"
        >
          {/* Back button */}
          <button
            onClick={() => { setShowJoinForm(false); setRoomPin(''); setPlayerName(''); setJoinError(null); }}
            className="mb-6 text-gray-600 flex items-center gap-2 hover:text-gray-800 transition"
          >
            ← חזרה
          </button>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎮</div>
            <h1 className="text-3xl font-black text-gray-800 mb-2">
              הצטרף למשחק
            </h1>
            <p className="text-gray-600">הזן את קוד החדר ואת שמך</p>
          </div>

          {/* Room PIN */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">קוד חדר (6 ספרות)</label>
            <input
              type="text"
              maxLength="6"
              value={roomPin}
              onChange={(e) => setRoomPin(e.target.value.replace(/\D/g, ''))}
              className="w-full p-4 text-center text-3xl font-black border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none tracking-widest"
              placeholder="000000"
              disabled={joining}
            />
          </div>

          {/* Player Name */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">שמך</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-4 text-xl border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none"
              placeholder="הזן שם או כינוי..."
              disabled={joining}
            />
          </div>

          {/* Error display */}
          {joinError && (
            <div className="mb-6 bg-red-100 border-2 border-red-300 rounded-2xl p-4">
              <p className="text-red-700 font-semibold text-center">❌ {joinError}</p>
            </div>
          )}

          {/* Connection status */}
          {!connected && (
            <div className="mb-6 bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-4">
              <p className="text-yellow-700 font-semibold text-center">
                ⚠️ מתחבר לשרת...
              </p>
            </div>
          )}

          {/* Join button */}
          <button
            onClick={handleJoinRoom}
            disabled={joining || !connected}
            className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-bold text-xl py-5 rounded-full shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {joining ? '⏳ מצטרף...' : '✅ הצטרף למשחק'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Logo & Title */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mb-12"
        >
          <div className="text-8xl mb-6">👶</div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-800 mb-4">
            בן או בת?
          </h1>
          <p className="text-xl text-gray-600 max-w-lg mx-auto">
            משחק מסיבת גילוי מין אינטראקטיבי עם טריוויה ולוח מפתחות
          </p>
        </motion.div>

        {/* Connection Status */}
        {!connected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-4 max-w-md mx-auto"
          >
            <p className="text-yellow-700 font-semibold">
              ⚠️ מתחבר לשרת...
            </p>
            {connectionError && (
              <p className="text-red-600 text-sm mt-2">{connectionError}</p>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          {/* Admin - Create Room */}
          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateRoom}
            disabled={!connected}
            className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-400 to-pink-500 text-white p-8 rounded-3xl shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="flex items-center justify-between">
              <div className="text-right">
                <div className="text-3xl font-black mb-2">👑 מנהל</div>
                <div className="text-lg text-purple-100">
                  צור משחק חדש והפץ קוד חדר
                </div>
              </div>
              <div className="text-6xl">🎯</div>
            </div>
          </motion.button>

          {/* Player - Join Room */}
          <motion.button
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowJoinForm(true)}
            disabled={!connected}
            className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-400 to-cyan-500 text-white p-8 rounded-3xl shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="flex items-center justify-between">
              <div className="text-right">
                <div className="text-3xl font-black mb-2">👥 משתתף</div>
                <div className="text-lg text-blue-100">
                  הצטרף למשחק קיים עם קוד חדר
                </div>
              </div>
              <div className="text-6xl">🎮</div>
            </div>
          </motion.button>
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 text-sm"
        >
          <p>🎲 סיבוב טריוויה • 🗝️ לוח מפתחות • 🎉 גילוי מרגש</p>
          <p className="mt-2">למשחק נדרשים 2-8 שחקנים</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeMultiplayer;
