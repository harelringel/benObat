import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KeyCircle = ({ number, opened, gender, onOpen, canOpen }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

  useEffect(() => {
    if (opened && !isFlipping) {
      setIsFlipping(true);
      setShowBurst(true);

      setTimeout(() => setShowBurst(false), 1000);
    }
  }, [opened, isFlipping]);

  const handleClick = () => {
    if (canOpen && !opened) {
      onOpen(number);
    }
  };

  const getColor = () => {
    if (!opened) return 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900';
    return gender === 'boy'
      ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600'
      : 'bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600';
  };

  const getIcon = () => {
    if (!opened) return number;
    return gender === 'boy' ? '👶' : '👶';
  };

  const getText = () => {
    if (!opened) return '';
    return gender === 'boy' ? 'בן' : 'בת';
  };

  return (
    <div className="relative">
      {/* Burst Effect */}
      <AnimatePresence>
        {showBurst && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  scale: 0,
                  x: '50%',
                  y: '50%',
                  rotate: (i * 360) / 8
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  x: `${50 + Math.cos((i * Math.PI * 2) / 8) * 100}%`,
                  y: `${50 + Math.sin((i * Math.PI * 2) / 8) * 100}%`,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`absolute w-3 h-3 rounded-full ${
                  gender === 'boy' ? 'bg-blue-400' : 'bg-pink-400'
                }`}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              />
            ))}

            {/* Sparkles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                initial={{
                  scale: 0,
                  x: '50%',
                  y: '50%',
                  rotate: Math.random() * 360
                }}
                animate={{
                  scale: [0, 1, 0],
                  x: `${50 + (Math.random() - 0.5) * 150}%`,
                  y: `${50 + (Math.random() - 0.5) * 150}%`,
                  rotate: Math.random() * 720
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.8,
                  delay: Math.random() * 0.2,
                  ease: 'easeOut'
                }}
                className="absolute text-2xl"
                style={{
                  left: '50%',
                  top: '50%',
                }}
              >
                ✨
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main Circle */}
      <motion.button
        onClick={handleClick}
        disabled={!canOpen || opened}
        initial={false}
        animate={{
          rotateY: opened ? 180 : 0,
          scale: opened ? [1, 1.2, 1] : 1
        }}
        transition={{
          rotateY: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] },
          scale: { duration: 0.5, times: [0, 0.5, 1] }
        }}
        whileHover={canOpen && !opened ? {
          scale: 1.1,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        } : {}}
        whileTap={canOpen && !opened ? {
          scale: 0.9
        } : {}}
        className={`
          relative aspect-square rounded-full w-full
          ${getColor()}
          ${canOpen && !opened ? 'cursor-pointer' : ''}
          shadow-2xl
          flex items-center justify-center
          border-4 overflow-hidden
          ${!opened ? 'border-yellow-400' : gender === 'boy' ? 'border-blue-200' : 'border-pink-200'}
        `}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Animated Shimmer when closed */}
        {!opened && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                background: [
                  'radial-gradient(circle at 30% 30%, rgba(255,215,0,0.4), transparent)',
                  'radial-gradient(circle at 70% 70%, rgba(255,215,0,0.4), transparent)',
                  'radial-gradient(circle at 30% 30%, rgba(255,215,0,0.4), transparent)',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-yellow-300/30 to-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          </>
        )}

        {/* Content */}
        <div className="relative z-10 text-center">
          {!opened ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-4xl sm:text-5xl font-black text-yellow-300 drop-shadow-lg">
                {getIcon()}
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-lg text-yellow-400 mt-2 font-bold"
              >
                🗝️
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.3, rotateY: -180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{
                delay: 0.4,
                duration: 0.5,
                type: 'spring',
                stiffness: 200
              }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  rotate: [-5, 5, -5, 0]
                }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-5xl sm:text-6xl mb-2"
              >
                {getIcon()}
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
                className={`
                  text-xl sm:text-2xl font-black
                  ${gender === 'boy' ? 'text-blue-100' : 'text-pink-100'}
                  drop-shadow-lg
                `}
                style={{ unicodeBidi: 'plaintext', direction: 'rtl' }}
              >
                {getText()}
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
                className="text-3xl mt-1"
              >
                {gender === 'boy' ? '💙' : '💗'}
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Lock Overlay */}
        {!opened && !canOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-5xl"
            >
              🔒
            </motion.span>
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};

export default KeyCircle;
