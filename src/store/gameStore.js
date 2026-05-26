import { create } from 'zustand';

// Game states
export const GAME_STATES = {
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

const useGameStore = create((set, get) => ({
  // Game State
  gameState: GAME_STATES.ADMIN_SETUP,

  // Admin Settings
  babyGender: null, // 'boy' or 'girl'
  numPlayers: 4,
  numQuestions: 10,
  timerSeconds: 40,
  boardSize: 16, // 9, 16, or 25

  // Questions
  selectedQuestions: [],
  currentQuestionIndex: 0,

  // Board Layout (encrypted - hidden from players)
  boardLayout: [], // array of 'boy'/'girl' based on boardSize
  openedCircles: [], // array of opened circle indices

  // Players
  players: [],
  currentPlayerIndex: 0,

  // Quiz Phase
  quizPhase: 'waiting', // 'waiting', 'answering', 'open_for_all', 'result'
  timeLeft: 40,
  currentAnswerer: null,
  lastAnswerCorrect: null,

  // Actions

  // Admin Setup Actions
  setBabyGender: (gender) => set({ babyGender: gender }),

  setNumPlayers: (num) => set({ numPlayers: num }),

  setNumQuestions: (num) => set({ numQuestions: num }),

  setTimerSeconds: (seconds) => set({ timerSeconds: seconds }),

  setBoardSize: (size) => set({ boardSize: size }),

  setSelectedQuestions: (questions) => set({ selectedQuestions: questions }),

  generateBoardLayout: () => {
    const { boardSize, babyGender } = get();
    if (!babyGender) return;

    // Generate layout based on baby gender
    // Dominant color should match the baby's gender (60-70%)
    const totalCircles = boardSize;
    const dominantCount = Math.floor(totalCircles * (0.6 + Math.random() * 0.1));
    const minorCount = totalCircles - dominantCount;

    const layout = [
      ...Array(dominantCount).fill(babyGender),
      ...Array(minorCount).fill(babyGender === 'boy' ? 'girl' : 'boy')
    ];

    // Shuffle the layout
    for (let i = layout.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [layout[i], layout[j]] = [layout[j], layout[i]];
    }

    set({ boardLayout: layout });
  },

  startGame: () => {
    const { selectedQuestions, numQuestions, babyGender } = get();

    if (!babyGender) {
      alert('נא לבחור את מין העובר תחילה');
      return false;
    }

    if (selectedQuestions.length < numQuestions) {
      alert(`נא לבחור לפחות ${numQuestions} שאלות`);
      return false;
    }

    get().generateBoardLayout();
    // Clear the hash to allow game state routing
    window.location.hash = '';
    set({ gameState: GAME_STATES.LOBBY });
    return true;
  },

  // Lobby Actions
  addPlayer: (name) => {
    const { players } = get();
    const newPlayer = {
      id: Date.now(),
      name,
      ready: false,
      keys: 0,
      score: 0,
      circlesOpened: [],
    };
    set({ players: [...players, newPlayer] });
  },

  removePlayer: (playerId) => {
    const { players } = get();
    set({ players: players.filter(p => p.id !== playerId) });
  },

  togglePlayerReady: (playerId) => {
    const { players } = get();
    set({
      players: players.map(p =>
        p.id === playerId ? { ...p, ready: !p.ready } : p
      ),
    });
  },

  startQuiz: () => {
    const { players, numPlayers } = get();

    if (players.length !== numPlayers) {
      alert(`נדרשים ${numPlayers} שחקנים`);
      return false;
    }

    if (!players.every(p => p.ready)) {
      alert('כל השחקנים צריכים להיות מוכנים');
      return false;
    }

    // Clear the hash to allow game state routing
    window.location.hash = '';
    set({
      gameState: GAME_STATES.QUIZ_QUESTION,
      currentQuestionIndex: 0,
      currentPlayerIndex: 0,
      timeLeft: get().timerSeconds,
    });
    return true;
  },

  // Test mode - start quiz without full player requirements
  startQuizTestMode: () => {
    const { players } = get();

    if (players.length === 0) {
      // Add a test player automatically
      get().addPlayer('Test Player');
      // Make them ready
      setTimeout(() => {
        const updatedPlayers = get().players;
        if (updatedPlayers.length > 0) {
          get().togglePlayerReady(updatedPlayers[0].id);
        }
      }, 100);
    }

    // Mark all existing players as ready
    set({
      players: players.map(p => ({ ...p, ready: true }))
    });

    // Clear the hash to allow game state routing
    window.location.hash = '';
    set({
      gameState: GAME_STATES.QUIZ_QUESTION,
      currentQuestionIndex: 0,
      currentPlayerIndex: 0,
      timeLeft: get().timerSeconds,
    });
    return true;
  },

  // Quiz Actions
  startAnswering: (playerId) => {
    set({
      quizPhase: 'answering',
      currentAnswerer: playerId,
    });
  },

  submitAnswer: (answerIndex) => {
    const { selectedQuestions, currentQuestionIndex, currentAnswerer, players } = get();
    const question = selectedQuestions[currentQuestionIndex];
    const isCorrect = answerIndex === question.correct;

    if (isCorrect) {
      // Award key to player
      set({
        players: players.map(p =>
          p.id === currentAnswerer ? { ...p, keys: p.keys + 1 } : p
        ),
        lastAnswerCorrect: true,
        quizPhase: 'result',
      });
    } else {
      set({
        lastAnswerCorrect: false,
        quizPhase: 'result',
      });
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex, selectedQuestions, currentPlayerIndex, players, timerSeconds } = get();

    if (currentQuestionIndex + 1 >= selectedQuestions.length) {
      // Quiz finished, move to board
      set({
        gameState: GAME_STATES.BOARD_INTRO,
        currentPlayerIndex: 0,
      });
    } else {
      // Next question
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        currentPlayerIndex: nextPlayerIndex,
        gameState: GAME_STATES.QUIZ_QUESTION,
        quizPhase: 'waiting',
        currentAnswerer: null,
        lastAnswerCorrect: null,
        timeLeft: timerSeconds,
      });
    }
  },

  openForAll: () => {
    set({ quizPhase: 'open_for_all' });
  },

  decrementTime: () => {
    const { timeLeft } = get();
    if (timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 });
    }
    if (timeLeft === 1) {
      get().openForAll();
    }
  },

  // Board Actions
  startBoardPhase: () => {
    set({
      gameState: GAME_STATES.BOARD_PLAYER_TURN,
      currentPlayerIndex: 0,
    });
  },

  openCircle: (circleIndex) => {
    const { openedCircles, players, currentPlayerIndex, boardLayout } = get();

    if (openedCircles.includes(circleIndex)) {
      alert('עיגול זה כבר נפתח');
      return false;
    }

    const gender = boardLayout[circleIndex];

    set({
      openedCircles: [...openedCircles, circleIndex],
      players: players.map((p, idx) =>
        idx === currentPlayerIndex
          ? { ...p, keys: p.keys - 1, circlesOpened: [...p.circlesOpened, { index: circleIndex, gender }] }
          : p
      ),
      gameState: GAME_STATES.BOARD_OPENED,
    });

    return true;
  },

  nextPlayerTurn: () => {
    const { players, currentPlayerIndex } = get();

    // Check if current player has more keys
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer.keys > 0) {
      set({ gameState: GAME_STATES.BOARD_PLAYER_TURN });
      return;
    }

    // Find next player with keys
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    let cycles = 0;

    while (cycles < players.length) {
      if (players[nextIndex].keys > 0) {
        set({
          currentPlayerIndex: nextIndex,
          gameState: GAME_STATES.BOARD_PLAYER_TURN,
        });
        return;
      }
      nextIndex = (nextIndex + 1) % players.length;
      cycles++;
    }

    // No more keys, move to reveal
    set({ gameState: GAME_STATES.REVEAL_SUSPENSE });
  },

  // Reveal Actions
  startReveal: () => {
    set({ gameState: GAME_STATES.FINAL_REVEAL });
  },

  calculateWinner: () => {
    const { players, babyGender } = get();

    // Count correct gender circles for each player
    const playersWithScores = players.map(player => {
      const correctCircles = player.circlesOpened.filter(
        circle => circle.gender === babyGender
      ).length;
      return { ...player, correctCircles };
    });

    // Find winner (most correct circles)
    const winner = playersWithScores.reduce((max, player) =>
      player.correctCircles > max.correctCircles ? player : max
    );

    return { winner, playersWithScores };
  },

  resetGame: () => {
    set({
      gameState: GAME_STATES.ADMIN_SETUP,
      babyGender: null,
      selectedQuestions: [],
      currentQuestionIndex: 0,
      boardLayout: [],
      openedCircles: [],
      players: [],
      currentPlayerIndex: 0,
      quizPhase: 'waiting',
      timeLeft: 40,
      currentAnswerer: null,
      lastAnswerCorrect: null,
    });
  },
}));

export default useGameStore;
