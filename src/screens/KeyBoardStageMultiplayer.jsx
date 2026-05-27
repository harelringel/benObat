import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useSocketGameStore, { GAME_STATES } from '../store/socketGameStore';
import KeyCircle from '../components/KeyBoard/KeyCircle';

const KeyBoardStageMultiplayer = () => {
  const {
    players,
    currentPlayerIndex,
    boardSize,
    openedCircles,
    boardLayout,
    circleCounts,
    gameState,
    currentUserId,
    openCircle,
    nextPlayerTurn,
    userRole
  } = useSocketGameStore();

  const [selectedCircle, setSelectedCircle] = useState(null);

  const currentPlayer = players[currentPlayerIndex];
  const gridSize = Math.sqrt(boardSize);
  const isMyTurn = currentPlayer?.id === currentUserId;
  const isAdmin = userRole === 'admin';

  // Intro screen
  if (gameState === GAME_STATES.BOARD_INTRO) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-pink-50 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            🗝️
          </motion.div>

          <h1 className="text-4xl font-black text-gray-800 mb-2">לוח המפתחות!</h1>
          <p className="text-lg text-gray-600 mb-8">הגיע הזמן לגלות את הסוד...</p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-6 shadow-xl mb-6"
          >
            <div className="space-y-4 text-right">
              <div className="flex items-start gap-3">
                <span className="text-3xl">1️⃣</span>
                <p className="text-gray-700 pt-1">
                  כל שחקן בתורו יפתח עיגולים לפי מספר המפתחות שצבר
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-3xl">2️⃣</span>
                <p className="text-gray-700 pt-1">
                  מאחורי כל עיגול מתחבא "בן" 💙 או "בת" 💗
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-3xl">🏆</span>
                <p className="text-gray-700 pt-1">
                  השחקן שפתח הכי הרבה מהמין הנכון ינצח!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Player keys summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 shadow-lg mb-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 המפתחות שלכם</h3>
            <div className="grid grid-cols-2 gap-3">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white rounded-2xl p-3 text-center shadow-md"
                >
                  <div className="text-lg font-bold text-gray-800 mb-1 truncate">{player.name}</div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-3xl font-black text-yellow-500">{player.keys}</span>
                    <span className="text-2xl">🗝️</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {isAdmin && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextPlayerTurn}
              className="w-full py-5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-2xl font-black shadow-2xl"
            >
              🎮 בואו נתחיל!
            </motion.button>
          )}

          {!isAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-gray-600 text-center"
            >
              ⏳ ממתין למנהל להתחיל...
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  const handleOpenCircle = async () => {
    if (selectedCircle === null || !isMyTurn || currentPlayer.keys === 0) {
      return;
    }

    const result = await openCircle(selectedCircle);
    if (result.success) {
      setSelectedCircle(null);
    }
  };

  const canOpenMore = currentPlayer?.keys > 0;
  const showOpenButton = isMyTurn && canOpenMore && gameState === GAME_STATES.BOARD_PLAYER_TURN;

  // Generate board layout for display with gender data from opened circles
  const displayBoard = Array.from({ length: boardSize }, (_, i) => ({
    index: i,
    opened: openedCircles.includes(i),
    gender: boardLayout[i] || null // Get gender if circle was opened
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-pink-50 pb-8">
      <div className="max-w-md mx-auto px-4">
        {/* Header - Live Counter */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 bg-white shadow-lg rounded-b-3xl p-4 -mx-4 mb-6"
        >
          <h2 className="text-2xl font-black text-gray-800 text-center mb-3">🗝️ קיר המפתחות</h2>
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ scale: circleCounts.boyCount > circleCounts.girlCount ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.5 }}
              className="flex-1 bg-gradient-to-br from-blue-100 to-blue-200 px-4 py-3 rounded-2xl text-center border-2 border-blue-400"
            >
              <div className="text-2xl font-black text-blue-600">{circleCounts.boyCount}</div>
              <div className="text-xs text-blue-600">💙 בן</div>
            </motion.div>
            <motion.div
              animate={{ scale: circleCounts.girlCount > circleCounts.boyCount ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.5 }}
              className="flex-1 bg-gradient-to-br from-pink-100 to-pink-200 px-4 py-3 rounded-2xl text-center border-2 border-pink-400"
            >
              <div className="text-2xl font-black text-pink-600">{circleCounts.girlCount}</div>
              <div className="text-xs text-pink-600">💗 בת</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Current Player Turn */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-3xl p-5 mb-6 text-center text-white shadow-xl ${
            isMyTurn
              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : 'bg-gradient-to-r from-purple-400 to-pink-400'
          }`}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-4xl mb-2"
          >
            {isMyTurn ? '🎯' : '👤'}
          </motion.div>
          <h2 className="text-2xl font-black mb-1">
            {isMyTurn ? 'התור שלך!' : `תור של ${currentPlayer?.name}`}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-3xl font-black">{currentPlayer?.keys || 0}</span>
            <span className="text-lg">🗝️ מפתחות</span>
          </div>
        </motion.div>

        {/* Board Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-4 shadow-xl mb-6"
        >
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            }}
          >
            {displayBoard.map((circle) => (
              <div
                key={circle.index}
                onClick={() => !circle.opened && isMyTurn && canOpenMore && setSelectedCircle(circle.index)}
                className={`
                  transition-all cursor-pointer
                  ${selectedCircle === circle.index ? 'ring-4 ring-yellow-400 rounded-full scale-105' : ''}
                  ${!isMyTurn || !canOpenMore ? 'cursor-not-allowed opacity-50' : ''}
                `}
              >
                <KeyCircle
                  number={circle.index + 1}
                  opened={circle.opened}
                  gender={circle.gender}
                  canOpen={isMyTurn && canOpenMore && !circle.opened}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Open Button */}
        {showOpenButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenCircle}
              disabled={selectedCircle === null}
              className={`
                w-full py-5 rounded-full text-2xl font-black shadow-2xl transition-all
                ${selectedCircle !== null
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {selectedCircle !== null ? (
                <>
                  🔓 פתח עיגול #{selectedCircle + 1}
                </>
              ) : (
                '👆 בחר עיגול לפתיחה'
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Next Turn Button (Admin only, after player opened or if player has no keys) */}
        {isAdmin && (currentPlayer?.keys === 0 || gameState === GAME_STATES.BOARD_OPENED) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={nextPlayerTurn}
              className="w-full py-5 rounded-full text-2xl font-black shadow-2xl bg-gradient-to-r from-blue-400 to-purple-500 text-white"
            >
              ⏭️ שחקן הבא
            </motion.button>
          </motion.div>
        )}

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-5 shadow-lg mb-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">📊 התקדמות</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm text-gray-700 mb-2">
                <span>עיגולים שנפתחו</span>
                <span className="font-bold">{openedCircles.length}/{boardSize}</span>
              </div>
              <div className="w-full bg-white rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(openedCircles.length / boardSize) * 100}%` }}
                  className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 h-3 rounded-full"
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Players Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-5 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">👥 שחקנים</h3>
          <div className="space-y-3">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`rounded-2xl p-3 ${
                  player.id === currentPlayer?.id
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {player.id === currentPlayer?.id && (
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-2xl"
                      >
                        👉
                      </motion.span>
                    )}
                    <span className="font-bold text-gray-800 truncate">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-lg font-black text-blue-500">{player.score || 0}</div>
                      <div className="text-xs text-gray-600">נקודות</div>
                    </div>
                    <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1">
                      <span className="font-black text-lg">{player.keys}</span>
                      <span className="text-lg">🗝️</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default KeyBoardStageMultiplayer;
