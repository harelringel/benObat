import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSocketGameStore, { GAME_STATES } from '../store/socketGameStore';
import LeaveGameButton from '../components/LeaveGameButton';

/**
 * Key Wall Stage - Turn-based system
 * Issue #3: Each player takes turns claiming keys with 15-second timer
 *
 * Server controls:
 * - Turn order and advancement
 * - Timer countdown
 * - Auto-pick on timeout
 * - Skip disconnected players
 */
const KeyBoardStageMultiplayer = () => {
  const {
    gameState,
    keys,
    currentTurnPlayerId,
    remainingTimeMs,
    players,
    currentUserId,
    scoreBoy,
    scoreGirl,
    claimKey
  } = useSocketGameStore();

  const [selectedKeyId, setSelectedKeyId] = useState(null);

  // Calculate grid size based on number of keys
  const gridSize = Math.sqrt(keys.length);

  // Find current turn player
  const currentTurnPlayer = players.find(p => p.id === currentTurnPlayerId);
  const isMyTurn = currentTurnPlayerId === currentUserId;

  // Timer display
  const timeLeftSeconds = Math.ceil(remainingTimeMs / 1000);

  // Handle key claim
  const handleClaimKey = async () => {
    if (!selectedKeyId || !isMyTurn) return;

    try {
      await claimKey(selectedKeyId);
      setSelectedKeyId(null);
      // Server will auto-advance turn
    } catch (error) {
      console.error('Failed to claim key:', error);
      alert('שגיאה בתביעת המפתח');
    }
  };

  // Only show in KEY_WALL state
  if (gameState !== GAME_STATES.KEY_WALL) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-pink-50 pb-8">
      <div className="max-w-md mx-auto px-4">
        <LeaveGameButton />

        {/* Turn Timer Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className={`sticky top-0 z-20 py-6 mb-6 rounded-b-3xl shadow-2xl transition-all duration-500 ${
            timeLeftSeconds <= 5
              ? 'bg-gradient-to-r from-red-400 to-pink-500'
              : 'bg-gradient-to-r from-purple-400 to-indigo-500'
          }`}
        >
          <div className="text-center">
            <motion.div
              animate={{
                scale: timeLeftSeconds <= 5 ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.5, repeat: timeLeftSeconds <= 5 ? Infinity : 0 }}
              className="text-8xl font-black text-white mb-2"
            >
              {timeLeftSeconds}
            </motion.div>
            <div className="text-2xl font-bold text-white">
              שניות לתור
            </div>
            <div className="text-xl text-white/90 mt-2">
              {isMyTurn ? '🎯 התור שלך!' : `👤 תור של ${currentTurnPlayer?.name}`}
            </div>
          </div>
        </motion.div>

        {/* Live Score Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white shadow-lg rounded-3xl p-4 mb-6"
        >
          <h2 className="text-xl font-black text-gray-800 text-center mb-3">🗝️ קיר המפתחות</h2>
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ scale: scoreBoy > scoreGirl ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.5 }}
              className="flex-1 bg-gradient-to-br from-blue-100 to-blue-200 px-4 py-3 rounded-2xl text-center border-2 border-blue-400"
            >
              <div className="text-3xl font-black text-blue-600">{scoreBoy}</div>
              <div className="text-sm text-blue-600">💙 בן</div>
            </motion.div>
            <motion.div
              animate={{ scale: scoreGirl > scoreBoy ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.5 }}
              className="flex-1 bg-gradient-to-br from-pink-100 to-pink-200 px-4 py-3 rounded-2xl text-center border-2 border-pink-400"
            >
              <div className="text-3xl font-black text-pink-600">{scoreGirl}</div>
              <div className="text-sm text-pink-600">💗 בת</div>
            </motion.div>
          </div>
        </motion.div>

        {/* My Turn Banner */}
        <AnimatePresence>
          {isMyTurn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl p-4 text-center shadow-xl mb-6"
            >
              <div className="text-5xl mb-2">🎯</div>
              <h2 className="text-2xl font-bold text-white">
                התור שלך! בחר מפתח
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Key Wall Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-xl mb-6"
        >
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              aspectRatio: '1',
            }}
          >
            {keys.map((key) => {
              const isClaimed = key.claimed;
              const isSelected = selectedKeyId === key.id;
              const canSelect = isMyTurn && !isClaimed;

              return (
                <motion.button
                  key={key.id}
                  whileHover={canSelect ? { scale: 1.05 } : {}}
                  whileTap={canSelect ? { scale: 0.95 } : {}}
                  onClick={() => canSelect && setSelectedKeyId(key.id)}
                  disabled={!canSelect}
                  className={`
                    relative aspect-square rounded-2xl font-bold text-3xl shadow-lg
                    transition-all duration-300 flex items-center justify-center
                    ${
                      isClaimed
                        ? key.gender === 'boy'
                          ? 'bg-gradient-to-br from-blue-300 to-blue-500 text-white'
                          : 'bg-gradient-to-br from-pink-300 to-pink-500 text-white'
                        : isSelected
                        ? 'bg-gradient-to-br from-yellow-300 to-orange-400 text-white ring-4 ring-yellow-500'
                        : canSelect
                        ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 hover:from-yellow-100 hover:to-yellow-200'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }
                  `}
                >
                  {isClaimed ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="text-5xl"
                    >
                      {key.gender === 'boy' ? '💙' : '💗'}
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{
                        rotate: isSelected ? [0, 10, -10, 0] : 0,
                      }}
                      transition={{ duration: 0.5, repeat: isSelected ? Infinity : 0 }}
                      className="text-4xl"
                    >
                      🗝️
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Claim Button */}
        {isMyTurn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleClaimKey}
              disabled={!selectedKeyId}
              className={`
                w-full py-5 rounded-full text-2xl font-black shadow-2xl transition-all
                ${
                  selectedKeyId
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {selectedKeyId ? '🔓 תבע מפתח!' : '👆 בחר מפתח'}
            </motion.button>
          </motion.div>
        )}

        {/* Players Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl shadow-lg p-5"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
            👥 שחקנים
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {players.map((player) => {
              const isCurrentTurn = player.id === currentTurnPlayerId;
              const claimedKeys = keys.filter(k => k.claimedBy === player.id);

              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-xl font-bold transition-all ${
                    isCurrentTurn
                      ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white ring-2 ring-purple-500'
                      : player.connected
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 truncate">
                      {isCurrentTurn && (
                        <motion.span
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          👉
                        </motion.span>
                      )}
                      <span className="truncate">{player.name}</span>
                      {!player.connected && (
                        <span className="text-xs">(מנותק)</span>
                      )}
                    </div>
                  </div>
                  <div className="text-center text-2xl">
                    🗝️ {claimedKeys.length}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-5 shadow-lg mt-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">📊 התקדמות</h3>
          <div>
            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <span>מפתחות שנתבעו</span>
              <span className="font-bold">
                {keys.filter(k => k.claimed).length}/{keys.length}
              </span>
            </div>
            <div className="w-full bg-white rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(keys.filter(k => k.claimed).length / keys.length) * 100}%` }}
                className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 h-3 rounded-full"
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default KeyBoardStageMultiplayer;
