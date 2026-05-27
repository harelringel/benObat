# 🍼 Gender Reveal Game - Multiplayer Version

אפליקציית משחק מסיבת גילוי מין אינטראקטיבית עם תמיכה במולטיפלייר בזמן אמת!

## ✨ Features

- 🎮 **Real-time Multiplayer** - עד 8 שחקנים במשחק אחד
- 🔐 **Room Codes** - קוד PIN בן 6 ספרות לכל משחק
- 🤖 **AI Question Generation** - יצירת שאלות עם Claude AI
- 📝 **Advanced Question Manager** - בנק שאלות, יצירה ידנית, ויצירה עם AI
- 🗝️ **Key Board System** - לוח מפתחות מעוצב בסגנול ששטוס
- 🎉 **Dramatic Reveal** - גילוי מרגש עם אנימציות וקונפטי

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key (optional, for AI question generation)

### 1. Setup Backend Server

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start server
npm start
```

Server will run on `http://localhost:3001`

### 2. Setup Frontend

```bash
# Navigate to project root
cd ..

# Install dependencies (if not already done)
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your Anthropic API key (optional)
# REACT_APP_ANTHROPIC_API_KEY=your_api_key_here

# Start frontend
npm start
```

Frontend will run on `http://localhost:3000`

---

## 🎮 How to Play

### Admin Flow:

1. Open `http://localhost:3000`
2. Click "👑 מנהל" (Admin)
3. Select baby gender (stays secret!)
4. Configure game settings:
   - Number of players (2-8)
   - Number of questions (5-15)
   - Board size (3×3, 4×4, 5×5)
5. Select questions:
   - 🎲 Random selection
   - ✅ Manual selection from bank
   - ⚙️ Manage questions (edit, create, AI generate)
6. Click "צור חדר והתחל!" (Create Room & Start)
7. Share the 6-digit PIN with players
8. Wait for all players to join and be ready
9. Start the quiz!

### Player Flow:

1. Open `http://localhost:3000` (on your device)
2. Click "👥 משתתף" (Player)
3. Enter the 6-digit room PIN
4. Enter your name
5. Click "הצטרף למשחק" (Join Game)
6. Click "אני מוכן!" (I'm Ready!) when ready
7. Game starts when all players are ready!

### Game Phases:

1. **Quiz Round** - Answer trivia questions to earn keys 🗝️
2. **Key Board** - Use keys to open circles and reveal colors
3. **Final Reveal** - Dramatic reveal of baby gender + winner announcement!

---

## 🤖 AI Question Generation

The app supports AI-powered question generation using Claude!

### Setup:

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Add to `.env` file:
   ```
   REACT_APP_ANTHROPIC_API_KEY=sk-ant-api03-xxx
   ```

### Usage:

1. Go to Admin Setup → Questions → "⚙️ ניהול שאלות"
2. Click "🤖 יצירה עם AI" tab
3. Choose preset or write custom prompt
4. Click "צור שאלות עם AI"
5. Review generated questions and add to bank

### Presets Available:

- 😊 5 Easy Questions
- 🤔 5 Medium Questions
- 🧠 5 Hard Questions
- 👨‍👩‍👧‍👦 10 Family Questions
- 🔬 5 Science Questions
- 🇮🇱 5 Israel Questions

---

## 📁 Project Structure

```
gender-reveal-app/
├── server/                    # Backend Socket.io server
│   ├── index.js              # Main server file
│   ├── gameRoom.js           # Room management logic
│   └── package.json
├── src/
│   ├── services/
│   │   ├── socket.js         # Socket.io client
│   │   └── ai.js             # Anthropic AI integration
│   ├── store/
│   │   └── socketGameStore.js # Zustand store with Socket.io
│   ├── screens/
│   │   ├── WelcomeMultiplayer.jsx
│   │   ├── AdminSetupMultiplayer.jsx
│   │   ├── PlayerLobbyMultiplayer.jsx
│   │   ├── QuestionManagerEnhanced.jsx
│   │   ├── QuizRound.jsx
│   │   ├── KeyBoardStage.jsx
│   │   └── FinalReveal.jsx
│   └── AppMultiplayer.jsx    # Main app router
└── package.json
```

---

## 🔧 Configuration

### Environment Variables:

**Frontend (.env):**
```
REACT_APP_SOCKET_URL=http://localhost:3001
REACT_APP_ANTHROPIC_API_KEY=your_api_key_here
```

**Backend (server/.env or environment):**
```
PORT=3001
CLIENT_URL=http://localhost:3000
```

---

## 🌐 Deployment

### Deploy Backend (Railway):

```bash
cd server

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up

# Get deployment URL
railway domain
```

### Deploy Frontend (Vercel):

```bash
# Update .env with production backend URL
REACT_APP_SOCKET_URL=https://your-backend.railway.app

# Deploy
vercel --prod
```

---

## 🎨 Game Features

### Question Manager (3 Modes):

1. **📚 Bank Selection** - Browse and select from existing questions
2. **✏️ Manual Creation** - Create custom questions with category/difficulty
3. **🤖 AI Generation** - Generate questions using Claude AI

### Quiz Mechanics:

- Each player gets a turn to answer
- 40-second timer (configurable)
- If timer expires or wrong answer → "Open for All" mode
- First to buzz in gets to answer
- Correct answer = 1 key 🗝️

### Key Board:

- Use earned keys to open circles
- Each circle reveals blue (boy) or pink (girl)
- 60-70% of circles match the actual baby gender
- Strategic opening creates suspense!

### Winner Calculation:

- Player with most circles matching the actual baby gender wins
- Not just about keys - about choosing correctly!

---

## 🐛 Troubleshooting

### "Cannot connect to server"

- Make sure backend server is running on port 3001
- Check `REACT_APP_SOCKET_URL` in .env
- Check firewall settings

### "Room not found"

- Room codes expire when admin disconnects
- Make sure admin stays connected during game

### AI questions not generating

- Check `REACT_APP_ANTHROPIC_API_KEY` is set correctly
- Verify API key is valid
- Check browser console for errors
- Note: AI feature requires API key and internet connection

### Players can't join

- Verify all devices are on the same network (for local testing)
- Check room PIN is correct (6 digits)
- Make sure game hasn't started yet

---

## 📝 License

MIT License

---

## 🤝 Contributing

Feel free to submit issues and pull requests!

---

## 🎉 Credits

Built with:
- React 19
- Socket.io
- Zustand
- Framer Motion
- Tailwind CSS
- Anthropic Claude AI
- Canvas Confetti

---

**Enjoy your gender reveal party! 🎊👶**
