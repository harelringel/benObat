const mammoth = require('mammoth');
const fs = require('fs');

mammoth.extractRawText({path: '../שאלות.docx'}).then(result => {
  const text = result.value;

  // Manual parsing based on the actual format
  const questions = [
    {
      text: "מי הראשונ/ה שידע/ה על ההיריון אחרי דפנה והראל?",
      options: ["הילי", "איילה", "ריצ'י"],
      correct: 1
    },
    {
      text: "איזה אירוע היה ביום שבו גילינו על ההיריון?",
      options: ["חתונה של אלי חברה של דפי", "בר מצווה של אחיין של דפי", "רועי ונטלי הודיעו על ההיריון שלהם"],
      correct: 0
    },
    {
      text: "מה החודש המשוער ללידה?",
      options: ["אוקטובר", "נובמבר", "דצמבר"],
      correct: 1
    },
    {
      text: "הבדיקה החיובית הראשונה התגלתה-",
      options: ["עם בחילת בוקר", "בבדיקת דם", "בבדיקת מקל פיפי"],
      correct: 1
    },
    {
      text: "כמה זוגות בחבר'ה של הראל כבר הורים ל2?",
      options: ["זוג אחד", "2 זוגות", "3 זוגות"],
      correct: 1
    },
    {
      text: "איך הודענו על ההיריון הפעם?",
      options: ["בהקלטה קולית", "בהערת וידאו בוואטסאפ", "בתמונה עם כיתוב"],
      correct: 1
    },
    {
      text: "כשסיפרנו על ההיריון של איילה, על מה סבתא נורית התעכבה?",
      options: ["על המכתב המקדים למשחק", "על הפרחים היפים", "על לעזור ליעל למצוא את המטמון שלה"],
      correct: 1
    },
    {
      text: "באיזה גיל איילה אמרה אבא?",
      options: ["7 חודשים", "8.5 חודשים", "10 חודשים"],
      correct: 1
    },
    {
      text: "איך איילה קוראת לשמיכה שלה?",
      options: ["מיכה", "פה", "מיכי"],
      correct: 1
    },
    {
      text: "העובר/ית יהיה או תהיה הנכד/ה השני/יה מצד סבתא נוני, ומהצד השני?",
      options: ["מספר 19", "מספר 20", "מספר 21"],
      correct: 1
    },
    {
      text: "בת כמה איילה תהיה כשתהפוך לאחות גדולה?",
      options: ["שנתיים וחודש", "שנתיים וחצי", "שנתיים ו3 חודשים"],
      correct: 2
    },
    {
      text: "באיזה חודש גילינו על ההיריון של איילה?",
      options: ["אוגוסט", "נובמבר", "אוקטובר"],
      correct: 1
    },
    {
      text: "באיזה חודש גילינו על ההיריון הנוכחי?",
      options: ["ינואר", "דצמבר", "פברואר"],
      correct: 2
    },
    {
      text: "איזה סגנון שם הראל אוהב?",
      options: ["שם יוניסקס שהוא גם לבנים וגם לבנות", "שם בינלאומי", "ישראלי צברי"],
      correct: 2
    },
    {
      text: "באיזה קופת חולים / מרפאה נעשה המעקב?",
      options: ["כללית", "מכבי", "מאוחדת"],
      correct: 1
    },
    {
      text: "איזה ריח הכי מפריע לדפי בתחילת ההיריון?",
      options: ["פסטה בולונז", "קפה", "תירס"],
      correct: 0
    },
    {
      text: "הלידה של איילה הייתה מעל יממה?",
      options: ["נכון", "לא נכון"],
      correct: 0
    },
    {
      text: "כשאיילה אוכלת היא מזמזמת?",
      options: ["נכון", "לא נכון"],
      correct: 0
    },
    {
      text: "יום שלישי הוא היום כיף של איילה והראל?",
      options: ["נכון", "לא נכון"],
      correct: 0
    },
    {
      text: "איילה יודעת לטפס לכיור בשירותים לבד?",
      options: ["נכון", "לא נכון"],
      correct: 0
    }
  ];

  // Save to JSON file
  const output = {
    questions: questions,
    metadata: {
      total: questions.length,
      generated: new Date().toISOString()
    }
  };

  fs.writeFileSync('src/data/default-questions.json', JSON.stringify(output, null, 2), 'utf8');

  console.log(`✅ Parsed ${questions.length} questions successfully!`);
  console.log('Saved to: src/data/default-questions.json');

  // Display first few questions for verification
  console.log('\nFirst 3 questions:');
  questions.slice(0, 3).forEach((q, i) => {
    console.log(`\n${i + 1}. ${q.text}`);
    q.options.forEach((opt, idx) => {
      console.log(`   ${idx === q.correct ? '✓' : ' '} ${opt}`);
    });
  });

}).catch(err => {
  console.error('Error parsing questions:', err);
});
