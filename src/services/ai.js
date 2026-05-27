import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
// API key should be stored in environment variable for security
const getClient = () => {
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('REACT_APP_ANTHROPIC_API_KEY not configured');
  }

  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true // Only for demo - in production use a backend proxy
  });
};

/**
 * Generate trivia questions using Claude AI
 * @param {string} prompt - User's custom prompt
 * @param {number} count - Number of questions to generate
 * @param {string} topic - Optional topic
 * @param {string} difficulty - Optional difficulty (easy, medium, hard)
 * @returns {Promise<Array>} Array of generated questions
 */
export async function generateQuestions({ prompt, count = 5, topic = '', difficulty = 'medium' }) {
  try {
    const client = getClient();

    const systemPrompt = `You are a trivia question generator for a Hebrew gender reveal party game. Generate exactly ${count} multiple-choice questions in Hebrew.

Return ONLY valid JSON with NO additional text or markdown. The format must be:
[
  {
    "text": "שאלה בעברית?",
    "options": ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
    "correct": 0,
    "category": "general",
    "difficulty": "medium"
  }
]

Rules:
- text: question in Hebrew
- options: exactly 4 answers in Hebrew
- correct: index of correct answer (0-3)
- category: one of (general, science, geography, sports, entertainment, history)
- difficulty: one of (easy, medium, hard)
- Return ONLY the JSON array, NO markdown code blocks, NO explanations`;

    const userPrompt = prompt || `צור ${count} שאלות טריוויה ${topic ? `בנושא "${topic}"` : ''} ברמת קושי ${difficulty}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: userPrompt
      }],
      system: systemPrompt
    });

    // Extract text content
    const responseText = message.content[0].text;

    // Clean response - remove markdown code blocks if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    // Parse JSON
    const questions = JSON.parse(cleanedText);

    // Validate structure
    if (!Array.isArray(questions)) {
      throw new Error('Response is not an array');
    }

    // Validate each question
    questions.forEach((q, idx) => {
      if (!q.text || typeof q.text !== 'string') {
        throw new Error(`Question ${idx + 1}: missing or invalid text`);
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${idx + 1}: must have exactly 4 options`);
      }
      if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) {
        throw new Error(`Question ${idx + 1}: correct must be 0-3`);
      }
      if (!q.category) {
        q.category = 'general';
      }
      if (!q.difficulty) {
        q.difficulty = difficulty;
      }
    });

    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}

/**
 * Quick question generation with presets
 */
export async function generateQuestionsPreset(preset) {
  const presets = {
    easy: {
      prompt: 'צור 5 שאלות כלליות ברמת קושי קלה, מתאימות למשפחה',
      count: 5,
      difficulty: 'easy'
    },
    medium: {
      prompt: 'צור 5 שאלות מגוונות ברמת קושי בינונית',
      count: 5,
      difficulty: 'medium'
    },
    hard: {
      prompt: 'צור 5 שאלות מאתגרות ברמת קושי קשה',
      count: 5,
      difficulty: 'hard'
    },
    family: {
      prompt: 'צור 10 שאלות משפחתיות מגוונות - ילדים, היריון, משפחה',
      count: 10,
      topic: 'משפחה',
      difficulty: 'easy'
    },
    science: {
      prompt: 'צור 5 שאלות מדע כלליות ברמת קושי בינונית',
      count: 5,
      topic: 'מדע',
      difficulty: 'medium'
    },
    israel: {
      prompt: 'צור 5 שאלות על ישראל - גיאוגרפיה, היסטוריה, תרבות',
      count: 5,
      topic: 'ישראל',
      difficulty: 'medium'
    }
  };

  const config = presets[preset];
  if (!config) {
    throw new Error(`Unknown preset: ${preset}`);
  }

  return generateQuestions(config);
}
