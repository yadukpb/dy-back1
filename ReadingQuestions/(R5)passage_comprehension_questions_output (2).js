const r5 = {
  id: "R5",
  "1": [
    {
      passage: "The cat is black. It likes to sleep in the sun. The dog is brown.",
      question: "What color is the cat?",
      correct_answer: "Black",
      level: 1,
      tag: "R5"
    },
    {
      passage: "The sky is blue. There are many clouds. The sun is shining.",
      question: "What color is the sky?",
      correct_answer: "Blue",
      level: 1,
      tag: "R5"
    },
    {
      passage: "The tree has green leaves. Birds sing in its branches.",
      question: "What color are the leaves?",
      correct_answer: "Green",
      level: 1,
      tag: "R5"
    }
  ],// ... existing code ...
  "2": [
    {
      passage: "In the park, there are many trees and flowers. A girl sits on a bench reading a book. The sun shines brightly, and birds chirp happily.",
      question: "What did the girl do in the park?",
      correct_answer: "She sat on a bench reading a book.",
      level: 2,
      tag: "R5"
    },
    {
      passage: "The boy kicked the ball into the river. He was sad but then decided to play with his friends.",
      question: "What did the boy do after he lost the ball?",
      correct_answer: "He decided to play with his friends.",
      level: 2,
      tag: "R5"
    },
    {
      passage: "The library was quiet. Students were studying. A teacher helped a student with math.",
      question: "What was the teacher doing in the library?",
      correct_answer: "Helping a student with math.",
      level: 2,
      tag: "R5"
    }
  ],
  "3": [
    {
      passage: "In a small village, a kind man named John decided to help his neighbors. Every day, he would lend a hand to anyone in need, whether it was fixing a roof or sharing food. His actions inspired others, and soon, the entire village began to work together to support one another.",
      question: "Why do you think John's actions inspired the villagers?",
      correct_answer: "Because he helped others and showed the importance of community.",
      level: 3,
      tag: "R5"
    },
    {
      passage: "During the summer, a group of friends planned a camping trip. They packed their bags, chose a beautiful spot near a lake, and spent the weekend exploring nature. They learned to set up a tent and even caught some fish for dinner.",
      question: "What skills did the friends learn during their camping trip?",
      correct_answer: "They learned to set up a tent and catch fish.",
      level: 3,
      tag: "R5"
    },
    {
      passage: "A scientist discovered a new species of bird in the rainforest. This bird had vibrant colors and unique songs that had never been documented before. The discovery excited researchers and raised awareness about the importance of preserving natural habitats.",
      question: "Why was the discovery of the new bird significant?",
      correct_answer: "It raised awareness about the importance of preserving natural habitats.",
      level: 3,
      tag: "R5"
    }
  ]
};

/**
 * Get a specified number of questions from a level
 * @param {Object} data - The question bank (like r5)
 * @param {number|string} level - The level to pull from ("1", "2", "3")
 * @param {number} count - How many questions to return
 * @returns {Array} - Array of question objects (in full)
 */
function R5FetchQuestions(data, level, count) {
  // Check if data is undefined or null
  if (!data) {
    console.error(`[${new Date().toISOString()}] [R5FetchQuestions] Error: Data parameter is undefined or null`);
    return [];
  }
  
  const levelStr = level.toString();
  
  // Check if the level exists in the data
  if (!data[levelStr]) {
    console.error(`[${new Date().toISOString()}] [R5FetchQuestions] Error: Level ${levelStr} not found in data`);
    return [];
  }

  if (!Array.isArray(data[levelStr])) {
    console.error(`[${new Date().toISOString()}] [R5FetchQuestions] Error: Level ${levelStr} is not an array`);
    return [];
  }

  // Shuffle the questions
  const shuffled = [...data[levelStr]].sort(() => 0.5 - Math.random());

  // Return the requested number of questions (or all if count exceeds available questions)
  return shuffled.slice(0, Math.min(count, shuffled.length));
}


// ES Module export
export { r5, R5FetchQuestions };

// CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { r5, R5FetchQuestions };
}
