import React from 'react';
import { motion } from 'framer-motion';

const WelcomeScreen = () => {

  const goToAdmin = () => {
    // Navigate to admin setup
    window.location.hash = 'admin';
  };

  const goToPlayer = () => {
    // Navigate to player join
    window.location.hash = 'join';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50 relative overflow-hidden">
      {/* Floating confetti decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute text-2xl ${i % 3 === 0 ? 'text-pink-300' : i % 3 === 1 ? 'text-blue-300' : 'text-yellow-300'}`}
            initial={{
              x: Math.random() * window.innerWidth,
              y: -50,
              rotate: 0
            }}
            animate={{
              y: window.innerHeight + 50,
              rotate: 360,
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear'
            }}
          >
            {i % 4 === 0 ? '💙' : i % 4 === 1 ? '💗' : i % 4 === 2 ? '🎀' : '⭐'}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-2">
            <span className="text-blue-500">בן</span>{' '}
            <span className="text-gray-800">או</span>{' '}
            <span className="text-pink-500">בת</span>
            <span className="text-gray-800">?!</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mt-2">boy or girl?!</p>
        </motion.div>

        {/* Baby Image Circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            delay: 0.3
          }}
          className="relative mb-12"
        >
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-pink-200 to-blue-200 p-2 shadow-2xl">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-8xl md:text-9xl">
              👶
            </div>
          </div>
          {/* Floating socks */}
          <motion.div
            animate={{
              y: [-10, 10, -10],
              rotate: [-5, 5, -5]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -left-8 top-8 text-5xl"
          >
            🧦
          </motion.div>
          <motion.div
            animate={{
              y: [10, -10, 10],
              rotate: [5, -5, 5]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            className="absolute -right-8 top-8 text-5xl"
          >
            🍼
          </motion.div>
        </motion.div>

        {/* Mode Selection Cards */}
        <div className="w-full max-w-md space-y-4 px-4">
          {/* Player Mode */}
          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToPlayer}
            className="w-full bg-gradient-to-br from-pink-400 to-pink-500 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 bg-white rounded-full p-4">
              <span className="text-4xl">👥</span>
            </div>
            <div className="text-right pr-20">
              <h2 className="text-3xl md:text-4xl font-black mb-2">משתתף</h2>
              <p className="text-pink-100 text-lg">הצטרף למשחק</p>
              <p className="text-pink-100">וענה על שאלות</p>
            </div>
            <div className="absolute bottom-4 left-4">
              <div className="bg-white/30 rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-2xl">←</span>
              </div>
            </div>
          </motion.button>

          {/* Admin Mode */}
          <motion.button
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToAdmin}
            className="w-full bg-gradient-to-br from-blue-400 to-blue-500 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 bg-white rounded-full p-4">
              <span className="text-4xl">👑</span>
            </div>
            <div className="text-right pr-20">
              <h2 className="text-3xl md:text-4xl font-black mb-2">מנהל</h2>
              <p className="text-blue-100 text-lg">נהל את המשחק</p>
              <p className="text-blue-100">וצור שאלות משלך</p>
            </div>
            <div className="absolute bottom-4 left-4">
              <div className="bg-white/30 rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-2xl">←</span>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 grid grid-cols-3 gap-4 max-w-md"
        >
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center text-3xl">
              📊
            </div>
            <p className="text-xs text-gray-600">תוצאות בזמן אמת</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center text-3xl">
              🎉
            </div>
            <p className="text-xs text-gray-600">חוויית מריחיות מהנה</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center text-3xl">
              📱
            </div>
            <p className="text-xs text-gray-600">השתתפות קלה</p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center text-gray-500"
        >
          💖 בואו לגלות יחד מה יהיה... 💖
        </motion.p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
