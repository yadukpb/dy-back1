const express = require('express');
const router = express.Router();
const { User, Table } = require('../../model.js');
const { r1, R1QuestionFetcher } = require('../../ReadingQuestions/(R1)Letter.js');
const { R2, R2FetchQuestions } = require('../../ReadingQuestions/(R2)Word.js');
const { R3, R3QuestionFetcher } = require('../../ReadingQuestions/(R3)Sentence.js');
const { R4, R4FetchQuestions } = require('../../ReadingQuestions/(R4)noun_classification_questions_output');
const { R5, R5FetchQuestions } = require('../../ReadingQuestions/(R5)passage_comprehension_questions_output (2)');
const { W1, W1FetchQuestions } = require('../../reading-questions/W1.js');
const { W2, W2FetchQuestions } = require('../../reading-questions/W2.js');
const W3 = require('../../reading-questions/W3.js');
const mongoose = require('mongoose');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Flask API configuration
const FLASK_API_URL = process.env.NODE_ENV === 'production' 
    ? process.env.FLASK_PROD_URL 
    : process.env.FLASK_DEV_URL;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

//========================================================================================================================//

// Question fetching related functions
async function getAdaptiveQuestions(userId) {
    console.log(`[${new Date().toISOString()}] [getAdaptiveQuestions] Starting to fetch questions for user: ${userId}`);
    
    const user = await User.findById(userId);
    if (!user) {
        const errorMsg = `[${new Date().toISOString()}] [getAdaptiveQuestions] Error: User not found for user: ${userId}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    // Convert NoOfQuestions to plain object and extract the integer values
    const noOfQuestions = {};
    for (const module in user.NoOfQuestions) {
        noOfQuestions[module] = {};
        for (const level in user.NoOfQuestions[module]) {
            // Convert the BSON $numberInt to a number
            const value = user.NoOfQuestions[module][level];
            noOfQuestions[module][level] = typeof value === 'object' && value.$numberInt 
                ? parseInt(value.$numberInt) 
                : value;
        }
    }
    
    console.log(`[${new Date().toISOString()}] [getAdaptiveQuestions] Retrieved NoOfQuestions for user ${userId}:`, noOfQuestions);

    const allQuestions = [];
    
    const fetchQuestions = async (module, level, count, fetcher, data) => {
        console.log(`[${new Date().toISOString()}] [getAdaptiveQuestions] Processing ${module} Level ${level} - Requested count: ${count}`);
        if (count > 0) {
            if (!fetcher || typeof fetcher !== 'function') {
                const errorMsg = `[${new Date().toISOString()}] [getAdaptiveQuestions] Invalid fetcher for ${module} Level ${level}: ${typeof fetcher}`;
                console.error(errorMsg);
                throw new Error(errorMsg);
            }
            console.log(`[${new Date().toISOString()}] [getAdaptiveQuestions] Fetching ${count} questions for ${module} Level ${level}`);
            console.log(`[${new Date().toISOString()}] [getAdaptiveQuestions] Fetcher function: ${fetcher.name}`);
            console.log(`[${new Date().toISOString()}] [getAdaptiveQuestions] Data being passed:`, JSON.stringify(data, null, 2));
            
            const questions = await fetcher(data, level, count);
            
            console.log(`[${new Date().toISOString()}] [getAdaptiveQuestions] Fetched ${questions.length} questions for ${module} Level ${level}`);
            console.log(`[${new Date().toISOString()}] [getAdaptiveQuestions] Sample question data:`, questions.length > 0 ? JSON.stringify(questions[0], null, 2) : 'No questions fetched');
            allQuestions.push(...questions);
        } else {
            console.log(`[${new Date().toISOString()}] [getAdaptiveQuestions] Skipping ${module} Level ${level} - No questions requested`);
            console.log(`[${new Date().toISOString()}] [getAdaptiveQuestions] Module ${module} Level ${level} count was ${count}`);
        }
    };

    console.log(`[${new Date().toISOString()}] [getAdaptiveQuestions] Starting parallel question fetching`);
    await Promise.all([
        // R1
        fetchQuestions('R1', 1, noOfQuestions.R1[1], R1QuestionFetcher, r1),
        fetchQuestions('R1', 2, noOfQuestions.R1[2], R1QuestionFetcher, r1),
        fetchQuestions('R1', 3, noOfQuestions.R1[3], R1QuestionFetcher, r1),
        // R2
        fetchQuestions('R2', 1, noOfQuestions.R2[1], R2FetchQuestions, R2),
        fetchQuestions('R2', 2, noOfQuestions.R2[2], R2FetchQuestions, R2),
        fetchQuestions('R2', 3, noOfQuestions.R2[3], R2FetchQuestions, R2),
        // R3
        fetchQuestions('R3', 1, noOfQuestions.R3[1], R3QuestionFetcher, R3),
        fetchQuestions('R3', 2, noOfQuestions.R3[2], R3QuestionFetcher, R3),
        fetchQuestions('R3', 3, noOfQuestions.R3[3], R3QuestionFetcher, R3),
        // R4
        fetchQuestions('R4', 1, noOfQuestions.R4[1], R4FetchQuestions, R4),
        fetchQuestions('R4', 2, noOfQuestions.R4[2], R4FetchQuestions, R4),
        fetchQuestions('R4', 3, noOfQuestions.R4[3], R4FetchQuestions, R4),
        // R5
        fetchQuestions('R5', 1, noOfQuestions.R5[1], R5FetchQuestions, R5),
        fetchQuestions('R5', 2, noOfQuestions.R5[2], R5FetchQuestions, R5),
        fetchQuestions('R5', 3, noOfQuestions.R5[3], R5FetchQuestions, R5)
    ]);

    console.log(`[${new Date().toISOString()}] [getAdaptiveQuestions] Completed fetching all questions. Total questions fetched: ${allQuestions.length}`);
    return allQuestions;
}

async function Adaptive(userId) {
    try {
        return await getAdaptiveQuestions(userId);
    } catch (error) {
        console.error('Error in Adaptive function:', error);
        throw error;
    }
}

// Question endpoints
router.get('/getReadingQuestions/:userId', async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] [Adaptive] Request received for user ID: ${req.params.userId}`);
        const userId = req.params.userId;
        
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            console.warn(`[${new Date().toISOString()}] [Adaptive] Invalid user ID provided: ${userId}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        console.log(`[${new Date().toISOString()}] [Adaptive] Starting to fetch adaptive questions for user: ${userId}`);
        const questions = await getAdaptiveQuestions(userId);
        console.log(`[${new Date().toISOString()}] [Adaptive] Successfully fetched ${questions.length} questions for user: ${userId}`);

        res.json({
            success: true,
            questions
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] [Adaptive] Error processing request for user ${req.params.userId}:`, {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Fix for the getWritingQuestions endpoint
router.get('/getWritingQuestions/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(`[${new Date().toISOString()}] [getWQuestions] Request received for user ID: ${userId}`);

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get question counts from user's WritingNoOfQuestions instead of NoOfQuestions
        const noOfQuestions = {};
        for (const module in user.WritingNoOfQuestions) {
            noOfQuestions[module] = {};
            for (const level in user.WritingNoOfQuestions[module]) {
                const value = user.WritingNoOfQuestions[module][level];
                noOfQuestions[module][level] = typeof value === 'object' && value.$numberInt 
                    ? parseInt(value.$numberInt) 
                    : value;
                console.log(`[${new Date().toISOString()}] [getWQuestions] Extracted ${module} Level ${level}: ${noOfQuestions[module][level]} questions`);
            }
        }

        const allQuestions = [];
        
        const fetchQuestions = async (module, level, count, fetcher, data) => {
            console.log(`[${new Date().toISOString()}] [getWQuestions] Processing ${module} Level ${level} - Requested count: ${count}`);
            if (count > 0) {
                if (!fetcher || typeof fetcher !== 'function') {
                    const errorMsg = `[${new Date().toISOString()}] [getWQuestions] Invalid fetcher for ${module} Level ${level}: ${typeof fetcher}`;
                    console.error(errorMsg);
                    throw new Error(errorMsg);
                }
                console.log(`[${new Date().toISOString()}] [getWQuestions] Fetching ${count} questions for ${module} Level ${level}`);
                const questions = await fetcher(data, level, count);
                console.log(`[${new Date().toISOString()}] [getWQuestions] Fetched ${questions.length} questions for ${module} Level ${level}`);
                allQuestions.push(...questions);
            } else {
                console.log(`[${new Date().toISOString()}] [getWQuestions] Skipping ${module} Level ${level} - No questions requested`);
            }
        };

        console.log(`[${new Date().toISOString()}] [getWQuestions] Starting parallel question fetching`);
        await Promise.all([
            fetchQuestions('W1', 1, noOfQuestions.W1?.[1] || 0, W1FetchQuestions, W1),
            fetchQuestions('W1', 2, noOfQuestions.W1?.[2] || 0, W1FetchQuestions, W1),
            fetchQuestions('W1', 3, noOfQuestions.W1?.[3] || 0, W1FetchQuestions, W1),
            fetchQuestions('W2', 1, noOfQuestions.W2?.[1] || 0, W2FetchQuestions, W2),
            fetchQuestions('W2', 2, noOfQuestions.W2?.[2] || 0, W2FetchQuestions, W2),
            fetchQuestions('W2', 3, noOfQuestions.W2?.[3] || 0, W2FetchQuestions, W2),
            fetchQuestions('W3', 1, noOfQuestions.W3?.[1] || 0, W3.W3FetchQuestions, W3.W3),
            fetchQuestions('W3', 2, noOfQuestions.W3?.[2] || 0, W3.W3FetchQuestions, W3.W3),
            fetchQuestions('W3', 3, noOfQuestions.W3?.[3] || 0, W3.W3FetchQuestions, W3.W3)
        ]);

        console.log(`[${new Date().toISOString()}] [getWQuestions] Completed fetching all questions. Total questions fetched: ${allQuestions.length}`);
        res.json({
            success: true,
            questions: allQuestions
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] [getWQuestions] Error:`, {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


//=========================================================================================================================//

// Audio comparison endpoint
router.post('/compare-audio/:userId', upload.single('audio'), async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] [compare-audio] Received audio comparison request`);
        const { text } = req.body;
        const audioFile = req.file;
        const userId = req.params.userId;

        if (!text || !audioFile || !userId) {
            console.warn(`[${new Date().toISOString()}] [compare-audio] Missing text, audio file, or user ID in request`);
            return res.status(400).json({
                success: false,
                message: 'Text, audio file, and user ID are required'
            });
        }

        console.log(`[${new Date().toISOString()}] [compare-audio] Received audio file: ${audioFile.originalname}, size: ${audioFile.size} bytes`);
        console.log(`[${new Date().toISOString()}] [compare-audio] Text to compare: ${text}`);

        // Convert the uploaded file to WAV format
        const wavFilePath = path.join(uploadsDir, `converted_${Date.now()}.wav`);
        console.log(`[${new Date().toISOString()}] [compare-audio] Converting audio to WAV format at: ${wavFilePath}`);
        
        exec(`ffmpeg -i "${audioFile.path}" "${wavFilePath}"`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`[${new Date().toISOString()}] [compare-audio] Error converting audio:`, error);
                // Clean up the temporary files
                try {
                    if (fs.existsSync(audioFile.path)) {
                        fs.unlinkSync(audioFile.path);
                    }
                } catch (err) {
                    console.error(`[${new Date().toISOString()}] [compare-audio] Error cleaning up audio file:`, err);
                }
                
                return res.status(500).json({
                    success: false,
                    message: 'Error processing audio file'
                });
            }

            try {
                console.log(`[${new Date().toISOString()}] [compare-audio] Successfully converted audio to WAV`);
                
                // Verify the file exists before proceeding
                if (!fs.existsSync(wavFilePath)) {
                    throw new Error(`WAV file not created at path: ${wavFilePath}`);
                }
                
                // Use FormData from a proper package for Node.js
                const FormData = require('form-data');
                const formData = new FormData();
                formData.append('text', text);
                formData.append('audio', fs.createReadStream(wavFilePath));

                console.log(`[${new Date().toISOString()}] [compare-audio] Sending audio to Flask API at: ${FLASK_API_URL}/audio-comparison`);
                
                // Make request to Flask server using the form-data's headers
                const flaskResponse = await axios.post(`${FLASK_API_URL}/audio-comparison`, formData, {
                    headers: formData.getHeaders(),
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                });

                console.log(`[${new Date().toISOString()}] [compare-audio] Received response from Flask API, score: ${flaskResponse.data.similarity_score}`);

                // Store the score
                const score = parseFloat(flaskResponse.data.similarity_score);

                // Clean up files after processing
                try {
                    if (fs.existsSync(audioFile.path)) {
                        fs.unlinkSync(audioFile.path);
                    }
                    if (fs.existsSync(wavFilePath)) {
                        fs.unlinkSync(wavFilePath);
                    }
                    console.log(`[${new Date().toISOString()}] [compare-audio] Cleaned up temporary files`);
                } catch (err) {
                    console.error(`[${new Date().toISOString()}] [compare-audio] Error cleaning up files:`, err);
                }

                // Get the user's accuracy table
                const user = await User.findById(userId);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }

                // Determine which R and level to update (you'll need to pass these in the request)
                const { R, level } = req.body;
                if (!R || !level) {
                    return res.status(400).json({
                        success: false,
                        message: 'Both R and level are required'
                    });
                }

                // Get the current value or default to 0
                const currentValue = user.Accuracy[R][level] || 0;
                console.log(`[${new Date().toISOString()}] [compare-audio] Current accuracy for ${R} Level ${level}: ${currentValue}`);
                
                // Update the accuracy table
                user.Accuracy[R][level] = currentValue + score;
                console.log(`[${new Date().toISOString()}] [compare-audio] Updated accuracy for ${R} Level ${level}: ${user.Accuracy[R][level]} (added score: ${score})`);
                
                await user.save();
                console.log(`[${new Date().toISOString()}] [compare-audio] Successfully saved updated accuracy for user ${userId}`);

                // Return the similarity score from Flask along with updated accuracy
                res.json({
                    success: true,
                    similarity_score: score,
                    updatedAccuracy: user.Accuracy
                });
                console.log(`[${new Date().toISOString()}] [compare-audio] Successfully sent response with updated accuracy`);
            } catch (error) {
                console.error(`[${new Date().toISOString()}] [compare-audio] Error in audio comparison:`, error);
                // Clean up files in case of error
                try {
                    if (fs.existsSync(audioFile.path)) {
                        fs.unlinkSync(audioFile.path);
                    }
                    if (fs.existsSync(wavFilePath)) {
                        fs.unlinkSync(wavFilePath);
                    }
                } catch (err) {
                    console.error(`[${new Date().toISOString()}] [compare-audio] Error cleaning up files:`, err);
                }
                
                res.status(500).json({
                    success: false,
                    message: error.response?.data?.message || error.message
                });
            }
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] [compare-audio] Error in compare-audio endpoint:`, error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// New endpoint for handwriting comparison
router.post('/compare-handwriting/:userId', upload.single('image'), async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] [compare-handwriting] Received handwriting comparison request`);
        const { text } = req.body;
        const imageFile = req.file;
        const userId = req.params.userId;

        if (!text || !imageFile || !userId) {
            console.warn(`[${new Date().toISOString()}] [compare-handwriting] Missing text, image file, or user ID in request`);
            return res.status(400).json({
                success: false,
                message: 'Text, image file, and user ID are required'
            });
        }

        console.log(`[${new Date().toISOString()}] [compare-handwriting] Received image file: ${imageFile.originalname}, size: ${imageFile.size} bytes`);
        console.log(`[${new Date().toISOString()}] [compare-handwriting] Text to compare: ${text}`);

        // Use FormData to send to Flask
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('text', text);
        formData.append('image', fs.createReadStream(imageFile.path));

        console.log(`[${new Date().toISOString()}] [compare-handwriting] Sending image to Flask API at: ${FLASK_API_URL}/handwriting-comparison`);
        
        // Make request to Flask server
        const flaskResponse = await axios.post(`${FLASK_API_URL}/handwriting-comparison`, formData, {
            headers: formData.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        console.log(`[${new Date().toISOString()}] [compare-handwriting] Received response from Flask API, score: ${flaskResponse.data.similarity_score}`);

        // Store the score
        const score = parseFloat(flaskResponse.data.similarity_score);

        // Get the user's writing accuracy table
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Determine which W and level to update
        const { W, level } = req.body;
        if (!W || !level) {
            return res.status(400).json({
                success: false,
                message: 'Both W and level are required'
            });
        }

        // Get the current value or default to 0
        const currentValue = user.WritingAccuracy[W][level] || 0;
        console.log(`[${new Date().toISOString()}] [compare-handwriting] Current writing accuracy for ${W} Level ${level}: ${currentValue}`);
        
        // Update the writing accuracy table
        user.WritingAccuracy[W][level] = currentValue + score;
        console.log(`[${new Date().toISOString()}] [compare-handwriting] Updated writing accuracy for ${W} Level ${level}: ${user.WritingAccuracy[W][level]} (added score: ${score})`);
        
        await user.save();
        console.log(`[${new Date().toISOString()}] [compare-handwriting] Successfully saved updated writing accuracy for user ${userId}`);

        // Return the similarity score from Flask along with updated accuracy
        res.json({
            success: true,
            similarity_score: score,
            updatedWritingAccuracy: user.WritingAccuracy
        });
        console.log(`[${new Date().toISOString()}] [compare-handwriting] Successfully sent response with updated writing accuracy`);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] [compare-handwriting] Error:`, error);
        // Clean up the temporary file
        try {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        } catch (err) {
            console.error(`[${new Date().toISOString()}] [compare-handwriting] Error cleaning up image file:`, err);
        }
        
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
});

// Update the submit endpoint to reset accuracy after final step
router.get('/submit/:userId', async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] [submit] Starting submission process for user: ${req.params.userId}`);
        const userId = req.params.userId;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            console.warn(`[${new Date().toISOString()}] [submit] Invalid user ID provided: ${userId}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        console.log(`[${new Date().toISOString()}] [submit] Looking up user in database`);
        const user = await User.findById(userId);
        if (!user) {
            console.warn(`[${new Date().toISOString()}] [submit] User not found for ID: ${userId}`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Access embedded documents directly from user
        const { Accuracy, NoOfQuestions, mastery: Mastery } = user;
        console.log(`[${new Date().toISOString()}] [submit] Retrieved user data:`, {
            Accuracy,
            NoOfQuestions,
            Mastery
        });

        const age = user.age || 10; // Default age if not set
        console.log(`[${new Date().toISOString()}] [submit] Using age: ${age}`);
        const modules = ['R1', 'R2', 'R3', 'R4', 'R5'];

        // First, update mastery scores
        console.log(`[${new Date().toISOString()}] [submit] Starting mastery score updates`);
        for (const module of modules) {
            for (let level = 1; level <= 3; level++) {
                const noOfQuestionsCount = NoOfQuestions[module][level];
                if (noOfQuestionsCount > 0) {
                    const accuracyValue = Accuracy[module][level] / noOfQuestionsCount;
                    const previousMastery = Mastery[module] || 0;

                    console.log(`[${new Date().toISOString()}] [submit] Processing ${module} Level ${level}:`, {
                        noOfQuestions: noOfQuestionsCount,
                        accuracyValue,
                        previousMastery
                    });

                    // Prepare data for Flask
                    const data = {
                        task_type: "reading",
                        new_data: {
                            Age: Array.isArray(age) ? age[0] : age,
                            Topic: Array.isArray(module) ? module[0] : module,
                            Difficulty: Array.isArray(level) ? level[0] : level,
                            Accuracy: Array.isArray(accuracyValue) ? accuracyValue[0] : accuracyValue,
                            "Number of Questions": Array.isArray(noOfQuestionsCount) ? noOfQuestionsCount[0] : noOfQuestionsCount,
                            "Previous Mastery Score": Array.isArray(previousMastery) ? previousMastery[0] : previousMastery
                        }
                    };

                    console.log(`[${new Date().toISOString()}] [submit] Sending data to Flask for ${module} Level ${level}:`, data);
                    
                    // Make API call to Flask
                    const flaskResponse = await axios.post(`${FLASK_API_URL}/updateMaster`, data, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    console.log(`[${new Date().toISOString()}] [submit] Received Flask response for ${module} Level ${level}:`, flaskResponse.data);

                    // Update mastery with returned score
                    Mastery[module] = flaskResponse.data.score;
                    console.log(`[${new Date().toISOString()}] [submit] Updated mastery for ${module} to: ${Mastery[module]}`);
                }
            }
        }

        // Save updated user document
        console.log(`[${new Date().toISOString()}] [submit] Saving updated mastery scores`);
        await user.save();

        // Create mastery scores object for determine_questions
        const masteryScores = {
            'R1': Mastery.R1,
            'R2': Mastery.R2,
            'R3': Mastery.R3,
            'R4': Mastery.R4,
            'R5': Mastery.R5
        };

        console.log(`[${new Date().toISOString()}] [submit] Sending mastery scores to Flask for question distribution:`, masteryScores);
        
        // Call Flask to determine new question distribution
        const questionDistribution = (await axios.post(`${FLASK_API_URL}/get_questions`, masteryScores)).data;
        console.log(`[${new Date().toISOString()}] [submit] Received question distribution from Flask:`, questionDistribution);

        // Update NoOfQuestions with new distribution
        console.log(`[${new Date().toISOString()}] [submit] Updating NoOfQuestions with new distribution`);
        for (const [module, levels] of Object.entries(questionDistribution)) {
            NoOfQuestions[module] = {
                1: levels['Level 1'],
                2: levels['Level 2'],
                3: levels['Level 3']
            };
            console.log(`[${new Date().toISOString()}] [submit] Updated ${module} question counts:`, NoOfQuestions[module]);
        }

        // Reset accuracy table to zero
        console.log(`[${new Date().toISOString()}] [submit] Resetting accuracy table`);
        for (const module of modules) {
            for (let level = 1; level <= 3; level++) {
                Accuracy[module][level] = 0;
            }
            console.log(`[${new Date().toISOString()}] [submit] Reset accuracy for ${module}`);
        }

        // Save updated user document
        console.log(`[${new Date().toISOString()}] [submit] Saving final user updates`);
        await user.save();

        console.log(`[${new Date().toISOString()}] [submit] Submission process completed successfully for user: ${userId}`);
        res.json({
            success: true,
            message: 'Mastery and question distribution updated successfully, accuracy reset',
            updatedMastery: Mastery,
            updatedQuestionDistribution: NoOfQuestions,
            resetAccuracy: Accuracy
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] [submit] Error in submit endpoint:`, {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Add endpoint to get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json({
            success: true,
            users: users.map(user => ({
                _id: user._id,
                username: user.username,
                email: user.email,
                Accuracy: user.Accuracy,
                NoOfQuestions: user.NoOfQuestions,
                Mastery: user.Mastery
            }))
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Test route is working' });
});

router.get('/submit-handwriting/:userId', async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] [submit-handwriting] Starting submission process for user: ${req.params.userId}`);
        const userId = req.params.userId;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            console.warn(`[${new Date().toISOString()}] [submit-handwriting] Invalid user ID provided: ${userId}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        console.log(`[${new Date().toISOString()}] [submit-handwriting] Looking up user in database`);
        const user = await User.findById(userId);
        if (!user) {
            console.warn(`[${new Date().toISOString()}] [submit-handwriting] User not found for ID: ${userId}`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Access writing related documents
        const { WritingAccuracy, WritingNoOfQuestions, WritingMastery } = user;
        console.log(`[${new Date().toISOString()}] [submit-handwriting] Retrieved user data:`, {
            WritingAccuracy,
            WritingNoOfQuestions,
            WritingMastery
        });

        const age = user.age || 10; // Default age if not set
        console.log(`[${new Date().toISOString()}] [submit-handwriting] Using age: ${age}`);
        const modules = ['W1', 'W2', 'W3'];

        // First, update writing mastery scores
        console.log(`[${new Date().toISOString()}] [submit-handwriting] Starting writing mastery score updates`);
        for (const module of modules) {
            for (let level = 1; level <= 3; level++) {
                const noOfQuestionsCount = WritingNoOfQuestions[module][level];
                if (noOfQuestionsCount > 0) {
                    const accuracyValue = WritingAccuracy[module][level] / noOfQuestionsCount;
                    const previousMastery = WritingMastery[module] || 0;

                    console.log(`[${new Date().toISOString()}] [submit-handwriting] Processing ${module} Level ${level}:`, {
                        noOfQuestions: noOfQuestionsCount,
                        accuracyValue,
                        previousMastery
                    });

                    // Prepare data for Flask
                    const data = {
                        task_type: "writing",
                        new_data: {
                            Age: Array.isArray(age) ? age[0] : age,
                            Topic: Array.isArray(module) ? module[0] : module,
                            Difficulty: Array.isArray(level) ? level[0] : level,
                            Accuracy: Array.isArray(accuracyValue) ? accuracyValue[0] : accuracyValue,
                            "Number of Questions": Array.isArray(noOfQuestionsCount) ? noOfQuestionsCount[0] : noOfQuestionsCount,
                            "Previous Mastery Score": Array.isArray(previousMastery) ? previousMastery[0] : previousMastery
                        }
                    };

                    console.log(`[${new Date().toISOString()}] [submit-handwriting] Sending data to Flask for ${module} Level ${level}:`, data);
                    
                    // Make API call to Flask
                    const flaskResponse = await axios.post(`${FLASK_API_URL}/updateMaster`, data, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    console.log(`[${new Date().toISOString()}] [submit-handwriting] Received Flask response for ${module} Level ${level}:`, flaskResponse.data);

                    // Update writing mastery with returned score
                    WritingMastery[module] = flaskResponse.data.score;
                    console.log(`[${new Date().toISOString()}] [submit-handwriting] Updated writing mastery for ${module} to: ${WritingMastery[module]}`);
                }
            }
        }

        // Save updated user document
        console.log(`[${new Date().toISOString()}] [submit-handwriting] Saving updated writing mastery scores`);
        await user.save();

        // Create writing mastery scores object for determine_questions
        const writingMasteryScores = {
            'W1': WritingMastery.W1,
            'W2': WritingMastery.W2,
            'W3': WritingMastery.W3
        };

        console.log(`[${new Date().toISOString()}] [submit-handwriting] Sending writing mastery scores to Flask for question distribution:`, writingMasteryScores);
        
        // Call Flask to determine new question distribution
        const questionDistribution = (await axios.post(`${FLASK_API_URL}/get_questions`, writingMasteryScores)).data;
        console.log(`[${new Date().toISOString()}] [submit-handwriting] Received question distribution from Flask:`, questionDistribution);

        // Update WritingNoOfQuestions with new distribution
        console.log(`[${new Date().toISOString()}] [submit-handwriting] Updating WritingNoOfQuestions with new distribution`);
        for (const [module, levels] of Object.entries(questionDistribution)) {
            WritingNoOfQuestions[module] = {
                1: levels['Level 1'],
                2: levels['Level 2'],
                3: levels['Level 3']
            };
            console.log(`[${new Date().toISOString()}] [submit-handwriting] Updated ${module} question counts:`, WritingNoOfQuestions[module]);
        }

        // Reset writing accuracy table to zero
        console.log(`[${new Date().toISOString()}] [submit-handwriting] Resetting writing accuracy table`);
        for (const module of modules) {
            for (let level = 1; level <= 3; level++) {
                WritingAccuracy[module][level] = 0;
            }
            console.log(`[${new Date().toISOString()}] [submit-handwriting] Reset writing accuracy for ${module}`);
        }

        // Save updated user document
        console.log(`[${new Date().toISOString()}] [submit-handwriting] Saving final user updates`);
        await user.save();

        console.log(`[${new Date().toISOString()}] [submit-handwriting] Submission process completed successfully for user: ${userId}`);
        res.json({
            success: true,
            message: 'Writing mastery and question distribution updated successfully, writing accuracy reset',
            updatedWritingMastery: WritingMastery,
            updatedWritingQuestionDistribution: WritingNoOfQuestions,
            resetWritingAccuracy: WritingAccuracy
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] [submit-handwriting] Error in submit-handwriting endpoint:`, {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;