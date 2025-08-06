const wordLists = { easy: [ ["CAT", "DOG", "FISH", "BIRD", "COW"], ["ANT", "BEE", "BAT", "BUG", "OWL"], ["RAT", "PIG", "HEN", "MULE", "DUCK"], ["GOAT", "RAM", "EGG", "EEL", "FOX"] ], medium: [ ["JAVASCRIPT", "HTML", "CSS", "NODE", "REACT"], ["ANGULAR", "PYTHON", "JAVA", "RUBY", "SWIFT"], ["SCRIPT", "CLOUD", "ARRAY", "OBJECT", "STRING"], ["NUMBER", "BOOLEAN", "PROMISE", "FUNCTION", "VARIABLE"] ], hard: [ ["COMPILER", "ALGORITHM", "FRAMEWORK", "DATABASE", "REPOSITORY"], ["INTEGRATION", "KUBERNETES", "MICROSERVICE", "CONCURRENCY", "MULTITHREAD"], ["RECURSION", "INTERPRETER", "OBJECTORIENTED", "SYNCHRONIZATION", "PROTOCOL"], ["INTERFACE", "EXECUTION", "DEVELOPER", "ASYNC", "SYNCHRONIZATION"] ] };

let words = [];
let gridSize = 10;
let grid = [];
let foundWords = [];
let score = 0;
let timer;
let timeLeft = 60; // 60 seconds timer
let isSelecting = false; // Track if the user is selecting cells
let selectedCells = []; // Store selected cells
let selectionDirection = null; // Track the direction of selection

document.getElementById('difficultySelect').addEventListener('change', (event) => {
    setDifficulty(event.target.value);
});

function setDifficulty(difficulty) { gridSize = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15; const wordSets = wordLists[difficulty]; words = wordSets[Math.floor(Math.random() * wordSets.length)]; resetGame(); }

function resetGame() {
    foundWords = [];
    score = 0;
    timeLeft = 60; // Reset timer
    clearInterval(timer); // Clear any existing timer before resetting the game
    document.getElementById('scoreValue').innerText = score;
    document.getElementById('result').innerText = '';
    generateGrid();
    updateRemainingWords(); // Ensure remaining words are updated
}


function generateGrid() {
    grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
    words.forEach(placeWord);
    fillEmptySpaces();
    renderGrid();
    startTimer();
}

function placeWord(word) {
    let placed = false;
    while (!placed) {
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);
        const direction = Math.floor(Math.random() * 2); // 0: horizontal, 1: vertical

        if (canPlaceWord(row, col, word, direction)) {
            for (let i = 0; i < word.length; i++) {
                grid[row + (direction === 1 ? i : 0)][col + (direction === 0 ? i : 0)] = word[i];
            }
            placed = true;
        }
    }
}

function canPlaceWord(row, col, word, direction) {
    for (let i = 0; i < word.length; i++) {
        const r = row + (direction === 1 ? i : 0);
        const c = col + (direction === 0 ? i : 0);
        if (r >= gridSize || c >= gridSize || (grid[r][c] !== '' && grid[r][c] !== word[i])) {
            return false;
        }
    }
    return true;
}

function fillEmptySpaces() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] === '') {
                grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random letter A-Z
            }
        }
    }
}

function renderGrid() {
    const table = document.getElementById('wordSearchTable');
    table.innerHTML = ''; // Clear previous grid
    grid.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        row.forEach((cell, colIndex) => {
            const td = document.createElement('td');
            td.innerText = cell;
            td.addEventListener('mousedown', () => selectCell(rowIndex, colIndex));
            td.addEventListener('mouseover', () => {
                if (isSelecting) {
                    selectCell(rowIndex, colIndex);
                }
            });
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
}

document.getElementById('resetButton').addEventListener('click', resetGame);

document.addEventListener('mouseup', () => {
    isSelecting = false;
    checkForWord();
    selectedCells = []; // Clear selected cells after checking
    selectionDirection = null; // Reset direction
});

function selectCell(row, col) {
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        const cellId = `${row},${col}`;
        const td = document.querySelector(`tr:nth-child(${row + 1}) td:nth-child(${col + 1})`);
        if (!selectedCells.includes(cellId)) {
            selectedCells.push(cellId);
            td.classList.add('selected'); // Highlight selected cell
            if (selectedCells.length === 1) {
                selectionDirection = { row, col };
            } else {
                const [firstRow, firstCol] = selectedCells[0].split(',').map(Number);
                if (row === firstRow) {
                    for (let c = Math.min(firstCol, col); c <= Math.max(firstCol, col); c++) {
                        const cellId = `${firstRow},${c}`;
                        if (!selectedCells.includes(cellId)) {
                            selectedCells.push(cellId);
                            const td = document.querySelector(`tr:nth-child(${firstRow + 1}) td:nth-child(${c + 1})`);
                            td.classList.add('selected');
                        }
                    }
                } else if (col === firstCol) {
                    for (let r = Math.min(firstRow, row); r <= Math.max(firstRow, row); r++) {
                        const cellId = `${r},${firstCol}`;
                        if (!selectedCells.includes(cellId)) {
                            selectedCells.push(cellId);
                            const td = document.querySelector(`tr:nth-child(${r + 1}) td:nth-child(${firstCol + 1})`);
                            td.classList.add('selected');
                        }
                    }
                } else if (Math.abs(row - firstRow) === Math.abs(col - firstCol)) {
                    const rowStep = row > firstRow ? 1 : -1;
                    const colStep = col > firstCol ? 1 : -1;
                    let r = firstRow;
                    let c = firstCol;
                    while (r !== row + rowStep && c !== col + colStep) {
                        const cellId = `${r},${c}`;
                        if (!selectedCells.includes(cellId)) {
                            selectedCells.push(cellId);
                            const td = document.querySelector(`tr:nth-child(${r + 1}) td:nth-child(${c + 1})`);
                            td.classList.add('selected');
                        }
                        r += rowStep;
                        c += colStep;
                    }
                }
            }
        }
        isSelecting = true; // Enable dragging
    }
}

function checkForWord() {
    const selectedWord = selectedCells.map(cell => {
        const [row, col] = cell.split(',').map(Number);
        return grid[row][col];
    }).join('');

    if (words.includes(selectedWord) && !foundWords.includes(selectedWord)) {
        foundWords.push(selectedWord);
        score += 10; // Increment score for each found word
        document.getElementById('scoreValue').innerText = score;
        document.getElementById('result').innerText = `You found: ${selectedWord}`;
        highlightFoundWord(selectedWord);
        updateRemainingWords();
        if (foundWords.length === words.length) {
            document.getElementById('result').innerText = "Congratulations! You've found all the words!";
            clearInterval(timer); // Stop the timer
        }
    } else {
        // Remove highlight if the word is not found
        selectedCells.forEach(cell => {
            const [row, col] = cell.split(',').map(Number);
            const td = document.querySelector(`tr:nth-child(${row + 1}) td:nth-child(${col + 1})`);
            td.classList.remove('selected');
        });
    }
}

function highlightFoundWord(word) {
    selectedCells.forEach(cell => {
        const [row, col] = cell.split(',').map(Number);
        const td = document.querySelector(`tr:nth-child(${row + 1}) td:nth-child(${col + 1})`);
        td.classList.add('found'); // Highlight only the selected cells that form the word
    });
}

function updateRemainingWords() {
    const remainingWordsElement = document.getElementById('remainingWords');
    const remainingWords = words.filter(word => !foundWords.includes(word));
    remainingWordsElement.innerHTML = '<h2>Remaining Words:</h2>' + remainingWords.map(word => `<div>${word}</div>`).join('');
}

function startTimer() {
    clearInterval(timer); // Clear any existing timer before starting a new one
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            document.getElementById('timeLeft').innerText = timeLeft;
        } else {
            clearInterval(timer); // Stop the timer once it reaches zero
            document.getElementById('result').innerText = "Time's up! Game over!";
        }
    }, 1000);
}


// Start the game with default difficulty
setDifficulty('easy');
