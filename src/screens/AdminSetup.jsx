import React, { useState } from 'react';
import useGameStore from '../store/gameStore';
import questionsBank from '../data/questions.json';

const AdminSetup = () => {
  const {
    babyGender,
    numPlayers,
    numQuestions,
    timerSeconds,
    boardSize,
    selectedQuestions,
    setBabyGender,
    setNumPlayers,
    setNumQuestions,
    setTimerSeconds,
    setBoardSize,
    setSelectedQuestions,
    startGame,
  } = useGameStore();

  const [questionMode, setQuestionMode] = useState('select'); // 'select', 'create', 'ai'
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correct: 0,
    category: '',
    difficulty: 'easy',
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchCategory, setSearchCategory] = useState('all');

  // Get unique categories (handle questions without category)
  const categories = ['all', ...new Set(questionsBank.map(q => q.category).filter(Boolean))];

  // Filter questions by category
  const filteredQuestions = searchCategory === 'all'
    ? questionsBank
    : questionsBank.filter(q => q.category === searchCategory);

  const handleQuestionToggle = (question) => {
    const questionIndex = selectedQuestions.findIndex(q =>
      q.text === question.text || (q.id && q.id === question.id)
    );
    if (questionIndex >= 0) {
      setSelectedQuestions(selectedQuestions.filter((_, i) => i !== questionIndex));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  const handleSelectRandomQuestions = () => {
    const shuffled = [...questionsBank].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numQuestions);
    setSelectedQuestions(selected);
  };

  const handleCreateQuestion = () => {
    if (!newQuestion.text || newQuestion.options.some(opt => !opt)) {
      alert('נא למלא את כל שדות השאלה');
      return;
    }

    const question = {
      id: Date.now(),
      ...newQuestion,
    };

    setSelectedQuestions([...selectedQuestions, question]);

    // Reset form
    setNewQuestion({
      text: '',
      options: ['', '', '', ''],
      correct: 0,
      category: '',
      difficulty: 'easy',
    });

    alert('השאלה נוספה בהצלחה!');
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt) {
      alert('נא להזין פרומפט ליצירת שאלות');
      return;
    }

    setIsGenerating(true);

    try {
      // This would call the Anthropic API
      // For now, we'll simulate it
      alert('יצירת שאלות עם AI דורשת מפתח API של Anthropic.\nבגרסה זו ניתן להשתמש ביצירה ידנית או בחירה מהבנק.');

      // TODO: Implement actual API call
      // const response = await fetch("https://api.anthropic.com/v1/messages", {...});

    } catch (error) {
      alert('שגיאה ביצירת שאלות: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartGame = () => {
    if (!babyGender) {
      alert('נא לבחור את מין העובר');
      return;
    }

    if (selectedQuestions.length < numQuestions) {
      alert(`נא לבחור לפחות ${numQuestions} שאלות`);
      return;
    }

    if (startGame()) {
      // Game started successfully
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-12">
          🍼 הגדרת משחק גילוי מין 🎮
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Basic Settings */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-6">הגדרות בסיסיות</h2>

            {/* Gender Selection */}
            <div className="mb-6">
              <label className="block text-xl font-semibold mb-3">מין העובר (סודי!)</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setBabyGender('boy')}
                  className={`flex-1 py-4 px-6 rounded-lg font-bold text-xl transition-all ${
                    babyGender === 'boy'
                      ? 'bg-primary-blue shadow-lg scale-105'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  👶 בן 💙
                </button>
                <button
                  onClick={() => setBabyGender('girl')}
                  className={`flex-1 py-4 px-6 rounded-lg font-bold text-xl transition-all ${
                    babyGender === 'girl'
                      ? 'bg-primary-pink shadow-lg scale-105'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  👶 בת 💗
                </button>
              </div>
            </div>

            {/* Number of Players */}
            <div className="mb-6">
              <label className="block text-xl font-semibold mb-3">מספר שחקנים</label>
              <select
                value={numPlayers}
                onChange={(e) => setNumPlayers(Number(e.target.value))}
                className="w-full py-3 px-4 rounded-lg bg-white/20 text-white text-lg"
              >
                {[2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num} className="text-gray-900">{num}</option>
                ))}
              </select>
            </div>

            {/* Number of Questions */}
            <div className="mb-6">
              <label className="block text-xl font-semibold mb-3">מספר שאלות</label>
              <input
                type="number"
                min="5"
                max="15"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full py-3 px-4 rounded-lg bg-white/20 text-white text-lg"
              />
            </div>

            {/* Timer */}
            <div className="mb-6">
              <label className="block text-xl font-semibold mb-3">זמן לשאלה (שניות)</label>
              <input
                type="number"
                min="10"
                max="60"
                value={timerSeconds}
                onChange={(e) => setTimerSeconds(Number(e.target.value))}
                className="w-full py-3 px-4 rounded-lg bg-white/20 text-white text-lg"
              />
            </div>

            {/* Board Size */}
            <div className="mb-6">
              <label className="block text-xl font-semibold mb-3">גודל לוח מפתחות</label>
              <div className="flex gap-4">
                {[9, 16, 25].map(size => (
                  <button
                    key={size}
                    onClick={() => setBoardSize(size)}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
                      boardSize === size
                        ? 'bg-gold shadow-lg scale-105'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {Math.sqrt(size)}×{Math.sqrt(size)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Question Management */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-6">ניהול שאלות</h2>

            {/* Question Mode Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setQuestionMode('select')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  questionMode === 'select'
                    ? 'bg-primary-blue'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                בחירה מבנק
              </button>
              <button
                onClick={() => setQuestionMode('create')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  questionMode === 'create'
                    ? 'bg-primary-blue'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                יצירה ידנית
              </button>
              <button
                onClick={() => setQuestionMode('ai')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  questionMode === 'ai'
                    ? 'bg-primary-blue'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                יצירה עם AI
              </button>
            </div>

            {/* Select from Bank */}
            {questionMode === 'select' && (
              <div>
                <div className="mb-4 flex gap-4">
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="flex-1 py-2 px-4 rounded-lg bg-white/20 text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="text-gray-900">
                        {cat === 'all' ? 'כל הקטגוריות' : cat}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSelectRandomQuestions}
                    className="py-2 px-6 bg-gold hover:bg-yellow-600 rounded-lg font-semibold transition-all"
                  >
                    בחר {numQuestions} אקראיות
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredQuestions.map(question => (
                    <div
                      key={question.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedQuestions.find(q => q.id === question.id)
                          ? 'bg-green-500/30 border-2 border-green-400'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                      onClick={() => handleQuestionToggle(question)}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={!!selectedQuestions.find(q => q.id === question.id)}
                          readOnly
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold">{question.text}</p>
                          <p className="text-sm text-gray-300">
                            {question.category} • {question.difficulty}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Manually */}
            {questionMode === 'create' && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="שאלה"
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  className="w-full py-2 px-4 rounded-lg bg-white/20 text-white placeholder-gray-300"
                />

                {newQuestion.options.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`תשובה ${['א', 'ב', 'ג', 'ד'][idx]}`}
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...newQuestion.options];
                      newOptions[idx] = e.target.value;
                      setNewQuestion({ ...newQuestion, options: newOptions });
                    }}
                    className="w-full py-2 px-4 rounded-lg bg-white/20 text-white placeholder-gray-300"
                  />
                ))}

                <div className="flex gap-4">
                  <select
                    value={newQuestion.correct}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correct: Number(e.target.value) })}
                    className="flex-1 py-2 px-4 rounded-lg bg-white/20 text-white"
                  >
                    {['א', 'ב', 'ג', 'ד'].map((letter, idx) => (
                      <option key={idx} value={idx} className="text-gray-900">
                        תשובה נכונה: {letter}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="קטגוריה"
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                    className="flex-1 py-2 px-4 rounded-lg bg-white/20 text-white placeholder-gray-300"
                  />
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                    className="flex-1 py-2 px-4 rounded-lg bg-white/20 text-white"
                  >
                    <option value="easy" className="text-gray-900">קל</option>
                    <option value="medium" className="text-gray-900">בינוני</option>
                    <option value="hard" className="text-gray-900">קשה</option>
                  </select>
                </div>

                <button
                  onClick={handleCreateQuestion}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-all"
                >
                  הוסף שאלה לרשימה
                </button>
              </div>
            )}

            {/* AI Generation */}
            {questionMode === 'ai' && (
              <div className="space-y-4">
                <textarea
                  placeholder='לדוגמה: "תצור לי 5 שאלות על ישראל ברמה בינונית"'
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full h-32 py-2 px-4 rounded-lg bg-white/20 text-white placeholder-gray-300"
                />
                <button
                  onClick={handleGenerateWithAI}
                  disabled={isGenerating}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    isGenerating
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-purple-500 hover:bg-purple-600'
                  }`}
                >
                  {isGenerating ? '⏳ מייצר שאלות...' : '🤖 צור שאלות עם AI'}
                </button>
                <p className="text-sm text-gray-300 text-center">
                  * דורש מפתח API של Anthropic
                </p>
              </div>
            )}

            {/* Selected Questions Counter */}
            <div className="mt-6 p-4 bg-white/20 rounded-lg text-center">
              <p className="text-2xl font-bold">
                נבחרו {selectedQuestions.length} מתוך {numQuestions} שאלות
              </p>
            </div>
          </div>
        </div>

        {/* Start Game Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleStartGame}
            className="py-4 px-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-full text-2xl font-bold shadow-2xl transition-all transform hover:scale-105"
          >
            🎮 התחל משחק! 🎮
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
