import React from 'react';
import { motion } from 'framer-motion';

const PlayerBadge = ({ player, isActive = false, compact = false }) => {
  if (compact) {
    // Compact version for top bar
    return (
      <div
        className={`
          px-4 py-2 rounded-lg transition-all
          ${isActive ? 'bg-primary-blue shadow-lg scale-110' : 'bg-white/10'}
        `}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold">{player.name}</span>
          <div className="flex gap-1">
            {[...Array(player.keys)].map((_, i) => (
              <span key={i}>🗝️</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <motion.div
      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
      className={`
        bg-white/10 backdrop-blur-lg rounded-xl p-6 border-2 transition-all
        ${isActive ? 'border-primary-blue shadow-2xl shadow-primary-blue/50' : 'border-white/20'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className={`
              w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
              ${isActive ? 'bg-primary-blue' : 'bg-gray-600'}
            `}
          >
            {player.name.charAt(0).toUpperCase()}
          </div>

          {/* Name and Info */}
          <div>
            <h3 className="text-2xl font-bold">{player.name}</h3>
            {isActive && (
              <p className="text-sm text-yellow-300 font-semibold">🎯 התור שלו!</p>
            )}
          </div>
        </div>

        {/* Keys Display */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">{player.keys}</div>
          <div className="text-sm text-gray-300">מפתחות</div>
          <div className="flex gap-1 mt-2 justify-center flex-wrap max-w-[150px]">
            {[...Array(player.keys)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl"
              >
                🗝️
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerBadge;
