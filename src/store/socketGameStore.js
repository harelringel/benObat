import { create } from 'zustand';
import socketService from '../services/socket';

// Game states - Updated for Round 3 state machine
export const GAME_STATES = {
  WELCOME: 'WELCOME',
  ADMIN_SETUP: 'ADMIN_SETUP',
  LOBBY: 'LOBBY',
  ASKING: 'ASKING',                  // Question being asked (primary or open window)
  REVIEW: 'REVIEW',                  // Review correct answer
  KEY_WALL: 'KEY_WALL',              // Turn-based key claiming
  KEY_WALL_DONE: 'KEY_WALL_DONE',    // Round 3: Waiting for host to announce
  RESULTS_COMPARISON: 'RESULTS_COMPARISON',  // Comparison table
  RESULTS_REVEAL: 'RESULTS_REVEAL',  // Round 3: Gender reveal
  RESULTS_WINNER: 'RESULTS_WINNER',  // Legacy
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

  // Quiz state (ASKING/REVIEW phases) - Round 3: turn-based
  quizPhase: null,         // 'primary' or 'open'
  activePlayerId: null,    // Current active player for primary window
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
    // QUIZ EVENTS (Round 3 Issue #1: Turn-based with primary/open windows)
    // =========================================================================

    socket.on('question:started', (data) => {
      set({
        gameState: GAME_STATES.ASKING,
        currentQuestion: { question: data.prompt, options: data.options },
        currentQuestionIndex: data.index,
        quizPhase: data.phase, // 'primary'
        activePlayerId: data.activePlayerId,
        remainingTimeMs: data.deadlineMs - Date.now(),
        playerAnswers: [],
        reviewResults: null,
        correctAnswer: null
      });
    });

    socket.on('question:opened', (data) => {
      set({
        quizPhase: 'open',
        remainingTimeMs: data.deadlineMs - Date.now()
      });
    });

    socket.on('question:timer', ({ remainingMs, phase }) => {
      set({
        remainingTimeMs: remainingMs,
        quizPhase: phase
      });
    });

    socket.on('quiz:answered', ({ playerId, players }) => {
      set((state) => ({
        playerAnswers: [...state.playerAnswers, playerId],
        players
      }));
    });

    socket.on('question:ended', ({ questionId, correctOptionId, resolvedBy, perPlayer, leaderboard, reviewDurationMs }) => {
      set({
        gameState: GAME_STATES.REVIEW,
        correctAnswer: correctOptionId,
        reviewResults: perPlayer,
        players: leaderboard
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
    // RESULTS EVENTS (Round 3 Issue #2 & #3: Host-gated transitions)
    // =========================================================================

    socket.on('announce:ready', ({ scoreBoy, scoreGirl }) => {
      set({
        gameState: GAME_STATES.KEY_WALL_DONE,
        scoreBoy,
        scoreGirl
      });
    });

    socket.on('results:comparison', ({ rows, actualGender }) => {
      set({
        gameState: GAME_STATES.RESULTS_COMPARISON,
        comparisonTable: { rows, actualGender },
        revealedGender: actualGender
      });
    });

    socket.on('results:reveal', ({ actualGender, winners, rows }) => {
      set({
        gameState: GAME_STATES.RESULTS_REVEAL,
        winners,
        comparisonTable: { rows, actualGender },
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
  // Round 4 Issue #1: Optimistic UI - navigate immediately, fire-and-forget
  leaveGame: () => {
    const { roomPin, playerToken } = get();

    // 1. Immediately clear localStorage and reset (optimistic)
    localStorage.removeItem('playerToken');
    localStorage.removeItem('roomPin');
    localStorage.removeItem('playerName');

    get().resetGame();

    // 2. Fire socket emit in background (fire-and-forget)
    if (playerToken && roomPin) {
      socketService.leaveGame(roomPin, playerToken)
        .catch(error => {
          console.warn('Failed to notify server of leave (non-critical):', error);
          // User already left from their perspective, server will handle via disconnect
        });
    }

    return { success: true };
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

  // Round 3 Issue #2: Host announces results (KEY_WALL_DONE → RESULTS_COMPARISON)
  announceResults: async () => {
    try {
      const { roomPin, adminToken } = get();
      await socketService.announceResults(roomPin, adminToken);
      return { success: true };
    } catch (error) {
      console.error('Failed to announce results:', error);
      return { success: false, error: error.message };
    }
  },

  // Round 3 Issue #3: Host reveals gender (RESULTS_COMPARISON → RESULTS_REVEAL)
  revealGender: async () => {
    try {
      const { roomPin, adminToken } = get();
      await socketService.revealGender(roomPin, adminToken);
      return { success: true };
    } catch (error) {
      console.error('Failed to reveal gender:', error);
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
      quizPhase: null,
      activePlayerId: null,
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
