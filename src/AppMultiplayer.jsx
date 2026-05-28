import React from 'react';
import useSocketGameStore, { GAME_STATES } from './store/socketGameStore';
import WelcomeMultiplayer from './screens/WelcomeMultiplayer';
import AdminSetupMultiplayer from './screens/AdminSetupMultiplayer';
import PlayerLobbyMultiplayer from './screens/PlayerLobbyMultiplayer';
import QuizRoundMultiplayer from './screens/QuizRoundMultiplayer';
import KeyBoardStageMultiplayer from './screens/KeyBoardStageMultiplayer';
import FinalRevealMultiplayer from './screens/FinalRevealMultiplayer';

function AppMultiplayer() {
  const { gameState } = useSocketGameStore();

  const renderScreen = () => {
    switch (gameState) {
      case GAME_STATES.WELCOME:
        return <WelcomeMultiplayer />;

      case GAME_STATES.ADMIN_SETUP:
        return <AdminSetupMultiplayer />;

      case GAME_STATES.LOBBY:
        return <PlayerLobbyMultiplayer />;

      // NEW: ASKING and REVIEW states for quiz
      case GAME_STATES.ASKING:
      case GAME_STATES.REVIEW:
        return <QuizRoundMultiplayer />;

      // NEW: KEY_WALL state for key claiming
      case GAME_STATES.KEY_WALL:
        return <KeyBoardStageMultiplayer />;

      // NEW: RESULTS_COMPARISON and RESULTS_WINNER states
      case GAME_STATES.RESULTS_COMPARISON:
      case GAME_STATES.RESULTS_WINNER:
        return <FinalRevealMultiplayer />;

      case GAME_STATES.GAME_OVER:
        return <FinalRevealMultiplayer />;

      default:
        return <WelcomeMultiplayer />;
    }
  };

  return (
    <div className="App" dir="rtl">
      {renderScreen()}
    </div>
  );
}

export default AppMultiplayer;
