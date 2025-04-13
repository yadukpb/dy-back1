const W1 = {
    id: "W1",
    "1": [
        {
            question: "Write the letter 'a' on your paper.",
            prompt: "Look at the letter 'a'. Write the letter 'a' on your paper.",
            correct_answer: ["a"],
            feedback: {
                correct: "Great job! You wrote the letter 'a' correctly.",
                incorrect: "Let's try again. The letter 'a' is a circle with a tail."
            },
            level: 1,
            tag: "W1"
        },
        {
            question: "Write the letter 'b' on your paper.",
            prompt: "Look at the letter 'b'. Write the letter 'b' on your paper.",
            correct_answer: ["b"],
            feedback: {
                correct: "Excellent! You wrote the letter 'b' correctly.",
                incorrect: "Let's try again. The letter 'b' is a straight line with a circle."
            },
            level: 1,
            tag: "W1"
        },
        {
            question: "Write the letter 'c' on your paper.",
            prompt: "Look at the letter 'c'. Write the letter 'c' on your paper.",
            correct_answer: ["c"],
            feedback: {
                correct: "Perfect! You wrote the letter 'c' correctly.",
                incorrect: "Let's try again. The letter 'c' is a curved line like a moon."
            },
            level: 1,
            tag: "W1"
        }
    ],
    "2": [
        {
            question: "Write the letter 'd' on your paper.",
            prompt: "Look at the letter 'd'. Write the letter 'd' on your paper.",
            correct_answer: ["d"],
            feedback: {
                correct: "Great job! You wrote the letter 'd' correctly.",
                incorrect: "Let's try again. The letter 'd' is a circle with a tall line."
            },
            level: 2,
            tag: "W1"
        },
        {
            question: "Write the letter 'e' on your paper.",
            prompt: "Look at the letter 'e'. Write the letter 'e' on your paper.",
            correct_answer: ["e"],
            feedback: {
                correct: "Excellent! You wrote the letter 'e' correctly.",
                incorrect: "Let's try again. The letter 'e' is a straight line with curves."
            },
            level: 2,
            tag: "W1"
        },
        {
            question: "Write the letter 'f' on your paper.",
            prompt: "Look at the letter 'f'. Write the letter 'f' on your paper.",
            correct_answer: ["f"],
            feedback: {
                correct: "Perfect! You wrote the letter 'f' correctly.",
                incorrect: "Let's try again. The letter 'f' has two lines and a curve."
            },
            level: 2,
            tag: "W1"
        }
    ],
    "3": [
        {
            question: "Write the letter 'g' on your paper.",
            prompt: "Look at the letter 'g'. Write the letter 'g' on your paper.",
            correct_answer: ["g"],
            feedback: {
                correct: "Great job! You wrote the letter 'g' correctly.",
                incorrect: "Let's try again. The letter 'g' has a circle and a tail."
            },
            level: 3,
            tag: "W1"
        },
        {
            question: "Write the letter 'h' on your paper.",
            prompt: "Look at the letter 'h'. Write the letter 'h' on your paper.",
            correct_answer: ["h"],
            feedback: {
                correct: "Excellent! You wrote the letter 'h' correctly.",
                incorrect: "Let's try again. The letter 'h' has two lines and a curve."
            },
            level: 3,
            tag: "W1"
        },
        {
            question: "Write the letter 'i' on your paper.",
            prompt: "Look at the letter 'i'. Write the letter 'i' on your paper.",
            correct_answer: ["i"],
            feedback: {
                correct: "Perfect! You wrote the letter 'i' correctly.",
                incorrect: "Let's try again. The letter 'i' is a straight line with a dot."
            },
            level: 3,
            tag: "W1"
        }
    ]
};

/**
 * Get a specified number of questions from a level
 * @param {Object} data - The question bank (like W1)
 * @param {number|string} level - The level to pull from ("1", "2", "3")
 * @param {number} count - How many questions to return
 * @returns {Array} - Array of question objects (in full)
 */
function W1QuestionFetcher(data, level, count) {
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

export { W1, W1QuestionFetcher as W1FetchQuestions };
