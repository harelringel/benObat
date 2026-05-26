import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import questionsBank from '../data/questions.json';

const QuestionManager = ({ onClose, onQuestionsUpdate, mode = 'edit', initialQuestions = [], onSelectQuestions, requiredCount = 10 }) => {
  const [questions, setQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correct: 0,
    category: 'general'
  });

  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions([...initialQuestions]);
    } else {
      setQuestions([...questionsBank]);
    }
  }, [initialQuestions]);

  const handleSave = () => {
    if (!currentQuestion.text.trim()) {
      alert('Please enter a question');
      return;
    }

    if (currentQuestion.options.some(a => !a.trim())) {
      alert('Please fill all answer options');
      return;
    }

    if (editingIndex !== null) {
      // Edit existing
      const updated = [...questions];
      updated[editingIndex] = currentQuestion;
      setQuestions(updated);
      setEditingIndex(null);
    } else {
      // Add new
      setQuestions([...questions, currentQuestion]);
      setIsAdding(false);
    }

    // Reset form
    setCurrentQuestion({
      text: '',
      options: ['', '', '', ''],
      correct: 0,
      category: 'general'
    });
  };

  const handleEdit = (index) => {
    setCurrentQuestion({...questions[index]});
    setEditingIndex(index);
    setIsAdding(true);
  };

  const handleDelete = (index) => {
    if (window.confirm('Delete this question?')) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleAnswerChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({...currentQuestion, options: newOptions});
  };

  const handleToggleSelect = (index) => {
    const question = questions[index];
    const isSelected = selectedQuestions.some(q => q === question);

    if (isSelected) {
      setSelectedQuestions(selectedQuestions.filter(q => q !== question));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  const handleApply = () => {
    if (mode === 'select') {
      // In select mode, apply selected questions
      if (onSelectQuestions) {
        onSelectQuestions(selectedQuestions);
      }
    } else {
      // In edit mode, update the question bank
      if (onQuestionsUpdate) {
        onQuestionsUpdate(questions);
      }
    }
    onClose();
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setCurrentQuestion({
      text: '',
      options: ['', '', '', ''],
      correct: 0,
      category: 'general'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className={`p-6 text-white ${mode === 'select' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-purple-400 to-pink-400'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black">{mode === 'select' ? 'בחירת שאלות' : 'Question Manager'}</h2>
              <p className={mode === 'select' ? 'text-blue-100' : 'text-purple-100'}>
                {mode === 'select' ? `בחר ${requiredCount} שאלות למשחק` : 'View, edit, or add questions'}
              </p>
              {mode === 'select' && (
                <p className={`mt-1 font-bold ${selectedQuestions.length >= requiredCount ? 'text-green-200' : 'text-white'}`}>
                  נבחרו: {selectedQuestions.length} / {requiredCount}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {!isAdding ? (
              /* List View */
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xl font-bold text-gray-800">
                      {mode === 'select' ? `שאלות זמינות: ${questions.length}` : `Total Questions: ${questions.length}`}
                    </p>
                  </div>
                  {mode === 'edit' && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsAdding(true)}
                      className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-lg"
                    >
                      ➕ Add New Question
                    </motion.button>
                  )}
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {questions.map((q, index) => {
                    const isSelected = selectedQuestions.some(sq => sq === q);
                    return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => mode === 'select' && handleToggleSelect(index)}
                      className={`rounded-2xl p-5 hover:shadow-lg transition-all ${
                        mode === 'select' ? 'cursor-pointer' : ''
                      } ${
                        isSelected && mode === 'select' ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {mode === 'select' && (
                          <div className="flex items-center pt-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(index)}
                              className="w-6 h-6 text-blue-500 rounded"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
                              {q.category}
                            </span>
                            <span className="text-gray-500 text-sm">#{index + 1}</span>
                          </div>
                          <p className="text-lg font-bold text-gray-800 mb-3">{q.text}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((answer, aIndex) => (
                              <div
                                key={aIndex}
                                className={`p-2 rounded-lg text-sm ${
                                  aIndex === q.correct
                                    ? 'bg-green-100 text-green-800 font-semibold'
                                    : 'bg-white text-gray-600'
                                }`}
                              >
                                {aIndex === q.correct && '✓ '}{answer}
                              </div>
                            ))}
                          </div>
                        </div>
                        {mode === 'edit' && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleEdit(index)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(index)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                  })}
                </div>
              </motion.div>
            ) : (
              /* Add/Edit Form */
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <h3 className="text-2xl font-black text-gray-800 mb-6">
                  {editingIndex !== null ? 'Edit Question' : 'Add New Question'}
                </h3>

                {/* Category */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select
                    value={currentQuestion.category}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, category: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                  >
                    <option value="general">General</option>
                    <option value="science">Science</option>
                    <option value="geography">Geography</option>
                    <option value="sports">Sports</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="history">History</option>
                  </select>
                </div>

                {/* Question */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Question</label>
                  <input
                    type="text"
                    value={currentQuestion.text}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                    placeholder="Enter your question..."
                  />
                </div>

                {/* Answers */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Answers (click radio button to set correct answer)</label>
                  <div className="space-y-3">
                    {currentQuestion.options.map((answer, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="correct"
                          checked={currentQuestion.correct === index}
                          onChange={() => setCurrentQuestion({...currentQuestion, correct: index})}
                          className="w-5 h-5 text-green-500"
                        />
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                          placeholder={`Answer ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white py-4 rounded-full font-bold text-lg shadow-lg"
                  >
                    💾 Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-full font-bold text-lg"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <button
            onClick={handleApply}
            disabled={mode === 'select' && selectedQuestions.length < requiredCount}
            className={`w-full py-4 rounded-full font-bold text-xl shadow-lg transition-all ${
              mode === 'select'
                ? selectedQuestions.length >= requiredCount
                  ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
            }`}
          >
            {mode === 'select'
              ? selectedQuestions.length >= requiredCount
                ? `✅ אישור ${selectedQuestions.length} שאלות`
                : `בחר עוד ${requiredCount - selectedQuestions.length} שאלות`
              : '✅ Apply & Close'
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuestionManager;
