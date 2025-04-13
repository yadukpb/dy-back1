const W3 = {
    id: "W3",
    "1": [
        {
            question: "Write the word 'cat' on your paper.",
            prompt: "Look at the picture of a cat. Write the word 'cat' on your paper.",
            correct_answer: ["cat"],
            feedback: {
                correct: "Great job! You wrote the word 'cat' correctly.",
                incorrect: "Let's try again. The word 'cat' is spelled c-a-t."
            },
            level: 1,
            tag: "W3"
        },
        {
            question: "Write the word 'dog' on your paper.",
            prompt: "Look at the picture of a dog. Write the word 'dog' on your paper.",
            correct_answer: ["dog"],
            feedback: {
                correct: "Excellent! You wrote the word 'dog' correctly.",
                incorrect: "Let's try again. The word 'dog' is spelled d-o-g."
            },
            level: 1,
            tag: "W3"
        },
        {
            question: "Write the word 'bat' on your paper.",
            prompt: "Look at the picture of a bat. Write the word 'bat' on your paper.",
            correct_answer: ["bat"],
            feedback: {
                correct: "Perfect! You wrote the word 'bat' correctly.",
                incorrect: "Let's try again. The word 'bat' is spelled b-a-t."
            },
            level: 1,
            tag: "W3"
        }
    ],
    "2": [
        {
            question: "Write the sentence 'The cat is big.'",
            prompt: "Write the sentence 'The cat is big.' on your paper.",
            correct_answer: ["The cat is big."],
            feedback: {
                correct: "Great job! You wrote the sentence correctly.",
                incorrect: "Let's try again. The sentence is 'The cat is big.'"
            },
            level: 2,
            tag: "W3"
        },
        {
            question: "Write the sentence 'I see a dog.'",
            prompt: "Write the sentence 'I see a dog.' on your paper.",
            correct_answer: ["I see a dog."],
            feedback: {
                correct: "Excellent! You wrote the sentence correctly.",
                incorrect: "Let's try again. The sentence is 'I see a dog.'"
            },
            level: 2,
            tag: "W3"
        },
        {
            question: "Write the sentence 'The sun is hot.'",
            prompt: "Write the sentence 'The sun is hot.' on your paper.",
            correct_answer: ["The sun is hot."],
            feedback: {
                correct: "Perfect! You wrote the sentence correctly.",
                incorrect: "Let's try again. The sentence is 'The sun is hot.'"
            },
            level: 2,
            tag: "W3"
        }
    ],
    "3": [
        {
            question: "Write the sentence 'The big cat is on the mat.'",
            prompt: "Write the sentence 'The big cat is on the mat.' on your paper.",
            correct_answer: ["The big cat is on the mat."],
            feedback: {
                correct: "Great job! You wrote the sentence correctly.",
                incorrect: "Let's try again. The sentence is 'The big cat is on the mat.'"
            },
            level: 3,
            tag: "W3"
        },
        {
            question: "Write the sentence 'I see a big dog in the park.'",
            prompt: "Write the sentence 'I see a big dog in the park.' on your paper.",
            correct_answer: ["I see a big dog in the park."],
            feedback: {
                correct: "Excellent! You wrote the sentence correctly.",
                incorrect: "Let's try again. The sentence is 'I see a big dog in the park.'"
            },
            level: 3,
            tag: "W3"
        },
        {
            question: "Write the sentence 'The hot sun is in the sky.'",
            prompt: "Write the sentence 'The hot sun is in the sky.' on your paper.",
            correct_answer: ["The hot sun is in the sky."],
            feedback: {
                correct: "Perfect! You wrote the sentence correctly.",
                incorrect: "Let's try again. The sentence is 'The hot sun is in the sky.'"
            },
            level: 3,
            tag: "W3"
        }
    ]
};

/**
 * Get a specified number of questions from a level
 * @param {Object} data - The question bank (like W3)
 * @param {number|string} level - The level to pull from ("1", "2", "3")
 * @param {number} count - How many questions to return
 * @returns {Array} - Array of question objects (in full)
 */
function W3QuestionFetcher(data, level, count) {
    // Validate inputs
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data provided');
    }
    
    const levelKey = level.toString();
    if (!data[levelKey]) {
        return [];
    }

    // Better shuffle using Fisher-Yates algorithm
    const shuffled = [...data[levelKey]];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return only the available questions if count exceeds the number of questions
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

module.exports = { W3, W3FetchQuestions: W3QuestionFetcher };