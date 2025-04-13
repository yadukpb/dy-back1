# API Documentation for Adaptive Learning System

## Table of Contents
1. [Introduction](#introduction)
2. [API Endpoints](#api-endpoints)
3. [Core Functionality](#core-functionality)
4. [Testing with Postman](#testing-with-postman)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

## Introduction

This documentation covers an Express.js API for an adaptive learning system. The API handles question generation, audio comparison, and user mastery tracking across multiple reading modules (R1-R5) with varying difficulty levels (1-3). The system integrates with a Flask backend for audio processing and mastery calculations.

### System Architecture Overview

The system consists of:
- **Express.js Backend**: Manages API requests, user data, and interfaces with the Flask API
- **MongoDB Database**: Stores user profiles, question counts, accuracy metrics, and mastery levels
- **Flask API**: Processes audio comparisons and calculates mastery scores based on ML models

## API Endpoints

### 1. Get Adaptive Questions
```
GET /adaptive/:userId
```

Retrieves personalized questions based on a user's profile and previous performance metrics.

**Parameters:**
- `userId` (path parameter): MongoDB ObjectId of the user

**Response:**
```json
{
  "success": true,
  "questions": [
    // Array of question objects from various modules and difficulty levels
  ]
}
```

### 2. Compare Audio
```
POST /compare-audio
```

Compares user-recorded audio against expected text to calculate pronunciation accuracy.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `audio`: Audio file (WAV, MP3, etc.)
  - `text`: Text string that the audio should match
  - `R`: Module identifier (R1, R2, etc.)
  - `level`: Difficulty level (1, 2, or 3)

**Response:**
```json
{
  "success": true,
  "score": 0.85,
  "updatedAccuracy": {
    "R1": { "1": 0.8, "2": 0.75, "3": 0.6 },
    // Other module data
  }
}
```

### 3. Submit for Mastery Calculation
```
GET /submit
```

Calculates and updates user mastery levels based on accuracy and question performance.

**Response:**
```json
{
  "success": true,
  "message": "Mastery updated successfully",
  "updatedMastery": {
    "R1": { "1": 0.85, "2": 0.72, "3": 0.63 },
    // Other module data
  }
}
```

## Core Functionality

### Adaptive Question Generation

The system generates personalized questions using a shared `getAdaptiveQuestions()` function that:

1. Retrieves the user's question distribution from the `NoOfQuestions` table
2. For each module (R1-R5) and level (1-3), fetches the appropriate number of questions
3. Uses module-specific question fetchers (e.g., `R1QuestionFetcher`, `R2FetchQuestions`)
4. Processes all question fetching operations in parallel using `Promise.all()`
5. Returns a consolidated array of questions across all modules and levels

### Audio Comparison Process

The audio comparison endpoint:

1. Accepts an audio file upload and reference text
2. Converts the audio to WAV format using FFmpeg
3. Encodes the audio as base64
4. Sends the encoded audio and text to the Flask API
5. Receives a similarity score
6. Updates the user's accuracy record for the specified module and level
7. Returns the score and updated accuracy

### Mastery Calculation

The mastery calculation endpoint:

1. Retrieves the user's accuracy, question count, and previous mastery data
2. For each module and level combination:
   - Calculates the accuracy percentage
   - Sends user data to the Flask API's `/updateMaster` endpoint
   - Receives an updated mastery score
3. Updates the user's mastery record in the database
4. Returns the updated mastery data

## Testing with Postman

### Setting Up Postman Tests

1. **Install Postman**: Download from [postman.com](https://www.postman.com/downloads/)
2. **Create a Collection**: Name it "Adaptive Learning API"
3. **Configure Environment Variables**:
   - `baseUrl`: Set to your server URL (e.g., `http://localhost:3000`)
   - `userId`: A valid user ID from your MongoDB

### Testing the Endpoints

#### 1. Get Adaptive Questions

1. Create a GET request: `{{baseUrl}}/adaptive/{{userId}}`
2. Add a test script to verify the response:
   ```javascript
   pm.test("Status code is 200", function() {
       pm.response.to.have.status(200);
   });
   
   pm.test("Questions array exists", function() {
       const response = pm.response.json();
       pm.expect(response.success).to.be.true;
       pm.expect(response.questions).to.be.an('array');
   });
   ```
3. Send the request and verify the response

#### 2. Compare Audio

1. Create a POST request: `{{baseUrl}}/compare-audio`
2. Set the request type to `form-data`
3. Add the following fields:
   - `text`: "This is a sample text for testing"
   - `audio`: Select a test audio file
   - `R`: "R1"
   - `level`: "1"
4. Add Authorization if required (e.g., Bearer token)
5. Send the request and verify the response

#### 3. Submit for Mastery Calculation

1. Create a GET request: `{{baseUrl}}/submit`
2. Add Authorization if required
3. Send the request and verify the response

### Automated Test Collection

Create a Postman collection that runs all tests in sequence:

1. Get adaptive questions
2. Compare audio (with a sample audio file)
3. Submit for mastery calculation

Use Postman's Collection Runner to execute all tests at once.

## Data Models

The system uses the following MongoDB models:

### User
```javascript
{
  _id: ObjectId,
  name: String,
  age: Number,
  NoOfQuestions: { type: ObjectId, ref: 'Table' },
  Accuracy: { type: ObjectId, ref: 'Table' },
  Mastery: { type: ObjectId, ref: 'Table' }
}
```

### Table
```javascript
{
  R1: { 1: Number, 2: Number, 3: Number },
  R2: { 1: Number, 2: Number, 3: Number },
  R3: { 1: Number, 2: Number, 3: Number },
  R4: { 1: Number, 2: Number, 3: Number },
  R5: { 1: Number, 2: Number, 3: Number }
}
```

## Error Handling

The API implements a consistent error handling approach:

1. Validates input parameters and returns 400 for invalid requests
2. Uses try-catch blocks to capture and report errors
3. Returns appropriate HTTP status codes (400, 404, 500)
4. Includes detailed error messages in development mode
5. Cleans up temporary files in case of errors

Example error response:
```json
{
  "success": false,
  "message": "Error message details",
  "stack": "Error stack trace (only in development mode)"
}
```

## Best Practices

### API Implementation

1. **Modularization**: The code separates concerns into distinct modules
2. **Parallel Processing**: Uses Promise.all for efficient parallel operations
3. **Error Handling**: Implements comprehensive error handling
4. **Security**: Validates input parameters and user authentication

### Development and Testing

1. **Use environment variables** for configuration (Flask API URL, etc.)
2. **Test with various audio formats** for the audio comparison endpoint
3. **Monitor memory usage** when processing large audio files
4. **Verify MongoDB connections** before deploying to production
5. **Test with realistic user data** in the NoOfQuestions, Accuracy, and Mastery tables

### Deployment Considerations

1. **Ensure FFmpeg is installed** on the production server
2. **Configure proper storage** for uploaded audio files
3. **Set up proper CORS configuration** if the API is accessed from different domains
4. **Consider rate limiting** to prevent abuse
5. **Implement proper authentication** to secure user data

This API provides a solid foundation for an adaptive learning system with audio comparison capabilities. The modular design allows for easy extension and maintenance.V