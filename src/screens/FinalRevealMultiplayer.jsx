import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import useSocketGameStore, { GAME_STATES } from '../store/socketGameStore';
import LeaveGameButton from '../components/LeaveGameButton';

/**
 * Final Results Screen - Two-phase system
 * Issue #4: Guaranteed two-phase flow
 *
 * Phase 1 (RESULTS_COMPARISON):
 * - Show comparison table with all players ranked
 * - Display correct keys vs total keys per player
 * - Reveal actual baby gender
 * - Auto-advance after 8 seconds
 *
 * Phase 2 (RESULTS_WINNER):
 * - Announce winner(s) with confetti
 * - Handle co-winners (multiple players with same score)
 * - Show final ranking
 */
const FinalRevealMultiplayer = () => {
  const {
    gameState,
    comparisonTable,
    winners,
    actualGender,
    players,
    resetGame
  } = useSocketGameStore();

  // Fire confetti when winner is shown
  useEffect(() => {
    if (gameState === GAME_STATES.RESULTS_WINNER && actualGender) {
      const colors = actualGender === 'boy'
        ? ['#3B82F6', '#60A5FA', '#93C5FD']
        : ['#EC4899', '#F472B6', '#FBCFE8'];

      const duration = 5000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 10,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 10,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [gameState, actualGender]);

  // PHASE 1: RESULTS_COMPARISON - Show comparison table
  if (gameState === GAME_STATES.RESULTS_COMPARISON) {
    if (!comparisonTable) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <div className="text-2xl font-bold text-gray-800">מחשב תוצאות...</div>
          </div>
        </div>
      );
    }

    const genderBgColor = actualGender === 'boy'
      ? 'from-blue-100 via-blue-50 to-white'
      : 'from-pink-100 via-pink-50 to-white';
    const genderEmoji = actualGender === 'boy' ? '👶💙' : '👶💗';
    const genderText = actualGender === 'boy' ? 'זה בן!' : 'זאת בת!';

    return (
      <div className={`min-h-screen bg-gradient-to-b ${genderBgColor} pb-8`}>
        <div className="max-w-md mx-auto px-4 pt-8">
          <LeaveGameButton />

          {/* Gender Reveal */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 1,
                repeat: 2,
              }}
              className="text-9xl mb-6"
            >
              {genderEmoji}
            </motion.div>
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-6xl font-black mb-4 ${
                actualGender === 'boy' ? 'text-blue-600' : 'text-pink-600'
              }`}
            >
              {genderText}
            </motion.h1>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="text-5xl"
            >
              {actualGender === 'boy' ? '💙💙💙' : '💗💗💗'}
            </motion.div>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-3xl p-6 shadow-xl mb-6"
          >
            <h2 className="text-2xl font-black text-gray-800 text-center mb-6">
              📊 טבלת השוואה
            </h2>

            <div className="space-y-3">
              {comparisonTable.rows.map((row, index) => {
                const player = players.find(p => p.id === row.playerId);
                const isTopPlayer = index === 0;

                return (
                  <motion.div
                    key={row.playerId}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className={`rounded-2xl p-4 ${
                      isTopPlayer
                        ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-black text-gray-600">
                          #{index + 1}
                        </div>
                        {isTopPlayer && (
                          <div className="text-3xl">🏆</div>
                        )}
                        <div>
                          <div className="text-lg font-bold text-gray-800">
                            {player?.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {row.correctKeys} / {row.totalKeys} מפתחות נכונים
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-black text-green-600">
                          {row.correctKeys}
                        </div>
                        <div className="text-xs text-gray-600">
                          {actualGender === 'boy' ? '💙' : '💗'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Auto-advance message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-center text-gray-600 text-sm"
          >
            ⏳ ממשיכים להכרזת הזוכה בעוד רגעים...
          </motion.div>
        </div>
      </div>
    );
  }

  // PHASE 2: RESULTS_WINNER - Show winner(s)
  if (gameState === GAME_STATES.RESULTS_WINNER) {
    if (!winners || !actualGender) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <div className="text-2xl font-bold text-gray-800">טוען זוכה...</div>
          </div>
        </div>
      );
    }

    const genderBgColor = actualGender === 'boy'
      ? 'from-blue-100 via-blue-50 to-white'
      : 'from-pink-100 via-pink-50 to-white';

    // Handle co-winners
    const isCoWinners = Array.isArray(winners);
    const winnersList = isCoWinners ? winners : [winners];

    return (
      <div className={`min-h-screen bg-gradient-to-b ${genderBgColor} pb-8`}>
        <div className="max-w-md mx-auto px-4 pt-8">
          <LeaveGameButton />

          {/* Winner Announcement */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
            className={`bg-gradient-to-br ${
              actualGender === 'boy'
                ? 'from-blue-400 to-blue-500'
                : 'from-pink-400 to-pink-500'
            } rounded-3xl p-8 shadow-2xl text-white text-center mb-6`}
          >
            <motion.div
              animate={{
                rotate: [0, -15, 15, -15, 15, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              className="text-9xl mb-4"
            >
              🏆
            </motion.div>

            <h2 className="text-4xl font-black mb-4">
              {isCoWinners ? 'המנצחים!' : 'המנצח/ת!'}
            </h2>

            <div className="space-y-3">
              {winnersList.map((winner, index) => {
                const winnerPlayer = players.find(p => p.id === winner.playerId);
                return (
                  <motion.div
                    key={winner.playerId}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.2 }}
                    className="bg-white/20 rounded-2xl p-4"
                  >
                    <div className="text-5xl font-black mb-2">
                      {winnerPlayer?.name}!
                    </div>
                    <div className="text-xl">
                      {winner.correctKeys} מפתחות נכונים 🎉
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Final Rankings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 shadow-xl mb-6"
          >
            <h3 className="text-2xl font-black text-gray-800 text-center mb-4">
              📊 דירוג סופי
            </h3>
            <div className="space-y-3">
              {players
                .map(player => ({
                  ...player,
                  correctKeys: comparisonTable?.rows.find(r => r.playerId === player.id)?.correctKeys || 0
                }))
                .sort((a, b) => b.correctKeys - a.correctKeys)
                .map((player, index) => {
                  const isWinner = winnersList.some(w => w.playerId === player.id);

                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className={`rounded-2xl p-4 ${
                        isWinner
                          ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-4 border-yellow-400'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isWinner && (
                            <motion.span
                              animate={{ rotate: [0, -10, 10, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                              className="text-4xl"
                            >
                              👑
                            </motion.span>
                          )}
                          <div>
                            <div className="text-xl font-black text-gray-800">
                              {player.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {player.keysWon || 0} מפתחות כולל
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-black text-green-600">
                            {player.correctKeys}
                          </div>
                          <div className="text-xs text-gray-600">נכונים</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>

          {/* New Game Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              className="w-full py-5 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full text-2xl font-black shadow-2xl"
            >
              🔄 משחק חדש
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Fallback for other states
  return null;
};

export default FinalRevealMultiplayer;
