import React, { useEffect, useState } from 'react';
import useGameStore, { GAME_STATES } from './store/gameStore';
import WelcomeScreen from './screens/WelcomeScreen';
import PlayerJoin from './screens/PlayerJoin';
import AdminSetupMobile from './screens/AdminSetupMobile';
import PlayerLobby from './screens/PlayerLobby';
import QuizRound from './screens/QuizRound';
import KeyBoardStage from './screens/KeyBoardStage';
import FinalReveal from './screens/FinalReveal';

function App() {
  const { gameState } = useGameStore();
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Route based on hash or game state
  const renderScreen = () => {
    // Prioritize game state routing for active game states (LOBBY and beyond)
    if (gameState !== GAME_STATES.ADMIN_SETUP) {
      switch (gameState) {
        case GAME_STATES.LOBBY:
          return <PlayerLobby />;

        case GAME_STATES.QUIZ_QUESTION:
        case GAME_STATES.QUIZ_ANSWERING:
        case GAME_STATES.QUIZ_RESULT:
          return <QuizRound />;

        case GAME_STATES.BOARD_INTRO:
        case GAME_STATES.BOARD_PLAYER_TURN:
        case GAME_STATES.BOARD_OPENING:
        case GAME_STATES.BOARD_OPENED:
          return <KeyBoardStage />;

        case GAME_STATES.REVEAL_SUSPENSE:
        case GAME_STATES.FINAL_REVEAL:
        case GAME_STATES.GAME_OVER:
          return <FinalReveal />;

        default:
          break;
      }
    }

    // Check hash-based routing (for welcome/join/admin screens)
    if (currentHash === '#admin') {
      return <AdminSetupMobile />;
    }

    if (currentHash === '#join') {
      return <PlayerJoin />;
    }

    if (currentHash === '' || currentHash === '#') {
      return <WelcomeScreen />;
    }

    // Fallback to game state routing
    if (gameState === GAME_STATES.ADMIN_SETUP) {
      return <AdminSetupMobile />;
    }

    return <WelcomeScreen />;
  };

  return (
    <div className="App" dir="rtl">
      {renderScreen()}
    </div>
  );
}

export default App;
