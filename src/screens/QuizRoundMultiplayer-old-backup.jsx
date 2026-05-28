import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSocketGameStore from '../store/socketGameStore';

const QuizRoundMultiplayer = () => {
  const {
    currentQuestion,
    currentQuestionIndex,
    numQuestions,
    players,
    currentPlayerIndex,
    currentAnswerer,
    currentUserId,
    quizPhase,
    timeLeft,
    submitAnswer
  } = useSocketGameStore();

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showingResult, setShowingResult] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = currentAnswerer === currentUserId;
  const canAnswer = (quizPhase === 'answering' && isMyTurn) || quizPhase === 'open_for_all';

  const handleAnswer = async (answerIndex) => {
    if (!canAnswer || showingResult) return;

    setSelectedAnswer(answerIndex);
    setShowingResult(true);

    await submitAnswer(answerIndex);

    setTimeout(() => {
      setShowingResult(false);
      setSelectedAnswer(null);
    }, 3000);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-purple-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">טוען שאלה...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-8 transition-all duration-500 ${
      quizPhase === 'open_for_all'
        ? 'bg-gradient-to-b from-yellow-100 via-orange-50 to-red-50'
        : 'bg-gradient-to-b from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-md mx-auto px-4">

        {/* PROMINENT TIMER - Always visible */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className={`sticky top-0 z-20 py-6 mb-6 rounded-b-3xl shadow-2xl transition-all duration-500 ${
            quizPhase === 'open_for_all'
              ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400'
              : timeLeft <= 10
              ? 'bg-gradient-to-r from-red-400 to-pink-500'
              : 'bg-gradient-to-r from-blue-400 to-purple-500'
          }`}
        >
          <div className="text-center">
            {quizPhase === 'open_for_all' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-7xl mb-3"
              >
                ⚡
              </motion.div>
            )}
            <motion.div
              animate={{
                scale: timeLeft <= 5 ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
              className="text-8xl font-black text-white mb-2"
            >
              {timeLeft}
            </motion.div>
            <div className="text-2xl font-bold text-white">
              {quizPhase === 'open_for_all' ? '🔥 פתוח לכולם! 🔥' : 'שניות נותרו'}
            </div>
            {quizPhase === 'answering' && currentPlayer && (
              <div className="text-lg text-white/90 mt-2">
                תור של {currentPlayer.name}
              </div>
            )}
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

        {/* Open For All Banner */}
        <AnimatePresence>
          {quizPhase === 'open_for_all' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-6 text-center shadow-2xl mb-6"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-6xl mb-2"
              >
                🏃‍♂️💨
              </motion.div>
              <h2 className="text-3xl font-black text-white mb-2">
                מהרו לענות!
              </h2>
              <p className="text-xl text-white/90">
                כל מי שיענה נכון יזכה במפתח! 🗝️
              </p>
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
              const isCorrect = index === currentQuestion.correct;
              const showCorrect = showingResult && isCorrect;
              const showWrong = showingResult && isSelected && !isCorrect;

              return (
                <motion.button
                  key={index}
                  whileHover={canAnswer && !showingResult ? { scale: 1.02 } : {}}
                  whileTap={canAnswer && !showingResult ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(index)}
                  disabled={!canAnswer || showingResult}
                  className={`w-full p-5 rounded-2xl font-bold text-lg transition-all shadow-lg ${
                    showCorrect
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                      : showWrong
                      ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                      : canAnswer && !showingResult
                      ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white hover:from-blue-500 hover:to-purple-500'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {showCorrect && '✓ '}
                  {showWrong && '✗ '}
                  {option}
                </motion.button>
              );
            })}
          </div>

          {!canAnswer && !showingResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center text-gray-500 text-sm"
            >
              {quizPhase === 'answering' ? (
                <>⏳ המתן לתורך או שהשאלה תיפתח לכולם...</>
              ) : (
                <>👀 צופה...</>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Players Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl shadow-lg p-5"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
            🗝️ מפתחות
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {players.map((player) => (
              <div
                key={player.id}
                className={`p-3 rounded-xl font-bold transition-all ${
                  player.id === currentAnswerer
                    ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white scale-105'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{player.name}</span>
                  <span className="text-2xl ml-2">{player.keys} 🗝️</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizRoundMultiplayer;
