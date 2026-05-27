import { create } from 'zustand';
import socketService from '../services/socket';

// Game states
export const GAME_STATES = {
  WELCOME: 'WELCOME',
  ADMIN_SETUP: 'ADMIN_SETUP',
  LOBBY: 'LOBBY',
  QUIZ_QUESTION: 'QUIZ_QUESTION',
  QUIZ_ANSWERING: 'QUIZ_ANSWERING',
  QUIZ_RESULT: 'QUIZ_RESULT',
  BOARD_INTRO: 'BOARD_INTRO',
  BOARD_PLAYER_TURN: 'BOARD_PLAYER_TURN',
  BOARD_OPENING: 'BOARD_OPENING',
  BOARD_OPENED: 'BOARD_OPENED',
  REVEAL_SUSPENSE: 'REVEAL_SUSPENSE',
  FINAL_REVEAL: 'FINAL_REVEAL',
  GAME_OVER: 'GAME_OVER',
};

const useSocketGameStore = create((set, get) => ({
  // Connection state
  connected: false,
  connectionError: null,

  // User role
  userRole: null, // 'admin' or 'player'
  currentUserId: null,
  currentUserName: null,

  // Room state
  roomPin: null,
  gameState: GAME_STATES.WELCOME,

  // Admin Settings (only for admin)
  babyGender: null,
  numPlayers: 4,
  numQuestions: 10,
  timerSeconds: 40,
  boardSize: 16,
  selectedQuestions: [],

  // Game state
  players: [],
  currentQuestionIndex: 0,
  currentQuestion: null,
  currentPlayerIndex: 0,
  quizPhase: 'waiting',
  timeLeft: 40,
  currentAnswerer: null,
  lastAnswerCorrect: null,

  // Board state
  openedCircles: [],
  circleCounts: { boyCount: 0, girlCount: 0 },

  // Reveal state
  winner: null,
  revealedGender: null,

  // Actions
  initializeSocket: () => {
    const socket = socketService.connect();

    // Setup event listeners
    socket.on('connect', () => {
      set({ connected: true, connectionError: null });
    });

    socket.on('disconnect', () => {
      set({ connected: false });
    });

    socket.on('connect_error', (error) => {
      set({ connectionError: error.message });
    });

    // Player joined event
    socket.on('player-joined', ({ player, players, room }) => {
      set({ players });
    });

    // Player left event
    socket.on('player-left', ({ playerId, playerName, players }) => {
      set({ players });
    });

    // Player ready changed
    socket.on('player-ready-changed', ({ players, allReady }) => {
      set({ players });
    });

    // Quiz started
    socket.on('quiz-started', ({ gameState, currentQuestion, currentPlayerIndex, players }) => {
      set({
        gameState,
        currentQuestion,
        currentPlayerIndex,
        players,
        quizPhase: 'waiting'
      });
    });

    // Player buzzed in
    socket.on('player-buzzed', ({ playerId, playerName, phase }) => {
      set({
        currentAnswerer: playerId,
        quizPhase: phase
      });
    });

    // Answer submitted
    socket.on('answer-submitted', ({ playerId, answerIndex, isCorrect, correctAnswer, players, phase }) => {
      set({
        lastAnswerCorrect: isCorrect,
        quizPhase: phase,
        players
      });
    });

    // Next question
    socket.on('next-question', ({ currentQuestion, currentPlayerIndex, currentQuestionIndex, players }) => {
      set({
        currentQuestion,
        currentPlayerIndex,
        currentQuestionIndex,
        players,
        quizPhase: 'waiting',
        currentAnswerer: null,
        lastAnswerCorrect: null,
        timeLeft: get().timerSeconds
      });
    });

    // Quiz finished
    socket.on('quiz-finished', ({ gameState, players }) => {
      set({
        gameState,
        players
      });
    });

    // Circle opened
    socket.on('circle-opened', ({ circleIndex, gender, playerId, openedCircles, players, counts }) => {
      set({
        openedCircles,
        players,
        circleCounts: counts,
        gameState: GAME_STATES.BOARD_OPENED
      });
    });

    // Player turn changed
    socket.on('player-turn-changed', ({ currentPlayerIndex, players }) => {
      set({
        currentPlayerIndex,
        players,
        gameState: GAME_STATES.BOARD_PLAYER_TURN
      });
    });

    // Game finished
    socket.on('game-finished', ({ gameState, winner, players, babyGender }) => {
      set({
        gameState,
        winner,
        players,
        revealedGender: babyGender
      });
    });

    // Admin disconnected
    socket.on('admin-disconnected', () => {
      alert('המנהל התנתק - המשחק הסתיים');
      get().resetGame();
    });
  },

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
        gameState: GAME_STATES.LOBBY,
        userRole: 'admin'
      });

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

      set({
        roomPin: pin,
        gameState: GAME_STATES.LOBBY,
        userRole: 'player',
        currentUserId: response.player.id,
        currentUserName: playerName,
        players: response.room.players
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to join room:', error);
      return { success: false, error: error.message };
    }
  },

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

  // Player buzzes in
  buzzIn: async () => {
    try {
      const { roomPin, currentUserId } = get();
      await socketService.buzzIn(roomPin, currentUserId);
      return { success: true };
    } catch (error) {
      console.error('Failed to buzz in:', error);
      return { success: false, error: error.message };
    }
  },

  // Submit answer
  submitAnswer: async (answerIndex) => {
    try {
      const { roomPin, currentUserId } = get();
      const result = await socketService.submitAnswer(roomPin, currentUserId, answerIndex);
      return { success: true, isCorrect: result.isCorrect };
    } catch (error) {
      console.error('Failed to submit answer:', error);
      return { success: false, error: error.message };
    }
  },

  // Move to next question (admin only)
  nextQuestion: async () => {
    try {
      const { roomPin } = get();
      await socketService.nextQuestion(roomPin);
      return { success: true };
    } catch (error) {
      console.error('Failed to move to next question:', error);
      return { success: false, error: error.message };
    }
  },

  // Open circle
  openCircle: async (circleIndex) => {
    try {
      const { roomPin, currentUserId } = get();
      const result = await socketService.openCircle(roomPin, currentUserId, circleIndex);
      return { success: true, gender: result.gender };
    } catch (error) {
      console.error('Failed to open circle:', error);
      return { success: false, error: error.message };
    }
  },

  // Next player turn (admin only)
  nextPlayerTurn: async () => {
    try {
      const { roomPin } = get();
      await socketService.nextPlayerTurn(roomPin);
      return { success: true };
    } catch (error) {
      console.error('Failed to move to next turn:', error);
      return { success: false, error: error.message };
    }
  },

  // Admin setup actions
  setBabyGender: (gender) => set({ babyGender: gender }),
  setNumPlayers: (num) => set({ numPlayers: num }),
  setNumQuestions: (num) => set({ numQuestions: num }),
  setTimerSeconds: (seconds) => set({ timerSeconds: seconds }),
  setBoardSize: (size) => set({ boardSize: size }),
  setSelectedQuestions: (questions) => set({ selectedQuestions: questions }),

  // Reset game
  resetGame: () => {
    socketService.disconnect();
    set({
      connected: false,
      connectionError: null,
      userRole: null,
      currentUserId: null,
      currentUserName: null,
      roomPin: null,
      gameState: GAME_STATES.WELCOME,
      babyGender: null,
      numPlayers: 4,
      numQuestions: 10,
      timerSeconds: 40,
      boardSize: 16,
      selectedQuestions: [],
      players: [],
      currentQuestionIndex: 0,
      currentQuestion: null,
      currentPlayerIndex: 0,
      quizPhase: 'waiting',
      timeLeft: 40,
      currentAnswerer: null,
      lastAnswerCorrect: null,
      openedCircles: [],
      circleCounts: { boyCount: 0, girlCount: 0 },
      winner: null,
      revealedGender: null
    });
  },
}));

export default useSocketGameStore;
