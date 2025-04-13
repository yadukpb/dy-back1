// File: (R4)noun_classification_questions_output.js

// Define the R4 object
const R4 = {
  id: "R4",
  "1": [
    {
      question: "Identify the common nouns in the following sentence: 'The cat sat on the mat.'",
      correct_answer: "cat, mat",
      level: 1,
      tag: "R4"
    },
    {
      question: "Which of the following is a proper noun? 'city, Paris, car'",
      correct_answer: "Paris",
      level: 1,
      tag: "R4"
    },
    {
      question: "Find the common nouns: 'The dog barked at the man.'",
      correct_answer: "dog, man",
      level: 1,
      tag: "R4"
    }
  ],
  "2": [
    {
      question: "Identify the proper nouns in the following sentence: 'Alice went to London for her vacation.'",
      correct_answer: "Alice, London",
      level: 2,
      tag: "R4"
    },
    {
      question: "What type of noun is 'happiness'?",
      correct_answer: "Abstract noun",
      level: 2,
      tag: "R4"
    },
    {
      question: "Classify the nouns: 'The team won the championship.'",
      correct_answer: "team (collective noun), championship (common noun)",
      level: 2,
      tag: "R4"
    }
  ],
  "3": [
    {
      question: "In the sentence, 'The committee decided to change the rules,' identify the collective noun.",
      correct_answer: "committee",
      level: 3,
      tag: "R4"
    },
    {
      question: "Identify the abstract nouns in the following sentence: 'Freedom and justice are essential values.'",
      correct_answer: "Freedom, justice",
      level: 3,
      tag: "R4"
    },
    {
      question: "Classify the nouns in this sentence: 'New York is a bustling city with a rich history.'",
      correct_answer: "New York (proper noun), city (common noun), history (abstract noun)",
      level: 3,
      tag: "R4"
    }
  ]
};

/**
 * Get a specified number of questions from a level
 * @param {Object} data - The question bank (like R4)
 * @param {number|string} level - The level to pull from ("1", "2", "3")
 * @param {number} count - How many questions to return
 * @returns {Array} - Array of question objects
 */
function R4FetchQuestions(data, level, count) {
  // Check if data is undefined or null
  if (!data) {
    console.error(`[${new Date().toISOString()}] [R4FetchQuestions] Error: Data parameter is undefined or null`);
    return [];
  }
  
  const levelStr = level.toString();
  
  // Check if the level exists in the data
  if (!data[levelStr]) {
    console.error(`[${new Date().toISOString()}] [R4FetchQuestions] Error: Level ${levelStr} not found in data`);
    return [];
  }

  if (!Array.isArray(data[levelStr])) {
    console.error(`[${new Date().toISOString()}] [R4FetchQuestions] Error: Level ${levelStr} is not an array`);
    return [];
  }

  // Shuffle the questions
  const shuffled = [...data[levelStr]].sort(() => 0.5 - Math.random());

  // Return the requested number of questions (or all if count exceeds available questions)
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Make R4 available globally (as a fallback)
global.R4 = R4;

// Export for both ES modules and CommonJS
// ES Module export
export { R4, R4FetchQuestions };

// CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { R4, R4FetchQuestions };
}