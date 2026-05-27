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

      case GAME_STATES.QUIZ_QUESTION:
      case GAME_STATES.QUIZ_ANSWERING:
      case GAME_STATES.QUIZ_RESULT:
        return <QuizRoundMultiplayer />;

      case GAME_STATES.BOARD_INTRO:
      case GAME_STATES.BOARD_PLAYER_TURN:
      case GAME_STATES.BOARD_OPENING:
      case GAME_STATES.BOARD_OPENED:
        return <KeyBoardStageMultiplayer />;

      case GAME_STATES.REVEAL_SUSPENSE:
      case GAME_STATES.FINAL_REVEAL:
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
