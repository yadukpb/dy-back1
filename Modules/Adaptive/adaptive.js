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

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}


const FLASK_API_URL = process.env.NODE_ENV === 'production' 
    ? process.env.FLASK_PROD_URL 
    : process.env.FLASK_DEV_URL;

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
    const user = await User.findById(userId);
    if (!user) {
        const errorMsg = `[${new Date().toISOString()}] [getAdaptiveQuestions] Error: User not found for user: ${userId}`;
        throw new Error(errorMsg);
    }

    // Convert NoOfQuestions to plain object and extract the integer values
    const noOfQuestions = {};
    for (const module in user.NoOfQuestions) {
        noOfQuestions[module] = {};
        for (const level in user.NoOfQuestions[module]) {
            const value = user.NoOfQuestions[module][level];
            noOfQuestions[module][level] = typeof value === 'object' && value.$numberInt 
                ? parseInt(value.$numberInt) 
                : value;
        }
    }

    const allQuestions = [];
    
    const fetchQuestions = async (module, level, count, fetcher, data) => {
        if (count > 0) {
            if (!fetcher || typeof fetcher !== 'function') {
                const errorMsg = `[${new Date().toISOString()}] [getAdaptiveQuestions] Invalid fetcher for ${module} Level ${level}: ${typeof fetcher}`;
                throw new Error(errorMsg);
            }
            const questions = await fetcher(data, level, count);
            allQuestions.push(...questions);
        }
    };

    await Promise.all([
        fetchQuestions('R1', 1, noOfQuestions.R1[1], R1QuestionFetcher, r1),
        fetchQuestions('R1', 2, noOfQuestions.R1[2], R1QuestionFetcher, r1),
        fetchQuestions('R1', 3, noOfQuestions.R1[3], R1QuestionFetcher, r1),
        fetchQuestions('R2', 1, noOfQuestions.R2[1], R2FetchQuestions, R2),
        fetchQuestions('R2', 2, noOfQuestions.R2[2], R2FetchQuestions, R2),
        fetchQuestions('R2', 3, noOfQuestions.R2[3], R2FetchQuestions, R2),
        fetchQuestions('R3', 1, noOfQuestions.R3[1], R3QuestionFetcher, R3),
        fetchQuestions('R3', 2, noOfQuestions.R3[2], R3QuestionFetcher, R3),
        fetchQuestions('R3', 3, noOfQuestions.R3[3], R3QuestionFetcher, R3),
        fetchQuestions('R4', 1, noOfQuestions.R4[1], R4FetchQuestions, R4),
        fetchQuestions('R4', 2, noOfQuestions.R4[2], R4FetchQuestions, R4),
        fetchQuestions('R4', 3, noOfQuestions.R4[3], R4FetchQuestions, R4),
        fetchQuestions('R5', 1, noOfQuestions.R5[1], R5FetchQuestions, R5),
        fetchQuestions('R5', 2, noOfQuestions.R5[2], R5FetchQuestions, R5),
        fetchQuestions('R5', 3, noOfQuestions.R5[3], R5FetchQuestions, R5)
    ]);

    return allQuestions;
}

async function Adaptive(userId) {
    try {
        return await getAdaptiveQuestions(userId);
    } catch (error) {
        throw error;
    }
}

// Question endpoints
router.get('/getReadingQuestions/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const questions = await getAdaptiveQuestions(userId);

        res.json({
            success: true,
            questions
        });
    } catch (error) {
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

        const noOfQuestions = {};
        for (const module in user.WritingNoOfQuestions) {
            noOfQuestions[module] = {};
            for (const level in user.WritingNoOfQuestions[module]) {
                const value = user.WritingNoOfQuestions[module][level];
                noOfQuestions[module][level] = typeof value === 'object' && value.$numberInt 
                    ? parseInt(value.$numberInt) 
                    : value;
            }
        }

        const allQuestions = [];
        
        const fetchQuestions = async (module, level, count, fetcher, data) => {
            if (count > 0) {
                if (!fetcher || typeof fetcher !== 'function') {
                    const errorMsg = `[${new Date().toISOString()}] [getWQuestions] Invalid fetcher for ${module} Level ${level}: ${typeof fetcher}`;
                    throw new Error(errorMsg);
                }
                const questions = await fetcher(data, level, count);
                allQuestions.push(...questions);
            }
        };

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

        res.json({
            success: true,
            questions: allQuestions
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


//=========================================================================================================================//

// Audio comparison endpoint
router.post('/reading-score/:userId', upload.single('audio'), async (req, res) => {
    try {
        const { text } = req.body;
        const audioFile = req.file;
        const userId = req.params.userId;

        if (!text || !audioFile || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Text, audio file, and user ID are required'
            });
        }

        // Convert the uploaded file to WAV format
        const wavFilePath = path.join(uploadsDir, `converted_${Date.now()}.wav`);
        
        exec(`ffmpeg -i "${audioFile.path}" "${wavFilePath}"`, async (error, stdout, stderr) => {
            if (error) {
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
                // Verify the file exists before proceeding
                if (!fs.existsSync(wavFilePath)) {
                    throw new Error(`WAV file not created at path: ${wavFilePath}`);
                }
                
                // Use FormData from a proper package for Node.js
                const FormData = require('form-data');
                const formData = new FormData();
                formData.append('text', text);
                formData.append('audio', fs.createReadStream(wavFilePath));

                // Make request to Flask server using the form-data's headers
                const flaskResponse = await axios.post(`${FLASK_API_URL}/audio-comparison`, formData, {
                    headers: formData.getHeaders(),
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                });

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
                
                // Update the accuracy table
                user.Accuracy[R][level] = currentValue + score;
                
                await user.save();

                // Return the similarity score from Flask along with updated accuracy
                res.json({
                    success: true,
                    similarity_score: score,
                    updatedAccuracy: user.Accuracy
                });
            } catch (error) {
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
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


router.post('/handwriting-score/:userId', upload.single('image'), async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] [handwriting-score] Starting handwriting score evaluation`);
        
        // Step 1: Validate input parameters
        console.log(`[${new Date().toISOString()}] [handwriting-score] Validating input parameters`);
        console.log(`[${new Date().toISOString()}] [handwriting-score] Received request body: ${JSON.stringify(req.body)}`);
        console.log(`[${new Date().toISOString()}] [handwriting-score] Received file: ${req.file ? req.file.path : 'No file received'}`);
        
        const { text } = req.body;
        const imageFile = req.file;
        const userId = req.params.userId;

        if (!text || !imageFile || !userId) {
            console.error(`[${new Date().toISOString()}] [handwriting-score] Missing required parameters - text: ${text}, imageFile: ${imageFile}, userId: ${userId}`);
            return res.status(400).json({
                success: false,
                message: 'Text, image file, and user ID are required'
            });
        }

        // Step 2: Prepare for direct file upload to Flask API
        console.log(`[${new Date().toISOString()}] [handwriting-score] Preparing data for Flask API`);
        console.log(`[${new Date().toISOString()}] [handwriting-score] Text to be sent: ${text}`);
        console.log(`[${new Date().toISOString()}] [handwriting-score] Image path: ${imageFile.path}`);
        
        // Read the file into a buffer
        const imageBuffer = fs.readFileSync(imageFile.path);
        
        // Convert buffer to base64 for more reliable transfer
        const base64Image = imageBuffer.toString('base64');
        
        // Send JSON data instead of FormData
        const requestData = {
            expected_text: text,
            option: 1,
            image_base64: base64Image,
            image_filename: imageFile.originalname || 'image.jpg',
            image_type: imageFile.mimetype || 'image/jpeg'
        };
        
        console.log(`[${new Date().toISOString()}] [handwriting-score] Sending JSON request to Flask API`);
        console.log(`[${new Date().toISOString()}] [handwriting-score] Request contains text and base64 image data of ${base64Image.length} characters`);

        const flaskResponse = await axios.post(`${FLASK_API_URL}/handwriting-comparison-json`, requestData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
        });

        // Step 4: Process Flask response
        console.log(`[${new Date().toISOString()}] [handwriting-score] Processing Flask response`);
        console.log(`[${new Date().toISOString()}] [handwriting-score] Flask response status: ${flaskResponse.status}`);
        console.log(`[${new Date().toISOString()}] [handwriting-score] Flask response data: ${JSON.stringify(flaskResponse.data)}`);
        
        const score = parseFloat(flaskResponse.data.accuracy);
        console.log(`[${new Date().toISOString()}] [handwriting-score] Received accuracy score: ${score}`);

        // Step 5: Fetch user data
        console.log(`[${new Date().toISOString()}] [handwriting-score] Fetching user data for userId: ${userId}`);
        const user = await User.findById(userId);
        if (!user) {
            console.error(`[${new Date().toISOString()}] [handwriting-score] User not found: ${userId}`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Step 6: Validate W and level parameters
        console.log(`[${new Date().toISOString()}] [handwriting-score] Validating W and level parameters`);
        const { W, level } = req.body;
        console.log(`[${new Date().toISOString()}] [handwriting-score] Received W: ${W}, level: ${level}`);
        
        if (!W || !level) {
            console.error(`[${new Date().toISOString()}] [handwriting-score] Missing W or level - W: ${W}, level: ${level}`);
            return res.status(400).json({
                success: false,
                message: 'Both W and level are required'
            });
        }

        // Step 7: Update writing accuracy
        console.log(`[${new Date().toISOString()}] [handwriting-score] Updating writing accuracy for ${W} level ${level}`);
        const currentValue = user.WritingAccuracy[W][level] || 0;
        console.log(`[${new Date().toISOString()}] [handwriting-score] Current accuracy for ${W} level ${level}: ${currentValue}`);
        
        user.WritingAccuracy[W][level] = currentValue + score;
        console.log(`[${new Date().toISOString()}] [handwriting-score] Updated accuracy for ${W} level ${level}: ${user.WritingAccuracy[W][level]}`);
        
        // Step 8: Save user data
        console.log(`[${new Date().toISOString()}] [handwriting-score] Saving updated user data`);
        await user.save();
        console.log(`[${new Date().toISOString()}] [handwriting-score] User data saved successfully`);

        // Step 9: Return response
        console.log(`[${new Date().toISOString()}] [handwriting-score] Returning success response`);
        res.json({
            success: true,
            accuracy: score,
            detected_text: flaskResponse.data.detected_text,
            updatedWritingAccuracy: user.WritingAccuracy
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] [handwriting-score] Error: ${error.message}`, error.stack);
        if (error.response) {
            console.error(`[${new Date().toISOString()}] [handwriting-score] Error response data: ${JSON.stringify(error.response.data)}`);
            console.error(`[${new Date().toISOString()}] [handwriting-score] Error response status: ${error.response.status}`);
            console.error(`[${new Date().toISOString()}] [handwriting-score] Error response headers: ${JSON.stringify(error.response.headers)}`);
        }
        
        // Clean up the temporary file
        try {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
                console.log(`[${new Date().toISOString()}] [handwriting-score] Temporary file cleaned up: ${req.file.path}`);
            }
        } catch (err) {
            console.error(`[${new Date().toISOString()}] [handwriting-score] Error cleaning up image file:`, err);
        }
        
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
});
// Update the submit endpoint to reset accuracy after final step
router.get('/submit-reading/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
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

        // Access embedded documents directly from user
        const { Accuracy, NoOfQuestions, mastery: Mastery } = user;

        const age = user.age || 10; // Default age if not set
        const modules = ['R1', 'R2', 'R3', 'R4', 'R5'];

        // First, update mastery scores
        for (const module of modules) {
            for (let level = 1; level <= 3; level++) {
                const noOfQuestionsCount = NoOfQuestions[module][level];
                if (noOfQuestionsCount > 0) {
                    const accuracyValue = Accuracy[module][level] / noOfQuestionsCount;
                    const previousMastery = Mastery[module] || 0;

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

                    // Make API call to Flask
                    const flaskResponse = await axios.post(`${FLASK_API_URL}/updateMaster`, data, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    // Update mastery with returned score
                    Mastery[module] = flaskResponse.data.score;
                }
            }
        }

        // Save updated user document
        await user.save();

        // Create mastery scores object for determine_questions
        const masteryScores = {
            'R1': Mastery.R1,
            'R2': Mastery.R2,
            'R3': Mastery.R3,
            'R4': Mastery.R4,
            'R5': Mastery.R5
        };

        // Call Flask to determine new question distribution
        const questionDistribution = (await axios.post(`${FLASK_API_URL}/get_questions`, masteryScores)).data;

        // Update NoOfQuestions with new distribution
        for (const [module, levels] of Object.entries(questionDistribution)) {
            NoOfQuestions[module] = {
                1: levels['Level 1'],
                2: levels['Level 2'],
                3: levels['Level 3']
            };
        }

        // Reset accuracy table to zero
        for (const module of modules) {
            for (let level = 1; level <= 3; level++) {
                Accuracy[module][level] = 0;
            }
        }

        // Save updated user document
        await user.save();

        res.json({
            success: true,
            message: 'Mastery and question distribution updated successfully, accuracy reset',
            updatedMastery: Mastery,
            updatedQuestionDistribution: NoOfQuestions,
            resetAccuracy: Accuracy
        });

    } catch (error) {
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
        const userId = req.params.userId;
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

        // Access writing related documents
        const { WritingAccuracy, WritingNoOfQuestions, WritingMastery } = user;

        const age = user.age || 10; // Default age if not set
        const modules = ['W1', 'W2', 'W3'];

        // First, update writing mastery scores
        for (const module of modules) {
            for (let level = 1; level <= 3; level++) {
                const noOfQuestionsCount = WritingNoOfQuestions[module][level];
                if (noOfQuestionsCount > 0) {
                    const accuracyValue = WritingAccuracy[module][level] / noOfQuestionsCount;
                    const previousMastery = WritingMastery[module] || 0;

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

                    // Make API call to Flask
                    const flaskResponse = await axios.post(`${FLASK_API_URL}/updateMaster`, data, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    // Update writing mastery with returned score
                    WritingMastery[module] = flaskResponse.data.score;
                }
            }
        }

        // Save updated user document
        await user.save();

        // Create writing mastery scores object for determine_questions
        const writingMasteryScores = {
            'W1': WritingMastery.W1,
            'W2': WritingMastery.W2,
            'W3': WritingMastery.W3
        };

        // Call Flask to determine new question distribution
        const questionDistribution = (await axios.post(`${FLASK_API_URL}/get_questions`, writingMasteryScores)).data;

        // Update WritingNoOfQuestions with new distribution
        for (const [module, levels] of Object.entries(questionDistribution)) {
            WritingNoOfQuestions[module] = {
                1: levels['Level 1'],
                2: levels['Level 2'],
                3: levels['Level 3']
            };
        }

        // Reset writing accuracy table to zero
        for (const module of modules) {
            for (let level = 1; level <= 3; level++) {
                WritingAccuracy[module][level] = 0;
            }
        }

        // Save updated user document
        await user.save();

        res.json({
            success: true,
            message: 'Writing mastery and question distribution updated successfully, writing accuracy reset',
            updatedWritingMastery: WritingMastery,
            updatedWritingQuestionDistribution: WritingNoOfQuestions,
            resetWritingAccuracy: WritingAccuracy
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;