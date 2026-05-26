import React, { useState } from 'react';
import { motion } from 'framer-motion';

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  phase,
  onAnswer,
  canAnswer,
  showResult,
  selectedAnswer,
  correctAnswer
}) => {
  const [hoveredOption, setHoveredOption] = useState(null);

  const handleOptionClick = (index) => {
    if (!canAnswer || showResult) return;
    onAnswer(index);
  };

  const getOptionStyle = (index) => {
    if (!showResult) {
      if (canAnswer) {
        return hoveredOption === index
          ? 'bg-primary-blue/50 border-primary-blue scale-105'
          : 'bg-white/10 border-white/30 hover:bg-white/20';
      }
      return 'bg-white/5 border-white/20 cursor-not-allowed opacity-50';
    }

    // Show results
    if (index === correctAnswer) {
      return 'bg-green-500 border-green-400 animate-bounce';
    }
    if (index === selectedAnswer && index !== correctAnswer) {
      return 'bg-red-500 border-red-400 animate-shake';
    }
    return 'bg-white/10 border-white/30 opacity-50';
  };

  const letters = ['א', 'ב', 'ג', 'ד'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border-2 border-white/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-lg font-semibold">
          שאלה {questionNumber} מתוך {totalQuestions}
        </div>
        {phase === 'open_for_all' && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="bg-yellow-500 text-black px-4 py-2 rounded-full font-bold"
          >
            ⚡ הכל פתוח!
          </motion.div>
        )}
      </div>

      {/* Question Text */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center leading-relaxed">
          {question.text}
        </h2>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleOptionClick(index)}
            onHoverStart={() => canAnswer && setHoveredOption(index)}
            onHoverEnd={() => setHoveredOption(null)}
            disabled={!canAnswer || showResult}
            whileHover={canAnswer && !showResult ? { scale: 1.05 } : {}}
            whileTap={canAnswer && !showResult ? { scale: 0.95 } : {}}
            className={`
              p-6 rounded-xl border-2 transition-all duration-300
              ${getOptionStyle(index)}
              ${canAnswer && !showResult ? 'cursor-pointer' : ''}
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold
                ${showResult && index === correctAnswer ? 'bg-white text-green-500' : 'bg-white/20'}
              `}>
                {letters[index]}
              </div>
              <div className="text-xl font-semibold text-right flex-1">
                {option}
              </div>
              {showResult && index === correctAnswer && (
                <span className="text-3xl">✅</span>
              )}
              {showResult && index === selectedAnswer && index !== correctAnswer && (
                <span className="text-3xl">❌</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Result Message */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mt-6 p-4 rounded-xl text-center text-xl font-bold ${
            selectedAnswer === correctAnswer
              ? 'bg-green-500/30 text-green-100'
              : 'bg-red-500/30 text-red-100'
          }`}
        >
          {selectedAnswer === correctAnswer ? (
            <span>🎉 תשובה נכונה! מקבל מפתח 🗝️</span>
          ) : (
            <span>😔 תשובה שגויה. התשובה הנכונה: {letters[correctAnswer]}</span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuestionCard;
