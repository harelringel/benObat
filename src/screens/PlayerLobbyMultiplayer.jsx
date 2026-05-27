import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSocketGameStore from '../store/socketGameStore';

const PlayerLobbyMultiplayer = () => {
  const {
    roomPin,
    players,
    userRole,
    currentUserId,
    numPlayers,
    toggleReady,
    startQuiz
  } = useSocketGameStore();

  const handleToggleReady = async () => {
    await toggleReady();
  };

  const handleStartQuiz = async () => {
    const result = await startQuiz();
    if (!result.success) {
      alert(result.error || 'לא ניתן להתחיל את המשחק');
    }
  };

  const allReady = players.length === numPlayers && players.every(p => p.ready);
  const currentPlayer = players.find(p => p.id === currentUserId);
  const isReady = currentPlayer?.ready || false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Room PIN Display */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            <div className="text-sm text-gray-600 mb-2 font-semibold">קוד חדר</div>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 tracking-widest">
              {roomPin}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              שתפו קוד זה עם השחקנים
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-5xl">🎮</div>
            <div>
              <h1 className="text-3xl font-black text-gray-800">
                לובי שחקנים
              </h1>
              <p className="text-gray-600">
                {players.length} / {numPlayers} שחקנים
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(players.length / numPlayers) * 100}%` }}
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500"
            />
          </div>
        </motion.div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <AnimatePresence>
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-3xl p-6 shadow-lg transition-all ${
                  player.ready
                    ? 'bg-gradient-to-br from-green-400 to-green-500 text-white'
                    : 'bg-white text-gray-800'
                } ${
                  player.id === currentUserId ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">
                      {player.ready ? '✅' : '⏳'}
                    </div>
                    <div>
                      <div className="text-2xl font-black mb-1">
                        {player.name}
                        {player.id === currentUserId && (
                          <span className="text-sm mr-2 opacity-75">(את/ה)</span>
                        )}
                      </div>
                      <div className={`text-sm ${player.ready ? 'text-green-100' : 'text-gray-500'}`}>
                        {player.ready ? 'מוכן!' : 'ממתין...'}
                      </div>
                    </div>
                  </div>

                  {/* Keys indicator */}
                  <div className={`text-3xl font-black ${player.ready ? 'text-white' : 'text-gray-400'}`}>
                    🗝️ {player.keys}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty slots */}
          {Array.from({ length: numPlayers - players.length }).map((_, index) => (
            <motion.div
              key={`empty-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl p-6 bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center"
            >
              <div className="text-center">
                <div className="text-5xl mb-2 opacity-30">👤</div>
                <div className="text-gray-400 font-semibold">
                  ממתין לשחקן...
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Player Actions */}
        {userRole === 'player' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <button
              onClick={handleToggleReady}
              className={`w-full py-6 rounded-full font-bold text-2xl shadow-2xl transition-all ${
                isReady
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                  : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:scale-105'
              }`}
            >
              {isReady ? '⏱️ ביטול מוכנות' : '✅ אני מוכן!'}
            </button>
          </motion.div>
        )}

        {/* Admin Actions */}
        {userRole === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto space-y-4"
          >
            {/* Status message */}
            {!allReady && (
              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-4 text-center">
                <div className="text-yellow-800 font-bold">
                  ⏳ ממתין ש{players.filter(p => !p.ready).length} שחקנים יסמנו מוכן
                </div>
              </div>
            )}

            {players.length !== numPlayers && (
              <div className="bg-blue-100 border-2 border-blue-300 rounded-2xl p-4 text-center">
                <div className="text-blue-800 font-bold">
                  ⏳ ממתין ל-{numPlayers - players.length} שחקנים נוספים
                </div>
              </div>
            )}

            {/* Start button */}
            <button
              onClick={handleStartQuiz}
              disabled={!allReady}
              className={`w-full py-6 rounded-full font-bold text-2xl shadow-2xl transition-all ${
                allReady
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {allReady ? '🎮 התחל משחק!' : '⏳ ממתין לשחקנים...'}
            </button>
          </motion.div>
        )}

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 text-sm mt-8"
        >
          <p>💡 השחקנים יכולים להצטרף באמצעות הקוד {roomPin}</p>
          <p className="mt-2">המשחק יתחיל אוטומטית כשכל השחקנים יסמנו מוכן</p>
        </motion.div>
      </div>
    </div>
  );
};

export default PlayerLobbyMultiplayer;
