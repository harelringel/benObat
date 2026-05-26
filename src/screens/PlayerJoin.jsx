import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../store/gameStore';

const PlayerJoin = () => {
  const { addPlayer } = useGameStore();
  const [playerName, setPlayerName] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = () => {
    if (!playerName.trim()) {
      alert('נא להזין שם');
      return;
    }

    addPlayer(playerName.trim());
    setIsJoined(true);
  };

  if (isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-blue-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [-5, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
            className="text-9xl mb-8"
          >
            🐻
          </motion.div>

          <h1 className="text-4xl font-black text-gray-800 mb-4">
            נהדר! אתה מצטרף למסיבה!
          </h1>

          <div className="bg-white rounded-3xl p-6 shadow-xl mb-6">
            <p className="text-2xl font-bold text-pink-500 mb-2">{playerName}</p>
            <p className="text-gray-600">ממתין שהמשחק יתחיל...</p>
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-pink-400 text-6xl"
          >
            💖
          </motion.div>

          <p className="text-gray-500 mt-6">נתראה במשחק 💕</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-blue-100 relative overflow-hidden">
      {/* Floating decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10]
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-10 right-10 text-6xl"
        >
          💙
        </motion.div>
        <motion.div
          animate={{
            y: [20, -20, 20],
            x: [10, -10, 10]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-10 text-6xl"
        >
          💗
        </motion.div>
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-20 right-20 text-5xl"
        >
          🎀
        </motion.div>
        <motion.div
          animate={{
            rotate: [360, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute bottom-32 left-16 text-5xl"
        >
          🌟
        </motion.div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Balloon */}
        <motion.div
          initial={{ scale: 0, y: 100 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="mb-8"
        >
          <div className="relative">
            <div className="w-32 h-40 rounded-full bg-gradient-to-b from-blue-300 via-pink-300 to-pink-400 relative">
              <div className="absolute inset-0 flex items-center justify-center text-6xl">
                ?
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="w-2 h-4 bg-yellow-600"></div>
              </div>
            </div>
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <div className="w-1 h-12 bg-yellow-600 origin-top"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">
            הצטרפות למשחק
          </h1>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 mb-8"
        >
          <div className="mb-6 text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">😊</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">הכניסו כינוי או שם</h2>
          </div>

          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="הכניסו שם"
            className="w-full p-4 text-xl text-center border-2 border-gray-200 rounded-2xl mb-6 focus:border-blue-400 focus:outline-none transition-colors"
            maxLength={20}
            autoFocus
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleJoin}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white font-bold text-2xl py-5 rounded-full shadow-xl flex items-center justify-center gap-3"
          >
            <span>💝</span>
            אני מוכן/ה
          </motion.button>
        </motion.div>

        {/* Bear Character */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [-3, 3, -3]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-8xl mb-4"
          >
            🐻
          </motion.div>
          <div className="bg-white/80 backdrop-blur rounded-2xl px-6 py-3 inline-block">
            <p className="text-lg font-semibold text-gray-700">נהדר! אתה מצטרף למסיבה!</p>
            <p className="text-pink-500 font-bold">נתראה במשחק 💕</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlayerJoin;
