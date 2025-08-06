# Word Search Game

This project is a word search game where players have to find words in a grid. The game offers three difficulty levels: easy, medium, and hard, each with a different grid size and word list.

## Features

- Three difficulty levels: easy, medium, and hard
- Randomly generated word grid
- Highlighting and selecting words
- Scoring system
- Timer that counts down from 60 seconds
- Reset button to start a new game

## How to Play

1. **Select Difficulty:** Choose a difficulty level (easy, medium, or hard) from the dropdown menu. This will determine the grid size and the set of words.
2. **Find Words:** Click and drag to select words in the grid. Words can be horizontal, vertical, or diagonal.
3. **Score Points:** Each correctly found word gives you 10 points.
4. **Timer:** You have 60 seconds to find as many words as possible. The game ends when the timer reaches zero.
5. **Reset Game:** Click the "Reset" button to start a new game with the same difficulty.

## File Structure

- `index.html`: The HTML file that contains the structure of the game interface.
- `styles.css`: The CSS file for styling the game.
- `script.js`: The JavaScript file that contains the game logic.

## JavaScript Functions

### `setDifficulty(difficulty)`

Sets the difficulty level and initializes the game with the corresponding grid size and word list.

### `resetGame()`

Resets the game, clears previous scores, and starts a new timer.

### `generateGrid()`

Generates the word grid and fills empty spaces with random letters.

### `placeWord(word)`

Places a word in the grid either horizontally or vertically.

### `canPlaceWord(row, col, word, direction)`

Checks if a word can be placed at the specified position and direction.

### `fillEmptySpaces()`

Fills empty spaces in the grid with random letters.

### `renderGrid()`

Renders the grid in the HTML table.

### `selectCell(row, col)`

Handles cell selection and highlighting for word finding.

### `checkForWord()`

Checks if the selected cells form a valid word and updates the score.

### `highlightFoundWord(word)`

Highlights the cells of a found word.

### `updateRemainingWords()`

Updates the list of remaining words to be found.

### `startTimer()`

Starts the countdown timer and updates the display.

## Additional Information

- The grid size varies with difficulty: easy (5x5), medium (10x10), hard (15x15).
- The word lists are predefined for each difficulty level.
- The timer is reset to 60 seconds for each new game.
- The game ends when all words are found or the timer reaches zero.

Enjoy playing the Word Search Game!
