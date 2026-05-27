import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useSocketGameStore from '../store/socketGameStore';
import defaultQuestionsData from '../data/default-questions.json';
import QuestionManagerEnhanced from './QuestionManagerEnhanced';

const questionsBank = defaultQuestionsData.questions;

const QUESTIONS_STORAGE_KEY = 'benorbat_custom_questions';
const QUESTIONS_VERSION_KEY = 'benorbat_questions_version';
const CURRENT_QUESTIONS_VERSION = '2.0'; // Updated with 20 custom questions from docx

const AdminSetupMultiplayer = () => {
  const {
    babyGender,
    numPlayers,
    numQuestions,
    boardSize,
    selectedQuestions,
    setBabyGender,
    setNumPlayers,
    setNumQuestions,
    setBoardSize,
    setSelectedQuestions,
    createRoom,
  } = useSocketGameStore();

  const [step, setStep] = useState(1); // 1=gender, 2=settings, 3=questions
  const [showQuestionManager, setShowQuestionManager] = useState(false);
  const [questionManagerMode, setQuestionManagerMode] = useState('edit');
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // Load custom questions from localStorage on mount
  useEffect(() => {
    const storedVersion = localStorage.getItem(QUESTIONS_VERSION_KEY);

    // Force reload if version changed or no version found
    if (storedVersion !== CURRENT_QUESTIONS_VERSION) {
      console.log('Loading new questions version:', CURRENT_QUESTIONS_VERSION);
      localStorage.setItem(QUESTIONS_VERSION_KEY, CURRENT_QUESTIONS_VERSION);
      localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(questionsBank));
      setAvailableQuestions([...questionsBank]);
    } else {
      // Load from localStorage if same version
      const stored = localStorage.getItem(QUESTIONS_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setAvailableQuestions(parsed);
        } catch (e) {
          console.error('Failed to parse stored questions:', e);
          setAvailableQuestions([...questionsBank]);
        }
      } else {
        setAvailableQuestions([...questionsBank]);
      }
    }
  }, []);

  // Auto-select random questions when reaching step 3
  useEffect(() => {
    if (step === 3 && availableQuestions.length > 0 && selectedQuestions.length === 0) {
      const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, numQuestions);
      setSelectedQuestions(selected);
    }
  }, [step, availableQuestions, selectedQuestions.length, numQuestions, setSelectedQuestions]);

  const handleSelectRandomQuestions = () => {
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numQuestions);
    setSelectedQuestions(selected);
  };

  const handleQuestionsUpdate = (updatedQuestions) => {
    setAvailableQuestions(updatedQuestions);
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(updatedQuestions));
  };

  const handleSelectQuestions = (selected) => {
    setSelectedQuestions(selected);
  };

  const openQuestionManager = (mode) => {
    setQuestionManagerMode(mode);
    setShowQuestionManager(true);
  };

  const handleStartGame = async () => {
    if (!babyGender) {
      alert('נא לבחור את מין העובר');
      return;
    }

    if (selectedQuestions.length < numQuestions) {
      alert(`נא לבחור לפחות ${numQuestions} שאלות`);
      return;
    }

    setCreating(true);
    setError(null);

    const result = await createRoom();

    if (result.success) {
      // Room created successfully - state will transition via store
    } else {
      setError(result.error);
    }

    setCreating(false);
  };

  // Step 1: Gender Selection
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="text-6xl mb-4">👶</div>
            <h1 className="text-3xl font-black text-gray-800 mb-2">
              מה מין העובר?
            </h1>
            <p className="text-gray-600">(זה יישאר סודי!)</p>
          </motion.div>

          <div className="space-y-4 mb-8">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setBabyGender('boy')}
              className={`w-full p-6 rounded-3xl transition-all ${
                babyGender === 'boy'
                  ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-2xl scale-105'
                  : 'bg-white text-gray-700 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <div className="text-2xl font-bold mb-1">בן</div>
                  <div className={`text-sm ${babyGender === 'boy' ? 'text-blue-100' : 'text-gray-500'}`}>
                    💙 Boy
                  </div>
                </div>
                <div className="text-5xl">👦</div>
              </div>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setBabyGender('girl')}
              className={`w-full p-6 rounded-3xl transition-all ${
                babyGender === 'girl'
                  ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-2xl scale-105'
                  : 'bg-white text-gray-700 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <div className="text-2xl font-bold mb-1">בת</div>
                  <div className={`text-sm ${babyGender === 'girl' ? 'text-pink-100' : 'text-gray-500'}`}>
                    💗 Girl
                  </div>
                </div>
                <div className="text-5xl">👧</div>
              </div>
            </motion.button>
          </div>

          {babyGender && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep(2)}
              className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-xl py-5 rounded-full shadow-xl"
            >
              המשך ←
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Game Settings
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-pink-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <button
            onClick={() => setStep(1)}
            className="mb-4 text-gray-600 flex items-center gap-2"
          >
            ← חזרה
          </button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="text-6xl mb-4">⚙️</div>
            <h1 className="text-3xl font-black text-gray-800 mb-2">
              הגדרות משחק
            </h1>
          </motion.div>

          <div className="space-y-4 mb-8">
            {/* Number of Players */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-lg font-bold text-gray-800">מספר שחקנים</div>
                  <div className="text-sm text-gray-500">2-8 שחקנים</div>
                </div>
                <div className="text-4xl">👥</div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[2, 3, 4, 5, 6, 7, 8].map(num => (
                  <button
                    key={num}
                    onClick={() => setNumPlayers(num)}
                    className={`flex-1 min-w-[60px] py-3 rounded-2xl font-bold transition-all ${
                      numPlayers === num
                        ? 'bg-blue-500 text-white shadow-lg scale-110'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Questions */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-lg font-bold text-gray-800">מספר שאלות</div>
                  <div className="text-sm text-gray-500">5-15 שאלות</div>
                </div>
                <div className="text-4xl">❓</div>
              </div>
              <input
                type="range"
                min="5"
                max="15"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-pink-200 to-blue-200 rounded-full appearance-none cursor-pointer"
              />
              <div className="text-center mt-3">
                <span className="text-3xl font-black text-blue-500">{numQuestions}</span>
                <span className="text-gray-500 mr-2">שאלות</span>
              </div>
            </div>

            {/* Board Size */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-lg font-bold text-gray-800">גודל לוח</div>
                  <div className="text-sm text-gray-500">מספר העיגולים</div>
                </div>
                <div className="text-4xl">🎯</div>
              </div>
              <div className="flex gap-3">
                {[9, 16, 25].map(size => (
                  <button
                    key={size}
                    onClick={() => setBoardSize(size)}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                      boardSize === size
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <div className="text-2xl font-black">{Math.sqrt(size)}×{Math.sqrt(size)}</div>
                    <div className="text-xs mt-1">{size} עיגולים</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep(3)}
            className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-xl py-5 rounded-full shadow-xl"
          >
            בחר שאלות ←
          </motion.button>
        </div>
      </div>
    );
  }

  // Step 3: Questions Selection
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 p-4 pb-24">
      <div className="max-w-md mx-auto pt-8">
        <button
          onClick={() => setStep(2)}
          className="mb-4 text-gray-600 flex items-center gap-2"
        >
          ← חזרה
        </button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">
            בחירת שאלות
          </h1>
          <div className="bg-white rounded-full inline-block px-6 py-2 shadow-lg">
            <span className="text-2xl font-bold text-purple-500">{selectedQuestions.length}</span>
            <span className="text-gray-600 mr-2">מתוך</span>
            <span className="text-2xl font-bold text-gray-800">{numQuestions}</span>
          </div>
        </motion.div>

        <div className="space-y-4 mb-8">
          {/* Quick Random Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSelectRandomQuestions}
            className="w-full bg-gradient-to-r from-purple-400 to-purple-500 text-white p-6 rounded-3xl shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="text-right">
                <div className="text-xl font-bold mb-1">🎲 בחירה אקראית</div>
                <div className="text-sm text-purple-100">בחר {numQuestions} שאלות אקראיות</div>
              </div>
              <div className="text-4xl">✨</div>
            </div>
          </motion.button>

          {/* Manual Selection Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => openQuestionManager('select')}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white p-6 rounded-3xl shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="text-right">
                <div className="text-xl font-bold mb-1">✅ בחירה ידנית</div>
                <div className="text-sm text-cyan-100">בחר שאלות ספציפיות מהרשימה</div>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </motion.button>

          {/* Manage Questions Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => openQuestionManager('edit')}
            className="w-full bg-gradient-to-r from-orange-400 to-red-400 text-white p-6 rounded-3xl shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="text-right">
                <div className="text-xl font-bold mb-1">⚙️ ניהול שאלות</div>
                <div className="text-sm text-orange-100">עריכה, הוספה, יצירה עם AI</div>
              </div>
              <div className="text-4xl">🔧</div>
            </div>
          </motion.button>

          {/* Selected Questions Count */}
          {selectedQuestions.length > 0 && (
            <div className="bg-green-100 rounded-3xl p-4 text-center">
              <div className="text-green-800 font-bold">
                ✅ נבחרו {selectedQuestions.length} שאלות!
              </div>
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-100 border-2 border-red-300 rounded-2xl p-4 mb-6">
            <p className="text-red-700 font-semibold text-center">❌ {error}</p>
          </div>
        )}

        {selectedQuestions.length >= numQuestions && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartGame}
            disabled={creating}
            className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-2xl py-6 rounded-full shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <>
                <span className="animate-spin">⏳</span>
                יוצר חדר...
              </>
            ) : (
              <>
                <span>🎮</span>
                צור חדר והתחל!
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Question Manager Modal */}
      {showQuestionManager && (
        <QuestionManagerEnhanced
          mode={questionManagerMode}
          onClose={() => setShowQuestionManager(false)}
          onQuestionsUpdate={handleQuestionsUpdate}
          onSelectQuestions={handleSelectQuestions}
          initialQuestions={availableQuestions}
          requiredCount={numQuestions}
        />
      )}
    </div>
  );
};

export default AdminSetupMultiplayer;
