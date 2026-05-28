import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSocketGameStore, { GAME_STATES } from '../store/socketGameStore';
import LeaveGameButton from '../components/LeaveGameButton';

const QuizRoundMultiplayer = () => {
  const {
    gameState,
    currentQuestion,
    currentQuestionIndex,
    numQuestions,
    players,
    currentUserId,
    remainingTimeMs,
    playerAnswers,
    reviewResults,
    correctAnswer,
    submitAnswer
  } = useSocketGameStore();

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Convert ms to seconds for display
  const timeLeftSeconds = Math.ceil(remainingTimeMs / 1000);

  // Reset state when new question starts
  useEffect(() => {
    if (gameState === GAME_STATES.ASKING) {
      setSelectedAnswer(null);
      setHasAnswered(false);
    }
  }, [gameState, currentQuestionIndex]);

  // Check if I've answered
  const iHaveAnswered = playerAnswers?.includes(currentUserId) || hasAnswered;

  // ASKING state - can answer
  const canAnswer = gameState === GAME_STATES.ASKING && !iHaveAnswered;

  const handleAnswer = async (answerIndex) => {
    if (!canAnswer) return;

    setSelectedAnswer(answerIndex);
    setHasAnswered(true);

    try {
      await submitAnswer(answerIndex);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setHasAnswered(false);
    }
  };

  // Find my result in review phase
  const myResult = reviewResults?.find(r => r.playerId === currentUserId);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-purple-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">טוען שאלה...</h1>
        </div>
      </div>
    );
  }

  // REVIEW STATE - Show correct answer and results
  if (gameState === GAME_STATES.REVIEW) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-green-50 pb-8">
        <div className="max-w-md mx-auto px-4">
          <LeaveGameButton />

          {/* Review Header */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-20 py-6 mb-6 rounded-b-3xl shadow-2xl bg-gradient-to-r from-green-400 to-emerald-500"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-7xl mb-3"
              >
                {myResult?.isCorrect ? '✅' : '❌'}
              </motion.div>
              <div className="text-3xl font-bold text-white mb-2">
                {myResult?.isCorrect ? 'תשובה נכונה!' : 'תשובה שגויה'}
              </div>
              <div className="text-lg text-white/90">
                ממשיכים לשאלה הבאה...
              </div>
            </div>
          </motion.div>

          {/* Question with Correct Answer Highlighted */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isCorrect = index === correctAnswer;
                const wasMyAnswer = selectedAnswer === index;

                return (
                  <div
                    key={index}
                    className={`w-full p-5 rounded-2xl font-bold text-lg shadow-lg ${
                      isCorrect
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                        : wasMyAnswer
                        ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCorrect && '✓ '}
                    {wasMyAnswer && !isCorrect && '✗ '}
                    {option}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Results Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-lg p-5"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
              תוצאות השאלה
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {players.map((player) => {
                const playerResult = reviewResults?.find(r => r.playerId === player.id);
                return (
                  <div
                    key={player.id}
                    className={`p-3 rounded-xl font-bold ${
                      playerResult?.isCorrect
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{player.name}</span>
                      <span className="text-2xl ml-2">
                        {playerResult?.isCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ASKING STATE - Answer questions
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 pb-8">
      <div className="max-w-md mx-auto px-4">
        <LeaveGameButton />

        {/* PROMINENT TIMER */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className={`sticky top-0 z-20 py-6 mb-6 rounded-b-3xl shadow-2xl transition-all duration-500 ${
            timeLeftSeconds <= 10
              ? 'bg-gradient-to-r from-red-400 to-pink-500'
              : 'bg-gradient-to-r from-blue-400 to-purple-500'
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
              שניות נותרו
            </div>
            <div className="text-sm text-white/80 mt-2">
              {playerAnswers?.length || 0} / {players.length} ענו
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl shadow-lg p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">
              שאלה {currentQuestionIndex + 1} מתוך {numQuestions}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / numQuestions) * 100}%` }}
              className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 h-2 rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Already Answered Banner */}
        <AnimatePresence>
          {iHaveAnswered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl p-4 text-center shadow-xl mb-6"
            >
              <div className="text-4xl mb-2">✓</div>
              <h2 className="text-xl font-bold text-white">
                עניתָ! ממתין לשאר השחקנים...
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;

              return (
                <motion.button
                  key={index}
                  whileHover={canAnswer ? { scale: 1.02 } : {}}
                  whileTap={canAnswer ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(index)}
                  disabled={!canAnswer}
                  className={`w-full p-5 rounded-2xl font-bold text-lg transition-all shadow-lg ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                      : canAnswer
                      ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white hover:from-blue-500 hover:to-purple-500'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>

          {!canAnswer && !iHaveAnswered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center text-gray-500 text-sm"
            >
              ⏳ מחכה למנהל להתחיל את השאלה...
            </motion.div>
          )}
        </motion.div>

        {/* Players Status - Show who answered */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl shadow-lg p-5"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
            🗝️ מפתחות
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {players.map((player) => {
              const hasPlayerAnswered = playerAnswers?.includes(player.id);

              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-xl font-bold transition-all ${
                    hasPlayerAnswered
                      ? 'bg-gradient-to-br from-green-400 to-emerald-400 text-white'
                      : player.connected
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 truncate">
                      {hasPlayerAnswered && <span>✓</span>}
                      <span className="truncate">{player.name}</span>
                      {!player.connected && (
                        <span className="text-xs">(מנותק)</span>
                      )}
                    </div>
                    <span className="text-2xl ml-2">{player.keysWon || 0} 🗝️</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizRoundMultiplayer;
