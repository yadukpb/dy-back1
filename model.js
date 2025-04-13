const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: false },
  age: { type: Number },
  parentName: { type: String },
  
  NoOfQuestions: {
    // This table determines which questions to pick from which topic and difficulty level.
    // Each cell represents how many questions to pick from a particular topic and difficulty level.
    // For example, if R1.3 is 2, that means for R1 (Letters) difficulty level 3 (hard), choose 2 questions.
    // Initially, for the first test, we'll set default values for this, which are totally random.
    // In total, 15 questions would be picked from this configuration.
    // Later on the number of questions would be 10 for rest of the lessons
    R1: { 1: { type: Number, default: 2 }, 2: { type: Number, default: 1 }, 3: { type: Number, default: 0 } },
    R2: { 1: { type: Number, default: 1 }, 2: { type: Number, default: 2 }, 3: { type: Number, default: 0 } },
    R3: { 1: { type: Number, default: 1 }, 2: { type: Number, default: 1 }, 3: { type: Number, default: 1 } },
    R4: { 1: { type: Number, default: 0 }, 2: { type: Number, default: 2 }, 3: { type: Number, default: 1 } },
    R5: { 1: { type: Number, default: 2 }, 2: { type: Number, default: 1 }, 3: { type: Number, default: 0 } },
  },


  Accuracy: {
    // After picking questions, the assessment begins. For each question, the frontend sends a request to backend
    // which calls the ML (Flask) model and returns a score between 0-1 indicating how accurate the response was.
    // The score is added to the corresponding cell in the accuracy schema. For example, for an R1 level 1 question,
    // the accuracy score would be added to R1.1. If multiple questions of the same type and level are answered,
    // their scores will be summed in the corresponding cell.
    R1: { 1: { type: Number, default: 0 }, 2: { type: Number, default: 0 }, 3: { type: Number, default: 0 } },
    R2: { 1: { type: Number, default: 0 }, 2: { type: Number, default: 0 }, 3: { type: Number, default: 0 } },
    R3: { 1: { type: Number, default: 0 }, 2: { type: Number, default: 0 }, 3: { type: Number, default: 0 } },
    R4: { 1: { type: Number, default: 0 }, 2: { type: Number, default: 0 }, 3: { type: Number, default: 0 } },
    R5: { 1: { type: Number, default: 0 }, 2: { type: Number, default: 0 }, 3: { type: Number, default: 0 } },
    isActive: { type: Boolean, required: false }
  },

  mastery: {
    // Mastery is aggregated across all difficulty levels for each category
    // This is the core of the adaptive learning algorithm. It determines:
    // 1. How many questions to select from each topic
    // 2. The difficulty distribution of those questions
    // The algorithm will automatically adjust as the student improves:
    // - When a student answers correctly, mastery increases
    // - As mastery increases, fewer questions are selected from that category
    // - Focus shifts to areas where the student is weaker
    // Mastery scores are updated after each assessment based on accuracy

    R1: { type: Number, default: 0.7, min: 0, max: 1 },  // Letters - most users have basic letter recognition
    R2: { type: Number, default: 0.6, min: 0, max: 1 },  // Words - slightly lower than letters
    R3: { type: Number, default: 0.5, min: 0, max: 1 },  // Sentence - neutral starting point
    R4: { type: Number, default: 0.4, min: 0, max: 1 },  // Comprehension - typically more challenging
    R5: { type: Number, default: 0.3, min: 0, max: 1 }   // Complex - most challenging, lower starting point
  },

  // Writing section (new additions)
  WritingNoOfQuestions: {
    W1: { 1: { type: Number, default: 1 }, 2: { type: Number, default: 1 }, 3: { type: Number, default: 0 } },  // Letter Formation
    W2: { 1: { type: Number, default: 1 }, 2: { type: Number, default: 1 }, 3: { type: Number, default: 0 } },  // Word Writing
    W3: { 1: { type: Number, default: 1 }, 2: { type: Number, default: 1 }, 3: { type: Number, default: 0 } }   // Sentence Writing
  },

  WritingAccuracy: {
    W1: { 1: { type: Number, default: 0 }, 2: { type: Number, default: 0 }, 3: { type: Number, default: 0 } },
    W2: { 1: { type: Number, default: 0 }, 2: { type: Number, default: 0 }, 3: { type: Number, default: 0 } },
    W3: { 1: { type: Number, default: 0 }, 2: { type: Number, default: 0 }, 3: { type: Number, default: 0 } },
    isActive: { type: Boolean, required: false }
  },

  WritingMastery: {
    W1: { type: Number, default: 0.5, min: 0, max: 1 },  // Letter Formation
    W2: { type: Number, default: 0.4, min: 0, max: 1 },  // Word Writing
    W3: { type: Number, default: 0.3, min: 0, max: 1 }   // Sentence Writing
  }
});


const User = mongoose.model('User', userSchema);
module.exports = { User };
