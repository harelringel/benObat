import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSocketGameStore from '../store/socketGameStore';

/**
 * Leave Game Button with Confirmation Dialog
 * Issue #2: Explicit leave game functionality
 *
 * Only shown to players (not admin)
 * Requires confirmation before leaving
 */
const LeaveGameButton = ({ className = '' }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const { userRole, leaveGame } = useSocketGameStore();

  // Don't show for admin
  if (userRole !== 'player') {
    return null;
  }

  const handleLeaveClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmLeave = () => {
    // Round 4 Issue #1: Optimistic leave - executes immediately
    leaveGame();
    // leaveGame() is now synchronous and navigates immediately
    // No need to manage loading state or errors
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      {/* Leave Button (always visible, bottom-left) */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleLeaveClick}
        className={`fixed bottom-6 left-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-10 ${className}`}
        disabled={leaving}
      >
        צא מהמשחק
      </motion.button>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                לצאת מהמשחק?
              </h2>

              <p className="text-gray-600 text-center mb-6">
                לא תוכל לחזור למשחק הזה.
                <br />
                הנקודות שלך יישמרו אבל לא תוכל להמשיך לשחק.
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-bold"
                  disabled={leaving}
                >
                  ביטול
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirmLeave}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold"
                  disabled={leaving}
                >
                  {leaving ? 'יוצא...' : 'צא'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LeaveGameButton;
