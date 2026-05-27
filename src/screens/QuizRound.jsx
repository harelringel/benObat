import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/gameStore';
import useSocketGameStore from '../store/socketGameStore';
import Timer from '../components/QuizGame/Timer';
import QuestionCard from '../components/QuizGame/QuestionCard';

const QuizRound = () => {
  // Try socket store first (multiplayer), fallback to game store (single player)
  const socketStore = useSocketGameStore();
  const gameStore = useGameStore();

  // Use socket store if it has a current question (multiplayer mode)
  const isMultiplayer = !!socketStore.currentQuestion;

  const store = isMultiplayer ? socketStore : gameStore;

  const {
    players,
    currentQuestionIndex,
    currentPlayerIndex,
    quizPhase,
    timeLeft,
    currentAnswerer,
  } = store;

  // For multiplayer, currentQuestion comes directly from socket
  // For single player, it comes from selectedQuestions array
  const currentQuestion = isMultiplayer
    ? socketStore.currentQuestion
    : gameStore.selectedQuestions[currentQuestionIndex];

  // Total questions count
  const totalQuestions = isMultiplayer
    ? socketStore.numQuestions
    : gameStore.totalQuestions;

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showingResult, setShowingResult] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  const answeringPlayer = players.find(p => p.id === currentAnswerer);

  // Timer countdown (only for single player mode)
  useEffect(() => {
    if (!isMultiplayer && quizPhase === 'answering' && !showingResult) {
      const timer = setInterval(() => {
        gameStore.decrementTime();
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isMultiplayer, quizPhase, showingResult, gameStore]);

  const handleStartAnswering = async () => {
    if (isMultiplayer) {
      // Multiplayer: buzz in via socket
      await socketStore.buzzIn();
    } else {
      // Single player: local state
      if (quizPhase === 'waiting') {
        gameStore.startAnswering(currentPlayer.id);
      } else if (quizPhase === 'open_for_all') {
        gameStore.startAnswering(currentPlayer.id);
      }
    }
  };

  const handleAnswer = async (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowingResult(true);

    if (isMultiplayer) {
      // Multiplayer: submit via socket
      await socketStore.submitAnswer(answerIndex);
      // Server will handle timing and next question
      setTimeout(() => {
        setShowingResult(false);
        setSelectedAnswer(null);
      }, 3000);
    } else {
      // Single player: local state
      gameStore.submitAnswer(answerIndex);
      setTimeout(() => {
        setShowingResult(false);
        setSelectedAnswer(null);
        gameStore.nextQuestion();
      }, 3000);
    }
  };

  const handleTimerExpire = () => {
    if (!isMultiplayer) {
      // Single player: call local store
      gameStore.openForAll();
    }
    // For multiplayer, server handles this automatically
  };

  const canCurrentPlayerAnswer =
    (quizPhase === 'waiting' && !currentAnswerer) ||
    (quizPhase === 'open_for_all' && !currentAnswerer) ||
    (currentAnswerer === currentPlayer?.id && quizPhase === 'answering');

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 pb-8">
      <div className="max-w-md mx-auto px-4">
        {/* Progress Bar at Top */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="sticky top-0 z-20 bg-white shadow-lg py-3 px-4 -mx-4 mb-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">שאלה {currentQuestionIndex + 1}/{totalQuestions}</span>
            {quizPhase === 'answering' && !showingResult && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-2"
              >
                <span className="text-2xl font-black text-red-500">{timeLeft}</span>
                <span className="text-sm text-gray-600">שניות</span>
              </motion.div>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 h-2 rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Current Turn Info */}
        <AnimatePresence mode="wait">
          {quizPhase === 'waiting' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-3xl p-6 text-center text-white shadow-xl mb-6"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-5xl mb-2"
              >
                🎯
              </motion.div>
              <h2 className="text-2xl font-black mb-1">
                תור של {currentPlayer.name}
              </h2>
              <p className="text-blue-100">לחץ "אני עונה" להתחיל</p>
            </motion.div>
          )}

          {quizPhase === 'open_for_all' && !currentAnswerer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-6 text-center text-white shadow-xl mb-6"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-5xl mb-2"
              >
                ⚡
              </motion.div>
              <h2 className="text-2xl font-black mb-1 animate-pulse">
                פתוח לכולם!
              </h2>
              <p className="text-yellow-100">מי יהיה ראשון?</p>
            </motion.div>
          )}

          {currentAnswerer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl p-6 text-center text-white shadow-xl mb-6"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-5xl mb-2"
              >
                🤔
              </motion.div>
              <h2 className="text-2xl font-black">
                {answeringPlayer?.name} עונה...
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          phase={quizPhase}
          onAnswer={handleAnswer}
          canAnswer={canCurrentPlayerAnswer && quizPhase === 'answering' && !showingResult}
          showResult={showingResult}
          selectedAnswer={selectedAnswer}
          correctAnswer={currentQuestion.correct}
        />

        {/* Answer Button */}
        {!currentAnswerer && quizPhase !== 'result' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleStartAnswering}
              className="w-full py-5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-2xl font-black shadow-2xl flex items-center justify-center gap-3"
            >
              <span className="text-3xl">🙋</span>
              אני עונה!
            </motion.button>
          </motion.div>
        )}

        {/* Timer - Mobile Optimized */}
        {quizPhase === 'answering' && !showingResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 bg-white rounded-3xl p-6 shadow-xl text-center"
          >
            <h3 className="text-lg font-bold text-gray-700 mb-3">⏱️ זמן נותר</h3>
            <Timer
              seconds={timeLeft}
              onExpire={handleTimerExpire}
              isActive={!showingResult}
            />
          </motion.div>
        )}

        {/* Players Mini Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-white rounded-3xl p-5 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">🗝️ מפתחות</h3>
          <div className="grid grid-cols-2 gap-3">
            {[...players]
              .sort((a, b) => b.keys - a.keys)
              .map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-2xl p-3 ${
                    index === 0 && player.keys > 0
                      ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {index === 0 && player.keys > 0 && <span className="text-lg">👑</span>}
                      <span className="font-bold text-gray-800 truncate text-sm">
                        {player.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1">
                      <span className="font-black text-lg">{player.keys}</span>
                      <span className="text-lg">🗝️</span>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* Current Player Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-5 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600 mb-1">שחקן פעיל</div>
              <div className="text-xl font-black text-gray-800">{currentPlayer.name}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-black text-blue-500">{currentPlayer.score}</div>
                <div className="text-xs text-gray-600">נקודות</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-yellow-500">{currentPlayer.keys}</div>
                <div className="text-xs text-gray-600">מפתחות</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizRound;
