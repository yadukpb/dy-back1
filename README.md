# Questions Module Documentation


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
- **Endpoint**: `GET /getReadingQuestions/:userId`
- **Description**: Fetches adaptive reading questions for a specific user based on their question distribution in the database
- **Parameters**:
  - `userId` (required): The ID of the user to fetch questions for
- **Response**:
  - `success`: Boolean indicating if the request was successful
  - `questions`: Array of reading questions

**Example Request**:
```bash
curl -X GET "http://localhost:3000/getReadingQuestions/64f1a2b3c4d5e6f7a8b9c0d1" \
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
- **Endpoint**: `GET /getWritingQuestions/:userId`
- **Description**: Fetches adaptive writing questions for a specific user based on their writing question distribution
- **Parameters**:
  - `userId` (required): The ID of the user to fetch questions for
- **Response**:
  - `success`: Boolean indicating if the request was successful
  - `questions`: Array of writing questions

**Example Request**:
```bash
curl -X GET "http://localhost:3000/getWritingQuestions/64f1a2b3c4d5e6f7a8b9c0d1" \
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
4. Call the appropriate fetcher function

## Error Responses <a name="error-responses"></a>
Both endpoints return the same error structure:

**Invalid User ID**:
```json
{
  "success": false,
  "message": "Invalid user ID"
}
```

**User Not Found**:
```json
{
  "success": false,
  "message": "User not found"
}
```

## Modification Guidelines 
When modifying question format:
- Consider UI requirementsV
- Maintain consistency across question types
- Ensure modifications don't break existing functionality
