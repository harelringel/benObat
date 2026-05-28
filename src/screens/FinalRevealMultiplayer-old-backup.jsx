import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import useSocketGameStore, { GAME_STATES } from '../store/socketGameStore';

const FinalRevealMultiplayer = () => {
  const {
    revealedGender,
    gameState,
    winner,
    players,
    resetGame,
  } = useSocketGameStore();

  const [showSuspense, setShowSuspense] = useState(true);
  const [showGender, setShowGender] = useState(false);
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    if (gameState === GAME_STATES.REVEAL_SUSPENSE) {
      // Show suspense for 3 seconds
      const suspenseTimer = setTimeout(() => {
        setShowSuspense(false);
        setShowGender(true);

        // Fire confetti
        const colors = revealedGender === 'boy'
          ? ['#3B82F6', '#60A5FA', '#93C5FD']
          : ['#EC4899', '#F472B6', '#FBCFE8'];

        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors,
          });
          confetti({
            particleCount: 7,
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

        // Show winner after 3 more seconds
        setTimeout(() => {
          setShowWinner(true);
        }, 3000);
      }, 3000);

      return () => clearTimeout(suspenseTimer);
    }
  }, [gameState, revealedGender]);

  useEffect(() => {
    if (gameState === GAME_STATES.FINAL_REVEAL && !showGender) {
      setShowGender(true);

      // Fire confetti
      const colors = revealedGender === 'boy'
        ? ['#3B82F6', '#60A5FA', '#93C5FD']
        : ['#EC4899', '#F472B6', '#FBCFE8'];

      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 7,
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

      // Show winner after 3 seconds
      const winnerTimer = setTimeout(() => {
        setShowWinner(true);
      }, 3000);

      return () => {
        clearTimeout(winnerTimer);
      };
    }
  }, [gameState, showGender, revealedGender]);

  // Handle GAME_OVER state - move directly to final reveal
  useEffect(() => {
    if (gameState === GAME_STATES.GAME_OVER) {
      setShowSuspense(false);
      setShowGender(true);
      setShowWinner(true);
    }
  }, [gameState]);

  // Suspense screen
  if (showSuspense && gameState === GAME_STATES.REVEAL_SUSPENSE) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
            className="text-9xl mb-8"
          >
            🎭
          </motion.div>
          <motion.h1
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
            className="text-4xl font-black text-gray-800 mb-4"
          >
            ועכשיו...
          </motion.h1>
          <motion.h2
            animate={{
              scale: [1, 1.1, 1],
              color: ['#EC4899', '#3B82F6', '#EC4899'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="text-5xl font-black mb-8"
          >
            הרגע האמת!
          </motion.h2>
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-8xl"
          >
            ⏱️
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Fallback if revealedGender is not set
  if (!revealedGender) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <div className="text-2xl font-bold text-gray-800">טוען גילוי...</div>
        </div>
      </div>
    );
  }

  const genderBgColor = revealedGender === 'boy'
    ? 'from-blue-100 via-blue-50 to-white'
    : 'from-pink-100 via-pink-50 to-white';
  const genderEmoji = revealedGender === 'boy' ? '👶💙' : '👶💗';
  const genderText = revealedGender === 'boy' ? 'זה בן!' : 'זאת בת!';

  return (
    <div className={`min-h-screen bg-gradient-to-b ${genderBgColor} pb-8`}>
      <div className="max-w-md mx-auto px-4 pt-8">
        <AnimatePresence>
          {showGender && (
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
                  revealedGender === 'boy' ? 'text-blue-600' : 'text-pink-600'
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
                {revealedGender === 'boy' ? '💙💙💙' : '💗💗💗'}
              </motion.div>
            </motion.div>
          )}

          {showWinner && winner && (
            <>
              {/* Winner Announcement */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className={`bg-gradient-to-br ${
                  revealedGender === 'boy'
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
                  className="text-8xl mb-4"
                >
                  🏆
                </motion.div>
                <h2 className="text-4xl font-black mb-3">
                  המנצח/ת:
                </h2>
                <div className="text-5xl font-black mb-4">
                  {winner.winner?.name || winner.name}!
                </div>
                <div className="bg-white/20 rounded-2xl p-4">
                  <p className="text-xl">
                    ניצחון מרשים! 🎉
                  </p>
                </div>
              </motion.div>

              {/* Results Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <h3 className="text-2xl font-black text-gray-800 text-center mb-4">
                  📊 תוצאות סופיות
                </h3>
                <div className="space-y-3">
                  {players
                    .sort((a, b) => (b.score || 0) - (a.score || 0))
                    .map((player, index) => {
                      const isWinner = player.id === (winner.winner?.id || winner.id);

                      return (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className={`rounded-3xl p-5 shadow-lg ${
                            isWinner
                              ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-4 border-yellow-400'
                              : 'bg-white'
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
                                  {player.keys} מפתחות
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-black text-green-600">
                                {player.score || 0}
                              </div>
                              <div className="text-xs text-gray-600">נקודות</div>
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
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FinalRevealMultiplayer;
