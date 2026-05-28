import { create } from 'zustand';
import socketService from '../services/socket';

// Game states - Updated for new server state machine
export const GAME_STATES = {
  WELCOME: 'WELCOME',
  ADMIN_SETUP: 'ADMIN_SETUP',
  LOBBY: 'LOBBY',
  ASKING: 'ASKING',                  // New: Question being asked
  REVIEW: 'REVIEW',                  // New: Review correct answer
  KEY_WALL: 'KEY_WALL',              // New: Turn-based key claiming
  RESULTS_COMPARISON: 'RESULTS_COMPARISON',  // New: Comparison table
  RESULTS_WINNER: 'RESULTS_WINNER',  // New: Winner announcement
  GAME_OVER: 'GAME_OVER',
};

const useSocketGameStore = create((set, get) => ({
  // Connection state
  connected: false,
  connectionError: null,
  reconnecting: false,

  // User role & identity
  userRole: null, // 'admin' or 'player'
  currentUserId: null,
  currentUserName: null,
  playerToken: null, // NEW: For player reconnection
  adminToken: null, // NEW: For admin reconnection

  // Room state
  roomPin: null,
  gameState: GAME_STATES.WELCOME,

  // Admin Settings (only for admin)
  babyGender: null,
  numPlayers: 4,
  numQuestions: 20,
  timerSeconds: 40,
  boardSize: 16,
  selectedQuestions: [],

  // Game state
  players: [],
  currentQuestionIndex: 0,
  currentQuestion: null,

  // Quiz state (ASKING/REVIEW phases)
  remainingTimeMs: 0,
  playerAnswers: [],       // NEW: Track who answered
  reviewResults: null,     // NEW: Results for review phase
  correctAnswer: null,     // NEW: For review phase

  // Key wall state (NEW)
  keys: [],                // Array of key objects
  currentTurnPlayerId: null,
  scoreBoy: 0,
  scoreGirl: 0,

  // Results state (NEW)
  comparisonTable: null,   // Comparison table data
  winners: null,           // Winner(s) data

  // Deprecated (kept for backwards compat, remove later)
  currentPlayerIndex: 0,
  quizPhase: 'waiting',
  timeLeft: 40,
  currentAnswerer: null,
  lastAnswerCorrect: null,
  openedCircles: [],
  boardLayout: {},
  circleCounts: { boyCount: 0, girlCount: 0 },
  winner: null,
  revealedGender: null,

  // Actions
  initializeSocket: () => {
    const socket = socketService.connect();

    // Try to auto-rejoin if we have a saved token
    socket.on('connect', () => {
      set({ connected: true, connectionError: null });

      const savedPlayerToken = localStorage.getItem('playerToken');
      const savedAdminToken = localStorage.getItem('adminToken');
      const savedPin = localStorage.getItem('roomPin');

      // If we have an adminToken, we're admin - attempt reconnection
      if (savedAdminToken && savedPin) {
        console.log('[Auto-rejoin Admin] Attempting reconnection...');
        get().rejoinAdmin(savedPin, savedAdminToken);
      }
      // If we have a playerToken, we're a player - attempt reconnection
      else if (savedPlayerToken && savedPin) {
        console.log('[Auto-rejoin Player] Attempting reconnection...');
        get().rejoinRoom(savedPin, savedPlayerToken);
      }
    });

    socket.on('disconnect', () => {
      set({ connected: false });
    });

    socket.on('connect_error', (error) => {
      set({ connectionError: error.message });
    });

    // =========================================================================
    // LOBBY EVENTS
    // =========================================================================

    socket.on('player-joined', ({ player, players, room }) => {
      set({
        players,
        numPlayers: room.config?.numPlayers || get().numPlayers
      });
    });

    socket.on('player-left', ({ playerId, playerName, players }) => {
      set({ players });
    });

    socket.on('player-disconnected', ({ playerId, playerName, players }) => {
      set({ players });
      console.log(`[Disconnect] ${playerName} disconnected`);
    });

    socket.on('player-reconnected', ({ playerId, playerName, players }) => {
      set({ players, reconnecting: false });
      console.log(`[Reconnect] ${playerName} reconnected`);
    });

    socket.on('player-ready-changed', ({ players, allReady }) => {
      set({ players });
    });

    // =========================================================================
    // QUIZ EVENTS (Issue #1: New state machine)
    // =========================================================================

    socket.on('quiz:started', (phaseState) => {
      set({
        gameState: GAME_STATES.ASKING,
        currentQuestion: phaseState.currentQuestion,
        currentQuestionIndex: phaseState.currentQuestionIndex,
        remainingTimeMs: phaseState.remainingTimeMs,
        playerAnswers: phaseState.playerAnswers || [],
        players: phaseState.players
      });
    });

    socket.on('quiz:timer', ({ remainingMs }) => {
      set({ remainingTimeMs: remainingMs });
    });

    socket.on('quiz:answered', ({ playerId, players }) => {
      set((state) => ({
        playerAnswers: [...state.playerAnswers, playerId],
        players
      }));
    });

    socket.on('quiz:review', ({ correctAnswer, results, reviewDurationMs, players }) => {
      set({
        gameState: GAME_STATES.REVIEW,
        correctAnswer,
        reviewResults: results,
        players
      });
    });

    socket.on('quiz:question', (phaseState) => {
      set({
        gameState: GAME_STATES.ASKING,
        currentQuestion: phaseState.currentQuestion,
        currentQuestionIndex: phaseState.currentQuestionIndex,
        remainingTimeMs: phaseState.remainingTimeMs,
        playerAnswers: [],
        reviewResults: null,
        correctAnswer: null,
        players: phaseState.players
      });
    });

    // =========================================================================
    // KEY WALL EVENTS (Issue #3: Turn-based system)
    // =========================================================================

    socket.on('keywall:started', (phaseState) => {
      set({
        gameState: GAME_STATES.KEY_WALL,
        keys: phaseState.keys,
        currentTurnPlayerId: phaseState.currentTurnPlayerId,
        remainingTimeMs: phaseState.remainingTimeMs,
        scoreBoy: phaseState.scoreBoy,
        scoreGirl: phaseState.scoreGirl,
        players: phaseState.players
      });
    });

    socket.on('keywall:turn', ({ currentTurnPlayerId, remainingMs }) => {
      set({
        currentTurnPlayerId,
        remainingTimeMs: remainingMs
      });
    });

    socket.on('keywall:timer', ({ remainingMs, currentTurnPlayerId }) => {
      set({
        remainingTimeMs: remainingMs,
        currentTurnPlayerId
      });
    });

    socket.on('keywall:claimed', ({ keyId, gender, playerId, auto, keys, scoreBoy, scoreGirl, players }) => {
      set({
        keys,
        scoreBoy,
        scoreGirl,
        players
      });
    });

    // =========================================================================
    // RESULTS EVENTS (Issue #4: Two-phase results)
    // =========================================================================

    socket.on('results:comparison', ({ rows, actualGender, comparisonDurationMs }) => {
      set({
        gameState: GAME_STATES.RESULTS_COMPARISON,
        comparisonTable: { rows, actualGender },
        revealedGender: actualGender
      });
    });

    socket.on('results:winner', ({ winners, actualGender }) => {
      set({
        gameState: GAME_STATES.RESULTS_WINNER,
        winners,
        revealedGender: actualGender
      });
    });

    // =========================================================================
    // ADMIN EVENTS
    // =========================================================================

    socket.on('admin-disconnected', () => {
      alert('המנהל התנתק - המשחק הסתיים');
      get().resetGame();
    });

    // =========================================================================
    // LEGACY EVENTS (backwards compatibility - can remove later)
    // =========================================================================

    socket.on('quiz-started', (data) => {
      console.warn('[Legacy] quiz-started event - update server?');
    });

    socket.on('timer-update', (data) => {
      console.warn('[Legacy] timer-update event - update server?');
    });

    socket.on('answer-submitted', (data) => {
      console.warn('[Legacy] answer-submitted event - update server?');
    });
  },

  // =========================================================================
  // ROOM ACTIONS
  // =========================================================================

  // Admin creates a room
  createRoom: async () => {
    try {
      const state = get();
      const response = await socketService.createRoom({
        babyGender: state.babyGender,
        numPlayers: state.numPlayers,
        numQuestions: state.numQuestions,
        timerSeconds: state.timerSeconds,
        boardSize: state.boardSize,
        questions: state.selectedQuestions
      });

      set({
        roomPin: response.pin,
        adminToken: response.adminToken,
        gameState: GAME_STATES.LOBBY,
        userRole: 'admin'
      });

      // Save admin token for reconnection
      localStorage.setItem('roomPin', response.pin);
      localStorage.setItem('adminToken', response.adminToken);

      return { success: true, pin: response.pin };
    } catch (error) {
      console.error('Failed to create room:', error);
      return { success: false, error: error.message };
    }
  },

  // Player joins a room
  joinRoom: async (pin, playerName) => {
    try {
      const response = await socketService.joinRoom(pin, playerName);

      // NEW: Save playerToken for reconnection
      if (response.playerToken) {
        localStorage.setItem('playerToken', response.playerToken);
        localStorage.setItem('roomPin', pin);
        localStorage.setItem('playerName', playerName);
      }

      set({
        roomPin: pin,
        gameState: GAME_STATES.LOBBY,
        userRole: 'player',
        currentUserId: response.player.id,
        currentUserName: playerName,
        playerToken: response.playerToken,
        players: response.room.players,
        numPlayers: response.room.config?.numPlayers || get().numPlayers
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to join room:', error);
      return { success: false, error: error.message };
    }
  },

  // NEW: Rejoin with playerToken (Issue #2)
  rejoinRoom: async (pin, playerToken) => {
    try {
      set({ reconnecting: true });

      const response = await socketService.rejoinRoom(pin, playerToken);

      set({
        roomPin: pin,
        userRole: 'player',
        currentUserId: response.player.id,
        currentUserName: response.player.name,
        playerToken: playerToken,
        reconnecting: false,
        ...response.currentState // Sync to current game phase
      });

      console.log('[Rejoin] Successfully rejoined game');
      return { success: true };
    } catch (error) {
      console.error('Failed to rejoin room:', error);
      set({ reconnecting: false });

      // Clear invalid token
      localStorage.removeItem('playerToken');
      localStorage.removeItem('roomPin');

      return { success: false, error: error.message };
    }
  },

  // NEW: Admin rejoin with adminToken
  rejoinAdmin: async (pin, adminToken) => {
    try {
      set({ reconnecting: true });

      const response = await socketService.rejoinAdmin(pin, adminToken);

      set({
        roomPin: pin,
        userRole: 'admin',
        adminToken: adminToken,
        reconnecting: false,
        ...response.room // Sync to current room state
      });

      console.log('[Rejoin Admin] Successfully rejoined as admin');
      return { success: true };
    } catch (error) {
      console.error('Failed to rejoin as admin:', error);
      set({ reconnecting: false });

      // Clear invalid token
      localStorage.removeItem('adminToken');
      localStorage.removeItem('roomPin');

      return { success: false, error: error.message };
    }
  },

  // NEW: Explicit leave game (Issue #2)
  leaveGame: async () => {
    try {
      const { roomPin, playerToken } = get();

      if (!playerToken) {
        // Admin or not in game
        get().resetGame();
        return { success: true };
      }

      await socketService.leaveGame(roomPin, playerToken);

      // Clear localStorage
      localStorage.removeItem('playerToken');
      localStorage.removeItem('roomPin');
      localStorage.removeItem('playerName');

      get().resetGame();

      return { success: true };
    } catch (error) {
      console.error('Failed to leave game:', error);
      return { success: false, error: error.message };
    }
  },

  // =========================================================================
  // GAME ACTIONS
  // =========================================================================

  // Player toggles ready
  toggleReady: async () => {
    try {
      const { roomPin, currentUserId } = get();
      await socketService.playerReady(roomPin, currentUserId);
      return { success: true };
    } catch (error) {
      console.error('Failed to toggle ready:', error);
      return { success: false, error: error.message };
    }
  },

  // Admin starts quiz
  startQuiz: async () => {
    try {
      const { roomPin } = get();
      await socketService.startQuiz(roomPin);
      return { success: true };
    } catch (error) {
      console.error('Failed to start quiz:', error);
      return { success: false, error: error.message };
    }
  },

  // Submit answer (NEW: Uses quiz:answer event)
  submitAnswer: async (answerIndex) => {
    try {
      const { roomPin, currentUserId } = get();
      await socketService.submitQuizAnswer(roomPin, currentUserId, answerIndex);
      return { success: true };
    } catch (error) {
      console.error('Failed to submit answer:', error);
      return { success: false, error: error.message };
    }
  },

  // Claim key (NEW: Uses keywall:claim event)
  claimKey: async (keyId) => {
    try {
      const { roomPin, currentUserId } = get();
      await socketService.claimKey(roomPin, currentUserId, keyId);
      return { success: true };
    } catch (error) {
      console.error('Failed to claim key:', error);
      return { success: false, error: error.message };
    }
  },

  // Admin shows winner (NEW: Optional manual advance)
  showWinner: async () => {
    try {
      const { roomPin } = get();
      await socketService.showWinner(roomPin);
      return { success: true };
    } catch (error) {
      console.error('Failed to show winner:', error);
      return { success: false, error: error.message };
    }
  },

  // =========================================================================
  // ADMIN SETUP ACTIONS
  // =========================================================================

  setBabyGender: (gender) => set({ babyGender: gender }),
  setNumPlayers: (num) => set({ numPlayers: num }),
  setNumQuestions: (num) => set({ numQuestions: num }),
  setTimerSeconds: (seconds) => set({ timerSeconds: seconds }),
  setBoardSize: (size) => set({ boardSize: size }),
  setSelectedQuestions: (questions) => set({ selectedQuestions: questions }),

  // =========================================================================
  // RESET
  // =========================================================================

  resetGame: () => {
    socketService.disconnect();

    // Don't clear localStorage here - let leaveGame() handle it

    set({
      connected: false,
      connectionError: null,
      reconnecting: false,
      userRole: null,
      currentUserId: null,
      currentUserName: null,
      playerToken: null,
      adminToken: null,
      roomPin: null,
      gameState: GAME_STATES.WELCOME,
      babyGender: null,
      numPlayers: 4,
      numQuestions: 20,
      timerSeconds: 40,
      boardSize: 16,
      selectedQuestions: [],
      players: [],
      currentQuestionIndex: 0,
      currentQuestion: null,
      remainingTimeMs: 0,
      playerAnswers: [],
      reviewResults: null,
      correctAnswer: null,
      keys: [],
      currentTurnPlayerId: null,
      scoreBoy: 0,
      scoreGirl: 0,
      comparisonTable: null,
      winners: null,
      // Legacy
      currentPlayerIndex: 0,
      quizPhase: 'waiting',
      timeLeft: 40,
      currentAnswerer: null,
      lastAnswerCorrect: null,
      openedCircles: [],
      boardLayout: {},
      circleCounts: { boyCount: 0, girlCount: 0 },
      winner: null,
      revealedGender: null
    });
  },
}));

export default useSocketGameStore;
