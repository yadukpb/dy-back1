const W2 = {
    id: "W2",
    "1": [
        {
            question: "Write the word 'was' on your paper.",
            prompt: "Look at the word 'was'. Write the word 'was' on your paper.",
            correct_answer: ["was"],
            feedback: {
                correct: "Great job! You wrote the word 'was' correctly.",
                incorrect: "Let's try again. The word 'was' is spelled w-a-s."
            },
            level: 1,
            tag: "W2"
        },
        {
            question: "Write the word 'saw' on your paper.",
            prompt: "Look at the word 'saw'. Write the word 'saw' on your paper.",
            correct_answer: ["saw"],
            feedback: {
                correct: "Excellent! You wrote the word 'saw' correctly.",
                incorrect: "Let's try again. The word 'saw' is spelled s-a-w."
            },
            level: 1,
            tag: "W2"
        },
        {
            question: "Write the word 'on' on your paper.",
            prompt: "Look at the word 'on'. Write the word 'on' on your paper.",
            correct_answer: ["on"],
            feedback: {
                correct: "Perfect! You wrote the word 'on' correctly.",
                incorrect: "Let's try again. The word 'on' is spelled o-n."
            },
            level: 1,
            tag: "W2"
        }
    ],
    "2": [
        {
            question: "Write the word 'no' on your paper.",
            prompt: "Look at the word 'no'. Write the word 'no' on your paper.",
            correct_answer: ["no"],
            feedback: {
                correct: "Great job! You wrote the word 'no' correctly.",
                incorrect: "Let's try again. The word 'no' is spelled n-o."
            },
            level: 2,
            tag: "W2"
        },
        {
            question: "Write the word 'of' on your paper.",
            prompt: "Look at the word 'of'. Write the word 'of' on your paper.",
            correct_answer: ["of"],
            feedback: {
                correct: "Excellent! You wrote the word 'of' correctly.",
                incorrect: "Let's try again. The word 'of' is spelled o-f."
            },
            level: 2,
            tag: "W2"
        },
        {
            question: "Write the word 'for' on your paper.",
            prompt: "Look at the word 'for'. Write the word 'for' on your paper.",
            correct_answer: ["for"],
            feedback: {
                correct: "Perfect! You wrote the word 'for' correctly.",
                incorrect: "Let's try again. The word 'for' is spelled f-o-r."
            },
            level: 2,
            tag: "W2"
        }
    ],
    "3": [
        {
            question: "Write the word 'from' on your paper.",
            prompt: "Look at the word 'from'. Write the word 'from' on your paper.",
            correct_answer: ["from"],
            feedback: {
                correct: "Great job! You wrote the word 'from' correctly.",
                incorrect: "Let's try again. The word 'from' is spelled f-r-o-m."
            },
            level: 3,
            tag: "W2"
        },
        {
            question: "Write the word 'form' on your paper.",
            prompt: "Look at the word 'form'. Write the word 'form' on your paper.",
            correct_answer: ["form"],
            feedback: {
                correct: "Excellent! You wrote the word 'form' correctly.",
                incorrect: "Let's try again. The word 'form' is spelled f-o-r-m."
            },
            level: 3,
            tag: "W2"
        },
        {
            question: "Write the word 'their' on your paper.",
            prompt: "Look at the word 'their'. Write the word 'their' on your paper.",
            correct_answer: ["their"],
            feedback: {
                correct: "Perfect! You wrote the word 'their' correctly.",
                incorrect: "Let's try again. The word 'their' is spelled t-h-e-i-r."
            },
            level: 3,
            tag: "W2"
        }
    ]
};

/**
 * Get a specified number of questions from a level
 * @param {Object} data - The question bank (like W2)
 * @param {number|string} level - The level to pull from ("1", "2", "3")
 * @param {number} count - How many questions to return
 * @returns {Array} - Array of question objects (in full)
 */
function W2QuestionFetcher(data, level, count) {
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

export { W2, W2QuestionFetcher as W2FetchQuestions };
