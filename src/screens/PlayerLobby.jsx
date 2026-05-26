import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/gameStore';

const PlayerLobby = () => {
  const {
    players,
    numPlayers,
    addPlayer,
    removePlayer,
    togglePlayerReady,
    startQuiz,
    startQuizTestMode,
  } = useGameStore();

  const [playerName, setPlayerName] = useState('');

  const readyCount = players.filter(p => p.ready).length;
  const allReady = players.length === numPlayers && players.every(p => p.ready);

  useEffect(() => {
    if (allReady) {
      const timer = setTimeout(() => {
        startQuiz();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [allReady, startQuiz]);

  const handleAddPlayer = () => {
    if (!playerName.trim()) {
      alert('נא להזין שם');
      return;
    }

    if (players.length >= numPlayers) {
      alert(`ניתן להוסיף עד ${numPlayers} שחקנים`);
      return;
    }

    if (players.some(p => p.name === playerName.trim())) {
      alert('שם זה כבר קיים');
      return;
    }

    addPlayer(playerName.trim());
    setPlayerName('');
  };

  const handleToggleReady = (playerId) => {
    togglePlayerReady(playerId);
  };

  const playerColors = ['bg-blue-400', 'bg-pink-400', 'bg-purple-400', 'bg-green-400', 'bg-yellow-400', 'bg-orange-400', 'bg-red-400', 'bg-indigo-400'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50 relative overflow-hidden pb-8">
      {/* Floating decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-20 right-10 text-5xl"
        >
          🎮
        </motion.div>
        <motion.div
          animate={{ y: [20, -20, 20], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-40 left-10 text-5xl"
        >
          👥
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-20 right-20 text-4xl"
        >
          ⭐
        </motion.div>
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-4"
          >
            👥
          </motion.div>
          <h1 className="text-4xl font-black text-gray-800 mb-2">
            לובי שחקנים
          </h1>
          <p className="text-lg text-gray-600">בואו נתחיל!</p>
        </motion.div>

        {/* Progress Circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-xl mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <div className="text-3xl font-black text-blue-500">{players.length}</div>
              <div className="text-sm text-gray-600">הצטרפו</div>
            </div>
            <div className="text-4xl">📊</div>
            <div className="text-center flex-1">
              <div className="text-3xl font-black text-green-500">{readyCount}</div>
              <div className="text-sm text-gray-600">מוכנים</div>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(readyCount / numPlayers) * 100}%` }}
              className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 h-3 rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-center mt-2 text-sm text-gray-500">
            {readyCount} מתוך {numPlayers} מוכנים
          </div>
        </motion.div>

        {/* Add Player Form */}
        {players.length < numPlayers && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 shadow-xl mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">➕</div>
              <h2 className="text-xl font-bold text-gray-800">הוסף שחקן</h2>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="הזן שם או כינוי"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                className="w-full p-4 text-lg text-center border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:outline-none transition-colors"
                maxLength={15}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddPlayer}
                className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white font-bold text-lg py-4 rounded-full shadow-lg"
              >
                הוסף לרשימה 🚀
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Players List */}
        <div className="space-y-3 mb-6">
          <AnimatePresence>
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-3xl p-5 shadow-lg transition-all ${
                  player.ready ? 'ring-4 ring-green-400' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={player.ready ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black text-white ${
                      playerColors[index % playerColors.length]
                    }`}
                  >
                    {index + 1}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{player.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {player.ready ? (
                        <span className="text-sm text-green-600 font-semibold">✅ מוכן ומזמן!</span>
                      ) : (
                        <span className="text-sm text-gray-500">⏳ ממתין...</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleReady(player.id)}
                      className={`px-5 py-2 rounded-full font-bold text-sm shadow-md ${
                        player.ready
                          ? 'bg-yellow-400 text-gray-800'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      {player.ready ? 'ביטול' : 'מוכן!'}
                    </motion.button>
                    {!player.ready && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removePlayer(player.id)}
                        className="px-5 py-2 bg-red-100 text-red-600 rounded-full font-bold text-sm"
                      >
                        הסר
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty Slots */}
          {[...Array(numPlayers - players.length)].map((_, idx) => (
            <motion.div
              key={`empty-${idx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (players.length + idx) * 0.1 }}
              className="bg-gray-50 rounded-3xl p-5 border-2 border-dashed border-gray-300"
            >
              <div className="flex items-center justify-center gap-3 text-gray-400">
                <div className="text-3xl">👤</div>
                <span className="text-lg">ממתין לשחקן...</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* All Ready Message */}
        <AnimatePresence>
          {allReady && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-3xl p-8 shadow-2xl text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-6xl mb-3"
                >
                  🎉
                </motion.div>
                <h2 className="text-3xl font-black mb-2">כולם מוכנים!</h2>
                <p className="text-xl">המשחק מתחיל בעוד רגע...</p>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="mt-4 text-5xl"
                >
                  🚀
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Test Mode Button - For Testing/Admin */}
        {!allReady && players.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => startQuizTestMode()}
              className="w-full py-4 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-3xl font-bold text-lg shadow-xl"
            >
              🧪 Test Mode - Start Now
            </motion.button>
            <p className="text-center text-sm text-gray-500 mt-2">
              For admin testing - bypasses player requirements
            </p>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📋</span>
            <h3 className="text-xl font-bold text-gray-800">איך זה עובד?</h3>
          </div>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <p className="pt-1">כל שחקן מזין שם ולוחץ "הוסף לרשימה"</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <p className="pt-1">כל שחקן לוחץ על "מוכן!" כשהוא מוכן</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <p className="pt-1">כשכולם מוכנים - המשחק מתחיל!</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <p className="pt-1">ענו על שאלות, צברו מפתחות וגלו את הסוד!</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlayerLobby;
