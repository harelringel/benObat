import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import questionsBank from '../data/questions.json';
import { generateQuestions, generateQuestionsPreset } from '../services/ai';
import mammoth from 'mammoth';

const QuestionManagerEnhanced = ({ onClose, onQuestionsUpdate, mode = 'edit', initialQuestions = [], onSelectQuestions, requiredCount = 10 }) => {
  const [questions, setQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('bank'); // 'bank', 'manual', 'ai'
  const [isAdding, setIsAdding] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // AI generation state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  // File import state
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [importedQuestions, setImportedQuestions] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correct: 0,
    category: 'general',
    difficulty: 'medium'
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
      alert('נא להזין שאלה');
      return;
    }

    if (currentQuestion.options.some(a => !a.trim())) {
      alert('נא למלא את כל התשובות');
      return;
    }

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = currentQuestion;
      setQuestions(updated);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, currentQuestion]);
      setIsAdding(false);
    }

    setCurrentQuestion({
      text: '',
      options: ['', '', '', ''],
      correct: 0,
      category: 'general',
      difficulty: 'medium'
    });
  };

  const handleEdit = (index) => {
    setCurrentQuestion({...questions[index]});
    setEditingIndex(index);
    setIsAdding(true);
    setActiveTab('manual');
  };

  const handleDelete = (index) => {
    if (window.confirm('למחוק שאלה זו?')) {
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
      if (onSelectQuestions) {
        onSelectQuestions(selectedQuestions);
      }
    } else {
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
      category: 'general',
      difficulty: 'medium'
    });
  };

  // AI Generation handlers
  const handleAIGenerate = async (usePreset = null) => {
    setAiLoading(true);
    setAiError(null);
    setGeneratedQuestions([]);

    try {
      let result;
      if (usePreset) {
        result = await generateQuestionsPreset(usePreset);
      } else {
        result = await generateQuestions({
          prompt: aiPrompt,
          count: aiCount,
          topic: aiTopic,
          difficulty: aiDifficulty
        });
      }

      setGeneratedQuestions(result);
    } catch (error) {
      console.error('AI generation error:', error);
      setAiError(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddAIQuestions = () => {
    setQuestions([...questions, ...generatedQuestions]);
    setGeneratedQuestions([]);
    setAiPrompt('');
    alert(`${generatedQuestions.length} שאלות נוספו בהצלחה!`);
  };

  // File import handler
  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      setFileError('נא להעלות קובץ Word בפורמט .docx');
      return;
    }

    setFileLoading(true);
    setFileError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      // Parse questions from text
      // Expected format: Each question block separated by empty lines
      // Question text followed by 4 options, with correct answer marked with *
      const questionBlocks = text.split(/\n\s*\n/).filter(block => block.trim());
      const parsed = [];

      for (const block of questionBlocks) {
        const lines = block.split('\n').filter(line => line.trim());
        if (lines.length < 5) continue; // Need at least question + 4 options

        const questionText = lines[0].trim();
        const options = lines.slice(1, 5).map(opt => opt.replace(/^[*\-•]\s*/, '').trim());

        // Find correct answer (marked with *)
        let correctIndex = lines.slice(1, 5).findIndex(line => line.trim().startsWith('*'));
        if (correctIndex === -1) correctIndex = 0; // Default to first option

        parsed.push({
          text: questionText,
          options: options,
          correct: correctIndex,
          category: 'imported',
          difficulty: 'medium'
        });
      }

      if (parsed.length === 0) {
        setFileError('לא נמצאו שאלות בקובץ. ודא שהפורמט נכון: שאלה ואחריה 4 תשובות (סמן תשובה נכונה עם *)');
        return;
      }

      setImportedQuestions(parsed);
    } catch (error) {
      console.error('File import error:', error);
      setFileError('שגיאה בקריאת הקובץ: ' + error.message);
    } finally {
      setFileLoading(false);
    }
  };

  const handleAddImportedQuestions = () => {
    setQuestions([...questions, ...importedQuestions]);
    setImportedQuestions([]);
    alert(`${importedQuestions.length} שאלות נוספו בהצלחה!`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className={`p-6 text-white ${mode === 'select' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-purple-400 to-pink-400'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black">{mode === 'select' ? 'בחירת שאלות' : 'מנהל שאלות מתקדם'}</h2>
              <p className={mode === 'select' ? 'text-blue-100' : 'text-purple-100'}>
                {mode === 'select' ? `בחר ${requiredCount} שאלות למשחק` : 'צפייה, עריכה, יצירה ידנית, או יצירה עם AI'}
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

        {/* Tabs (only in edit mode) */}
        {mode === 'edit' && !isAdding && (
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex">
              <button
                onClick={() => setActiveTab('bank')}
                className={`flex-1 py-4 px-6 font-bold transition-all ${
                  activeTab === 'bank'
                    ? 'bg-white text-purple-600 border-b-4 border-purple-500'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📚 בנק שאלות ({questions.length})
              </button>
              <button
                onClick={() => { setActiveTab('manual'); setIsAdding(true); }}
                className={`flex-1 py-4 px-6 font-bold transition-all ${
                  activeTab === 'manual'
                    ? 'bg-white text-blue-600 border-b-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ✏️ יצירה ידנית
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-4 px-6 font-bold transition-all ${
                  activeTab === 'ai'
                    ? 'bg-white text-green-600 border-b-4 border-green-500'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🤖 יצירה עם AI
              </button>
              <button
                onClick={() => setActiveTab('file')}
                className={`flex-1 py-4 px-6 font-bold transition-all ${
                  activeTab === 'file'
                    ? 'bg-white text-orange-600 border-b-4 border-orange-500'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📄 ייבוא מקובץ
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          <AnimatePresence mode="wait">
            {/* TAB 1: Bank Selection / Selection Mode */}
            {(activeTab === 'bank' || mode === 'select') && !isAdding && (
              <motion.div
                key="bank"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-6">
                  <p className="text-xl font-bold text-gray-800">
                    {mode === 'select' ? `שאלות זמינות: ${questions.length}` : `סך הכל שאלות: ${questions.length}`}
                  </p>
                </div>

                <div className="space-y-4">
                  {questions.map((q, index) => {
                    const isSelected = selectedQuestions.some(sq => sq === q);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
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
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                q.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                                q.difficulty === 'hard' ? 'bg-red-100 text-red-600' :
                                'bg-yellow-100 text-yellow-600'
                              }`}>
                                {q.difficulty}
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
                                ערוך
                              </button>
                              <button
                                onClick={() => handleDelete(index)}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                              >
                                מחק
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB 2: Manual Creation */}
            {activeTab === 'manual' && isAdding && mode === 'edit' && (
              <motion.div
                key="manual"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <h3 className="text-2xl font-black text-gray-800 mb-6">
                  {editingIndex !== null ? 'ערוך שאלה' : 'הוסף שאלה חדשה'}
                </h3>

                {/* Category */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">קטגוריה</label>
                  <select
                    value={currentQuestion.category}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, category: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                  >
                    <option value="general">כללי</option>
                    <option value="science">מדע</option>
                    <option value="geography">גיאוגרפיה</option>
                    <option value="sports">ספורט</option>
                    <option value="entertainment">בידור</option>
                    <option value="history">היסטוריה</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">רמת קושי</label>
                  <div className="flex gap-3">
                    {['easy', 'medium', 'hard'].map(level => (
                      <button
                        key={level}
                        onClick={() => setCurrentQuestion({...currentQuestion, difficulty: level})}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                          currentQuestion.difficulty === level
                            ? level === 'easy' ? 'bg-green-500 text-white' :
                              level === 'hard' ? 'bg-red-500 text-white' :
                              'bg-yellow-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {level === 'easy' ? 'קל' : level === 'medium' ? 'בינוני' : 'קשה'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">שאלה</label>
                  <input
                    type="text"
                    value={currentQuestion.text}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                    placeholder="הזן את השאלה..."
                  />
                </div>

                {/* Answers */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">תשובות (לחץ על הרדיו לסימון תשובה נכונה)</label>
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
                          placeholder={`תשובה ${index + 1}`}
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
                    💾 שמור
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-full font-bold text-lg"
                  >
                    ביטול
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 3: AI Generation */}
            {activeTab === 'ai' && mode === 'edit' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <h3 className="text-2xl font-black text-gray-800 mb-6">
                  🤖 יצירת שאלות עם בינה מלאכותית
                </h3>

                {/* Preset buttons */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">תבניות מהירות</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: 'easy', label: '5 שאלות קלות', icon: '😊' },
                      { key: 'medium', label: '5 שאלות בינוניות', icon: '🤔' },
                      { key: 'hard', label: '5 שאלות קשות', icon: '🧠' },
                      { key: 'family', label: '10 שאלות משפחה', icon: '👨‍👩‍👧‍👦' },
                      { key: 'science', label: '5 שאלות מדע', icon: '🔬' },
                      { key: 'israel', label: '5 שאלות ישראל', icon: '🇮🇱' }
                    ].map(preset => (
                      <button
                        key={preset.key}
                        onClick={() => handleAIGenerate(preset.key)}
                        disabled={aiLoading}
                        className="bg-gradient-to-br from-blue-400 to-blue-500 text-white p-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="text-3xl mb-1">{preset.icon}</div>
                        <div className="text-sm">{preset.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 my-6"></div>

                {/* Custom prompt */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">או: פרומפט מותאם אישית</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none min-h-[100px]"
                    placeholder="לדוגמה: צור לי 8 שאלות על בעלי חיים לילדים"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">כמות</label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={aiCount}
                      onChange={(e) => setAiCount(Number(e.target.value))}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">נושא (אופציונלי)</label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none"
                      placeholder="למשל: ספורט"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">רמת קושי</label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none"
                    >
                      <option value="easy">קל</option>
                      <option value="medium">בינוני</option>
                      <option value="hard">קשה</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleAIGenerate()}
                  disabled={aiLoading}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-4 rounded-full font-bold text-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                >
                  {aiLoading ? '⏳ מייצר שאלות...' : '✨ צור שאלות עם AI'}
                </button>

                {/* Error display */}
                {aiError && (
                  <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 mb-6">
                    <div className="font-bold text-red-700 mb-1">❌ שגיאה</div>
                    <div className="text-red-600 text-sm">{aiError}</div>
                    <div className="text-xs text-gray-600 mt-2">
                      ודא שמפתח ה-API מוגדר במשתנה הסביבה REACT_APP_ANTHROPIC_API_KEY
                    </div>
                  </div>
                )}

                {/* Generated questions display */}
                {generatedQuestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border-2 border-green-300 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-black text-green-700">
                        ✅ נוצרו {generatedQuestions.length} שאלות!
                      </h4>
                      <button
                        onClick={handleAddAIQuestions}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all"
                      >
                        הוסף את כל השאלות
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {generatedQuestions.map((q, index) => (
                        <div key={index} className="bg-white rounded-lg p-4">
                          <p className="font-bold text-gray-800 mb-2">{q.text}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {q.options.map((opt, i) => (
                              <div
                                key={i}
                                className={`p-2 rounded ${
                                  i === q.correct ? 'bg-green-100 text-green-800 font-semibold' : 'bg-gray-50 text-gray-600'
                                }`}
                              >
                                {i === q.correct && '✓ '}{opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* TAB 4: File Import */}
            {activeTab === 'file' && mode === 'edit' && (
              <motion.div
                key="file"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <h3 className="text-2xl font-black text-gray-800 mb-6">
                  📄 ייבוא שאלות מקובץ Word
                </h3>

                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-orange-800 mb-3">📋 פורמט הקובץ:</h4>
                  <div className="text-sm text-orange-700 space-y-2 bg-white p-4 rounded-lg">
                    <p>• כל שאלה בפסקה נפרדת (עם שורה ריקה בין שאלות)</p>
                    <p>• שורה ראשונה: טקסט השאלה</p>
                    <p>• 4 שורות הבאות: התשובות</p>
                    <p>• סמן את התשובה הנכונה עם כוכבית (*) בתחילת השורה</p>
                  </div>

                  <div className="mt-4 bg-white p-4 rounded-lg border border-orange-200">
                    <p className="font-bold text-orange-800 mb-2">דוגמה:</p>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
מהי בירת ישראל?
תל אביב
חיפה
*ירושלים
באר שבע

מהו צבע השמיים?
אדום
ירוק
*כחול
צהוב
                    </pre>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block mb-4">
                    <div className="bg-gradient-to-br from-orange-400 to-orange-500 text-white p-6 rounded-2xl cursor-pointer hover:scale-105 transition-all text-center font-bold text-lg shadow-lg">
                      <div className="text-5xl mb-3">📁</div>
                      <div>לחץ לבחירת קובץ Word (.docx)</div>
                      <input
                        type="file"
                        accept=".docx"
                        onChange={handleFileImport}
                        className="hidden"
                        disabled={fileLoading}
                      />
                    </div>
                  </label>
                </div>

                {fileLoading && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
                    <p className="mt-4 text-gray-600">קורא קובץ...</p>
                  </div>
                )}

                {fileError && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6">
                    <p className="text-red-700 font-bold">❌ {fileError}</p>
                  </div>
                )}

                {importedQuestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-black text-orange-700">
                        ✅ נמצאו {importedQuestions.length} שאלות!
                      </h4>
                      <button
                        onClick={handleAddImportedQuestions}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all"
                      >
                        הוסף את כל השאלות
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {importedQuestions.map((q, index) => (
                        <div key={index} className="bg-white rounded-lg p-4">
                          <p className="font-bold text-gray-800 mb-2">{q.text}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {q.options.map((opt, i) => (
                              <div
                                key={i}
                                className={`p-2 rounded ${
                                  i === q.correct ? 'bg-orange-100 text-orange-800 font-semibold' : 'bg-gray-50 text-gray-600'
                                }`}
                              >
                                {i === q.correct && '✓ '}{opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
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
              : '✅ שמור וסגור'
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuestionManagerEnhanced;
