# Questions Module Documentation

## Getting Started
To run the server:
```bash
npm install
npm start
```
The server will start on port 10000.

**Note**: For scoring endpoints (reading-score, handwriting-score, compare-handwriting), you'll need to have the Flask  server running. The question endpoints (getReadingQuestions, getWritingQuestions) work without Flask.


To get any User ID, use the auth endpoint and create a new account. You'll get the user ID in the response body.
For testing purpose, you can this this id ,already there in DB `67fc92f3379224eb1af8af0b`

## API Endpoints Overview
### Question Endpoints
1. **Get Reading Questions**
   - **Endpoint**: `GET /api/adaptive/getReadingQuestions/:userId`
   - **Input**: `userId` (URL parameter)
   - **cURL**:
     ```bash
     curl -X GET "http://localhost:10000/api/adaptive/getReadingQuestions/c" \
     -H "Content-Type: application/json"
     ```
   - **Response**:
     ```json
     {
       "success": true,
       "questions": [
         {
           "module": "R1",
           "level": 1,
           "question": "Identify the letter 'A'",
           "options": ["A", "B", "C", "D"],
           "answer": "A"
         }
       ]
     }
     ```

2. **Get Writing Questions**
   - **Endpoint**: `GET /api/adaptive/getWritingQuestions/:userId`
   - **Input**: `userId` (URL parameter)
   - **cURL**:
     ```bash
     curl -X GET "http://localhost:10000/api/adaptive/getWritingQuestions/c" \
     -H "Content-Type: application/json"
     ```
   - **Response**:
     ```json
     {
       "success": true,
       "questions": [
         {
           "module": "W1",
           "level": 1,
           "prompt": "Write the letter 'A'",
           "expected": "A"
         }
       ]
     }
     ```

### Scoring Endpoints
1. **Reading Score**
   - **Endpoint**: `POST /api/adaptive/reading-score/:userId`
   - **Input**:
     - `userId` (URL parameter)
     - `audio` (file)
     - `text` (text)
     - `R` (module identifier)
     - `level` (difficulty level)
   - **cURL**:
     ```bash
     curl -X POST "http://localhost:10000/api/adaptive/reading-score/c" \
     -H "Content-Type: multipart/form-data" \
     -F "audio=@/path/to/recording.mp3" \
     -F "text=The quick brown fox jumps over the lazy dog" \
     -F "R=R1" \
     -F "level=2"
     ```
   - **Response**:
     ```json
     {
       "success": true,
       "similarity_score": 0.85,
       "updatedAccuracy": {
         "R1": {
           "1": 3.75,
           "2": 2.1,
           "3": 0.9
         }
       }
     }
     ```

2. **Handwriting Score**
   - **Endpoint**: `POST /api/adaptive/handwriting-score/:userId`
   - **Input**:
     - `userId` (URL parameter)
     - `image` (file)
     - `text` (text)
     - `W` (module identifier)
     - `level` (difficulty level)
   - **cURL**:
     ```bash
     curl -X POST "http://localhost:10000/api/adaptive/handwriting-score/c" \
     -H "Content-Type: multipart/form-data" \
     -F "image=@/path/to/handwriting.jpg" \
     -F "text=best summer ever" \
     -F "W=W1" \
     -F "level=1"
     ```
   - **Response**:
     ```json
     {
       "success": true,
       "accuracy": 0.78,
       "detected_text": "Best Summer Ever",
       "updatedWritingAccuracy": {
         "W1": {
           "1": 4.2,
           "2": 2.8,
           "3": 1.1
         }
       }
     }
     ```

## Table of Contents
- [Overview](#overview)
- [Reading Questions](#reading-questions)
  - [Structure](#reading-structure)
  - [Question Format](#reading-question-format)
  - [Implementation Details](#reading-implementation-details)
  - [Endpoints](#reading-endpoints)
- [Writing Questions](#writing-questions)
  - [Structure](#writing-structure)
  - [Question Format](#writing-question-format)
  - [Endpoints](#writing-endpoints)
- [Scoring Endpoints](#scoring-endpoints)
  - [Reading Score (Audio Comparison)](#reading-score)
  - [Handwriting Comparison](#handwriting-comparison)
  - [Handwriting Score](#handwriting-score)
- [Usage Examples](#usage-examples)
- [Error Responses](#error-responses)
- [Modification Guidelines](#modification-guidelines)

## Overview
The questions module contains two main types of questions:
1. **Reading Questions**
2. **Writing Questions**

Each type is organized into categories and difficulty levels, with dedicated fetcher functions to retrieve question sets.

## Reading Questions <a name="reading-questions"></a>

### Structure <a name="reading-structure"></a>
- **Location**: `readingquestion` folder
- **Types**: 5 different types of reading questions (R1, R2, R3, R4, R5)
- **Difficulty Levels**:
  - Easy (Level 1)
  - Medium (Level 2)
  - Hard (Level 3)

### Question Format <a name="reading-question-format"></a>
All questions follow a standardized JSON format with the following fields:

| **Field**         | **Description**                                  |
|--------------------|--------------------------------------------------|
| `letter(s)`       | The target letter(s) for identification         |
| `prompt`          | The question text displayed to the user         |
| `correct_answer`  | The expected correct response                   |
| `type`            | The question type (e.g., "letter", "direct-audio") |
| `feedback`        | Contains messages for correct/incorrect responses |
| `level`           | The difficulty level (1, 2, or 3)               |
| `tag`             | The module identifier (e.g., "R1")              |

### Implementation Details <a name="reading-implementation-details"></a>
When implementing the question interface in the app:

1. **Display** the `prompt` to the user
2. **Show** the `letter(s)` for identification
3. **Collect** the user's response (including recorded audio for audio-based questions)
4. **Send** the following data back to the backend:
   - `correct_answer`
   - `type`
   - `level`
   - `tag`
5. **Display** appropriate feedback based on the response:
   - `feedback.correct` for correct answers
   - `feedback.incorrect` for incorrect answers

### Endpoints <a name="reading-endpoints"></a>

#### Get Reading Questions
- **Endpoint**: `GET /api/adaptive/getReadingQuestions/:userId`
- **Description**: Fetches adaptive reading questions for a specific user based on their question distribution in the database
- **Parameters**:
  - `userId` (required): The ID of the user to fetch questions for
  
**Note**: You can use `c` as a valid userId for testing (e.g., `http://localhost:10000/api/adaptive/getReadingQuestions/c`). This userId is confirmed to work, but you can try others as well.
- **Response**:
  - `success`: Boolean indicating if the request was successful
  - `questions`: Array of reading questions

**Example Request**:
```bash
curl -X GET "http://localhost:10000/api/adaptive/getReadingQuestions/c" \
-H "Content-Type: application/json"
```

**Example Response**:
```json
{
  "success": true,
  "questions": [
    {
      "module": "R1",
      "level": 1,
      "question": "Identify the letter 'A'",
      "options": ["A", "B", "C", "D"],
      "answer": "A"
    },
    {
      "module": "R2",
      "level": 2,
      "question": "What is the correct spelling?",
      "options": ["Apple", "Aple", "Appel", "Aplle"],
      "answer": "Apple"
    }
  ]
}
```

## Writing Questions <a name="writing-questions"></a>

### Structure <a name="writing-structure"></a>
- **Types**: Multiple types of writing questions (W1, W2, W3)
- **Difficulty Levels**:
  - Easy (Level 1)
  - Medium (Level 2)
  - Hard (Level 3)

### Question Format <a name="writing-question-format"></a>
Similar structure to Reading Questions with appropriate fields for writing exercises.

### Endpoints <a name="writing-endpoints"></a>

#### Get Writing Questions
- **Endpoint**: `GET /api/adaptive/getWritingQuestions/:userId`
- **Description**: Fetches adaptive writing questions for a specific user based on their writing question distribution
- **Parameters**:
  - `userId` (required): The ID of the user to fetch questions for
  
**Note**: You can use `c` as a valid userId for testing (e.g., `http://localhost:10000/api/adaptive/getWritingQuestions/c`). This userId is confirmed to work, but you can try others as well.
- **Response**:
  - `success`: Boolean indicating if the request was successful
  - `questions`: Array of writing questions

**Example Request**:
```bash
curl -X GET "http://localhost:10000/api/adaptive/getWritingQuestions/c" \
-H "Content-Type: application/json"
```

**Example Response**:
```json
{
  "success": true,
  "questions": [
    {
      "module": "W1",
      "level": 1,
      "prompt": "Write the letter 'A'",
      "expected": "A"
    },
    {
      "module": "W2",
      "level": 2,
      "prompt": "Write the word 'Apple'",
      "expected": "Apple"
    }
  ]
}
```

## Usage Examples <a name="usage-examples"></a>
To get a set of questions:
1. Choose question type (reading/writing)
2. Select difficulty level
3. Specify the number of questions needed
4. Call the appropriate fetcher function through the API endpoints

These endpoints are designed to fetch the appropriate number of questions based on the user's profile and requirements. The server handles the distribution logic internally.

## Scoring Endpoints <a name="scoring-endpoints"></a>

### Reading Score (Audio Comparison) <a name="reading-score"></a>

#### Important Notes
- **Flask Server**: Ensure the Flask scoring server is running locally before hitting this endpoint
- **Flask URL**: The endpoint hits `http://localhost:5000` by default. If changed, update the URL in the backend configuration

#### Endpoint
- **URL**: `POST /api/adaptive/reading-score/:userId`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Description**: This endpoint compares a user's audio recording with the expected text to generate a similarity score. The score is then added to the user's reading accuracy metrics.

#### Request Parameters
- **URL Parameters**:
  - `userId` (required): The ID of the user submitting the audio recording

- **Form Data**:
  - `audio` (required): Audio file of the user's voice recording
  - `text` (required): The text that the user was supposed to read
  - `R` (required): The reading module identifier (e.g., "R1", "R2")
  - `level` (required): The difficulty level (1, 2, or 3)

#### Processing Details
1. The endpoint accepts an audio file upload and converts it to WAV format using FFmpeg
2. The converted file is sent to a Flask API endpoint for audio-text similarity analysis
3. The resulting similarity score is added to the user's accuracy table for the specified module and level
4. Temporary files are cleaned up after processing

#### Response
- **Success Response**:
  ```json
  {
    "success": true,
    "similarity_score": 0.85,
    "updatedAccuracy": {
      "R1": {
        "1": 3.75,
        "2": 2.1,
        "3": 0.9
      },
      "R2": {
        "1": 4.2,
        "2": 1.8,
        "3": 0.5
      }
    }
  }
  ```



#### Example Request Using cURL
```bash
curl -X POST "http://localhost:10000/api/adaptive/reading-score/c" \
  -H "Content-Type: multipart/form-data" \
  -F "audio=@/path/to/recording.mp3" \
  -F "text=The quick brown fox jumps over the lazy dog" \
  -F "R=R1" \
  -F "level=2"
```


#### Implementation Notes for Frontend Developers
- **Audio Recording**: Use the Web Audio API or a library like RecordRTC to capture audio from the user's microphone
- **File Format**: Most common audio formats (MP3, WAV, OGG) are accepted, as the server will convert to WAV format
- **Error Handling**: Implement robust error handling to manage various failure scenarios
- **Progress Indicators**: Show loading indicators during upload and processing, as audio analysis may take several seconds

### Handwriting Comparison <a name="handwriting-comparison"></a>

#### Important Notes
- **Flask Server**: Ensure the Flask scoring server is running locally before hitting this endpoint
- **Flask URL**: The endpoint hits `http://localhost:5000` by default. If changed, update the URL in the backend configuration

#### Endpoint
- **URL**: `POST /api/adaptive/compare-handwriting/:userId`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Description**: This endpoint compares a user's handwritten image with the expected text to generate a similarity score. The score is added to the user's writing accuracy metrics.

#### Request Parameters
- **URL Parameters**:
  - `userId` (required): The ID of the user submitting the handwriting image

- **Form Data**:
  - `image` (required): Image file of the user's handwriting
  - `text` (required): The text that the user was supposed to write
  - `W` (required): The writing module identifier (e.g., "W1", "W2")
  - `level` (required): The difficulty level (1, 2, or 3)

#### Processing Details
1. The endpoint accepts an image file upload
2. The image is sent to a Flask API endpoint for handwriting-text similarity analysis
3. The resulting similarity score is added to the user's writing accuracy table for the specified module and level
4. Temporary files are cleaned up after processing

#### Response
- **Success Response**:
  ```json
  {
    "success": true,
    "similarity_score": 0.78,
    "updatedWritingAccuracy": {
      "W1": {
        "1": 4.2,
        "2": 2.8,
        "3": 1.1
      },
      "W2": {
        "1": 3.9,
        "2": 2.3,
        "3": 0.8
      }
    }
  }
  ```


#### Example Request Using cURL
```bash
curl -X POST "http://localhost:10000/api/adaptive/compare-handwriting/c" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/handwriting.jpg" \
  -F "text=The quick brown fox jumps over the lazy dog" \
  -F "W=W1" \
  -F "level=2"
```

### Handwriting Score <a name="handwriting-score"></a>

#### Endpoint
- **URL**: `POST /api/adaptive/handwriting-score/:userId`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Description**: This endpoint compares a user's handwritten image with the expected text to generate a similarity score. The score is added to the user's writing accuracy metrics.

#### Request Parameters
- **URL Parameters**:
  - `userId` (required): The ID of the user submitting the handwriting image

- **Form Data**:
  - `image` (required): Image file of the user's handwriting
  - `text` (required): The text that the user was supposed to write
  - `W` (required): The writing module identifier (e.g., "W1", "W2")
  - `level` (required): The difficulty level (1, 2, or 3)

#### Processing Details
1. The endpoint accepts an image file upload
2. The image is converted to base64 and sent to a Flask API endpoint for handwriting-text similarity analysis
3. The resulting accuracy score is added to the user's writing accuracy table for the specified module and level
4. Temporary files are cleaned up after processing

#### Response
- **Success Response**:
  ```json
  {
    "success": true,
    "accuracy": 0.78,
    "detected_text": "Best Summer Ever",
    "updatedWritingAccuracy": {
      "W1": {
        "1": 4.2,
        "2": 2.8,
        "3": 1.1
      },
      "W2": {
        "1": 3.9,
        "2": 2.3,
        "3": 0.8
      }
    }
  }
  ```

#### Example Request Using cURL
```bash
curl -X POST "http://localhost:10000/api/adaptive/handwriting-score/67fc92f3379224eb1af8af0b" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/handwriting.jpg" \
  -F "text=best summer ever" \
  -F "W=W1" \
  -F "level=1"
```

#### Implementation Notes
- **Image Formats**: Accepts common image formats (JPEG, PNG)
- **Base64 Conversion**: The image is converted to base64 for reliable transfer
- **Error Handling**: Includes detailed error logging and cleanup of temporary files
- **Timeout**: 30-second timeout for Flask

All you have to do is: once the user records their answer for a question, send it to the backend with the parameters W1, level, audio, and expected text. The backend will return a score. If the score is < 0.5, return "Try again", else return "Success" messages.

## Modification Guidelines <a name="modification-guidelines"></a>
When modifying question format:
- Consider UI requirements
- Maintain consistency across question types
- Ensure modifications don't break existing functionality
