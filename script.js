// Enhanced Word Lists with themed categories
const wordLists = {
    easy: [
        ["CAT", "DOG", "FISH", "BIRD", "COW", "PIG", "HEN"],
        ["SUN", "MOON", "STAR", "SKY", "TREE", "LEAF", "ROCK"],
        ["RED", "BLUE", "GREEN", "PINK", "GOLD", "GRAY", "BROWN"],
        ["BOOK", "PEN", "DESK", "CHAIR", "LAMP", "DOOR", "WALL"]
    ],
    medium: [
        ["JAVASCRIPT", "HTML", "CSS", "NODE", "REACT", "PYTHON", "JAVA"],
        ["MOUNTAIN", "OCEAN", "FOREST", "DESERT", "RIVER", "VALLEY", "ISLAND"],
        ["GUITAR", "PIANO", "VIOLIN", "DRUMS", "FLUTE", "TRUMPET", "SAXOPHONE"],
        ["ADVENTURE", "MYSTERY", "FANTASY", "ROMANCE", "THRILLER", "COMEDY", "DRAMA"]
    ],
    hard: [
        ["ALGORITHM", "DATABASE", "FRAMEWORK", "REPOSITORY", "INTEGRATION", "DEPLOYMENT"],
        ["CONSTELLATION", "ATMOSPHERE", "GRAVITATIONAL", "ELECTROMAGNETIC", "PHOTOSYNTHESIS", "BIODIVERSITY"],
        ["ARCHITECTURE", "ENGINEERING", "MATHEMATICS", "PHILOSOPHY", "PSYCHOLOGY", "ANTHROPOLOGY"],
        ["REVOLUTIONARY", "EXTRAORDINARY", "SOPHISTICATED", "UNPRECEDENTED", "COMPREHENSIVE", "MAGNIFICENT"]
    ],
    expert: [
        ["CRYPTOCURRENCY", "BLOCKCHAIN", "DECENTRALIZATION", "AUTHENTICATION", "CYBERSECURITY", "VIRTUALIZATION"],
        ["NEUROPLASTICITY", "CONSCIOUSNESS", "ELECTROMAGNETIC", "THERMODYNAMICS", "QUANTUM", "RELATIVITY"],
        ["ENTREPRENEURSHIP", "GLOBALIZATION", "SUSTAINABILITY", "INNOVATION", "TRANSFORMATION", "OPTIMIZATION"],
        ["INTERDISCIPLINARY", "MULTIDIMENSIONAL", "INCOMPREHENSIBLE", "DISPROPORTIONATE", "COUNTERPRODUCTIVE", "UNCONVENTIONAL"]
    ]
};

// Game state
let gameState = {
    words: [],
    gridSize: 8,
    grid: [],
    foundWords: [],
    score: 0,
    totalScore: parseInt(localStorage.getItem('totalScore')) || 0,
    streak: 0,
    bestStreak: parseInt(localStorage.getItem('bestStreak')) || 0,
    timer: null,
    timeLeft: 60,
    startTime: 60,
    isSelecting: false,
    selectedCells: [],
    selectionDirection: null,
    isPaused: false,
    hintsLeft: 3,
    comboMultiplier: 1,
    comboCount: 0,
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
    currentTheme: localStorage.getItem('theme') || 'default',
    achievements: JSON.parse(localStorage.getItem('achievements')) || []
};

// Game elements
const elements = {
    difficultySelect: document.getElementById('difficultySelect'),
    themeSelect: document.getElementById('themeSelect'),
    timeLeft: document.getElementById('timeLeft'),
    scoreValue: document.getElementById('scoreValue'),
    totalScore: document.getElementById('totalScore'),
    streak: document.getElementById('streak'),
    progressValue: document.getElementById('progressValue'),
    progressBar: document.getElementById('progressBar'),
    wordSearchTable: document.getElementById('wordSearchTable'),
    remainingWords: document.getElementById('remainingWords'),
    resetButton: document.getElementById('resetButton'),
    pauseButton: document.getElementById('pauseButton'),
    shuffleButton: document.getElementById('shuffleButton'),
    powerUpBtn: document.getElementById('powerUpBtn'),
    hintsLeft: document.getElementById('hintsLeft'),
    comboIndicator: document.getElementById('comboIndicator'),
    comboMultiplier: document.getElementById('comboMultiplier'),
    resultModal: document.getElementById('resultModal'),
    closeModal: document.getElementById('closeModal'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    soundToggle: document.getElementById('soundToggle')
};

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
    applyTheme(gameState.currentTheme);
    updateUI();
    createParticles();
});

function initializeGame() {
    elements.themeSelect.value = gameState.currentTheme;
    elements.totalScore.textContent = gameState.totalScore;
    elements.streak.textContent = gameState.bestStreak;
    elements.hintsLeft.textContent = gameState.hintsLeft;
    
    if (!gameState.soundEnabled) {
        elements.soundToggle.classList.add('muted');
        elements.soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
    
    setDifficulty('easy');
}

function setupEventListeners() {
    elements.difficultySelect.addEventListener('change', (e) => setDifficulty(e.target.value));
    elements.themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));
    elements.resetButton.addEventListener('click', resetGame);
    elements.pauseButton.addEventListener('click', togglePause);
    elements.shuffleButton.addEventListener('click', shuffleGrid);
    elements.powerUpBtn.addEventListener('click', useHint);
    elements.closeModal.addEventListener('click', closeModal);
    elements.playAgainBtn.addEventListener('click', () => {
        closeModal();
        resetGame();
    });
    elements.soundToggle.addEventListener('click', toggleSound);
    
    document.addEventListener('mouseup', () => {
        if (gameState.isSelecting) {
            gameState.isSelecting = false;
            checkForWord();
            clearSelection();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'r':
            case 'R':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    resetGame();
                }
                break;
            case ' ':
                e.preventDefault();
                togglePause();
                break;
            case 'h':
            case 'H':
                if (gameState.hintsLeft > 0) {
                    useHint();
                }
                break;
        }
    });
}

function setDifficulty(difficulty) {
    const difficultySettings = {
        easy: { size: 8, time: 90 },
        medium: { size: 12, time: 120 },
        hard: { size: 16, time: 150 },
        expert: { size: 20, time: 180 }
    };
    
    const settings = difficultySettings[difficulty];
    gameState.gridSize = settings.size;
    gameState.startTime = settings.time;
    gameState.timeLeft = settings.time;
    
    const wordSets = wordLists[difficulty];
    gameState.words = wordSets[Math.floor(Math.random() * wordSets.length)];
    
    resetGame();
}

function resetGame() {
    clearInterval(gameState.timer);
    gameState.foundWords = [];
    gameState.score = 0;
    gameState.timeLeft = gameState.startTime;
    gameState.isPaused = false;
    gameState.hintsLeft = 3;
    gameState.comboMultiplier = 1;
    gameState.comboCount = 0;
    gameState.selectedCells = [];
    gameState.isSelecting = false;
    
    elements.pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
    elements.hintsLeft.textContent = gameState.hintsLeft;
    
    generateGrid();
    updateUI();
    startTimer();
    playSound('start');
}

function generateGrid() {
    gameState.grid = Array.from({ length: gameState.gridSize }, () => 
        Array(gameState.gridSize).fill('')
    );
    
    // Place words with improved algorithm
    gameState.words.forEach(word => placeWordImproved(word));
    fillEmptySpaces();
    renderGrid();
}

function placeWordImproved(word) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!placed && attempts < maxAttempts) {
        const row = Math.floor(Math.random() * gameState.gridSize);
        const col = Math.floor(Math.random() * gameState.gridSize);
        const direction = Math.floor(Math.random() * 8); // 8 directions including diagonals
        
        if (canPlaceWordImproved(row, col, word, direction)) {
            const [rowDir, colDir] = getDirection(direction);
            
            for (let i = 0; i < word.length; i++) {
                const r = row + (rowDir * i);
                const c = col + (colDir * i);
                gameState.grid[r][c] = word[i];
            }
            placed = true;
        }
        attempts++;
    }
}

function getDirection(direction) {
    const directions = [
        [0, 1],   // horizontal right
        [1, 0],   // vertical down
        [1, 1],   // diagonal down-right
        [1, -1],  // diagonal down-left
        [0, -1],  // horizontal left
        [-1, 0],  // vertical up
        [-1, -1], // diagonal up-left
        [-1, 1]   // diagonal up-right
    ];
    return directions[direction];
}

function canPlaceWordImproved(row, col, word, direction) {
    const [rowDir, colDir] = getDirection(direction);
    
    for (let i = 0; i < word.length; i++) {
        const r = row + (rowDir * i);
        const c = col + (colDir * i);
        
        if (r < 0 || r >= gameState.gridSize || c < 0 || c >= gameState.gridSize) {
            return false;
        }
        
        if (gameState.grid[r][c] !== '' && gameState.grid[r][c] !== word[i]) {
            return false;
        }
    }
    return true;
}

function fillEmptySpaces() {
    for (let r = 0; r < gameState.gridSize; r++) {
        for (let c = 0; c < gameState.gridSize; c++) {
            if (gameState.grid[r][c] === '') {
                gameState.grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }
}

function renderGrid() {
    elements.wordSearchTable.innerHTML = '';
    
    gameState.grid.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        row.forEach((cell, colIndex) => {
            const td = document.createElement('td');
            td.textContent = cell;
            td.dataset.row = rowIndex;
            td.dataset.col = colIndex;
            
            td.addEventListener('mousedown', (e) => {
                e.preventDefault();
                startSelection(rowIndex, colIndex);
            });
            
            td.addEventListener('mouseover', () => {
                if (gameState.isSelecting) {
                    continueSelection(rowIndex, colIndex);
                }
            });
            
            tr.appendChild(td);
        });
        elements.wordSearchTable.appendChild(tr);
    });
}

function startSelection(row, col) {
    if (gameState.isPaused) return;
    
    gameState.isSelecting = true;
    gameState.selectedCells = [`${row},${col}`];
    gameState.selectionDirection = null;
    
    updateCellSelection();
}

function continueSelection(row, col) {
    if (!gameState.isSelecting || gameState.isPaused) return;
    
    const cellId = `${row},${col}`;
    const [startRow, startCol] = gameState.selectedCells[0].split(',').map(Number);
    
    // Determine selection direction and create path
    const path = createSelectionPath(startRow, startCol, row, col);
    gameState.selectedCells = path;
    
    updateCellSelection();
}

function createSelectionPath(startRow, startCol, endRow, endCol) {
    const path = [];
    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;
    
    // Determine if it's a valid direction (horizontal, vertical, or diagonal)
    if (rowDiff === 0) {
        // Horizontal
        const step = colDiff > 0 ? 1 : -1;
        for (let c = startCol; c !== endCol + step; c += step) {
            path.push(`${startRow},${c}`);
        }
    } else if (colDiff === 0) {
        // Vertical
        const step = rowDiff > 0 ? 1 : -1;
        for (let r = startRow; r !== endRow + step; r += step) {
            path.push(`${r},${startCol}`);
        }
    } else if (Math.abs(rowDiff) === Math.abs(colDiff)) {
        // Diagonal
        const rowStep = rowDiff > 0 ? 1 : -1;
        const colStep = colDiff > 0 ? 1 : -1;
        let r = startRow, c = startCol;
        
        while (r !== endRow + rowStep && c !== endCol + colStep) {
            path.push(`${r},${c}`);
            r += rowStep;
            c += colStep;
        }
    } else {
        // Invalid direction, just return start cell
        path.push(`${startRow},${startCol}`);
    }
    
    return path;
}

function updateCellSelection() {
    // Clear previous selections
    document.querySelectorAll('#wordSearchTable td').forEach(td => {
        td.classList.remove('selected');
    });
    
    // Apply current selection
    gameState.selectedCells.forEach(cellId => {
        const [row, col] = cellId.split(',').map(Number);
        const td = document.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
        if (td) {
            td.classList.add('selected');
        }
    });
}

function clearSelection() {
    gameState.selectedCells.forEach(cellId => {
        const [row, col] = cellId.split(',').map(Number);
        const td = document.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
        if (td && !td.classList.contains('found')) {
            td.classList.remove('selected');
        }
    });
    gameState.selectedCells = [];
}

function checkForWord() {
    if (gameState.selectedCells.length === 0) return;
    
    const selectedWord = gameState.selectedCells.map(cellId => {
        const [row, col] = cellId.split(',').map(Number);
        return gameState.grid[row][col];
    }).join('');
    
    const reversedWord = selectedWord.split('').reverse().join('');
    
    // Check if word exists (forward or backward)
    const foundWord = gameState.words.find(word => 
        (word === selectedWord || word === reversedWord) && 
        !gameState.foundWords.includes(word)
    );
    
    if (foundWord) {
        gameState.foundWords.push(foundWord);
        
        // Calculate score with combo multiplier
        const baseScore = foundWord.length * 10;
        const bonusScore = Math.floor(baseScore * (gameState.comboMultiplier - 1));
        const totalWordScore = baseScore + bonusScore;
        
        gameState.score += totalWordScore;
        gameState.comboCount++;
        
        // Increase combo multiplier
        if (gameState.comboCount % 3 === 0) {
            gameState.comboMultiplier = Math.min(gameState.comboMultiplier + 0.5, 5);
            showComboIndicator();
        }
        
        highlightFoundWord();
        updateUI();
        playSound('found');
        createWordFoundEffect();
        
        // Check for game completion
        if (gameState.foundWords.length === gameState.words.length) {
            endGame(true);
        }
    } else {
        // Reset combo on miss
        gameState.comboMultiplier = 1;
        gameState.comboCount = 0;
        playSound('miss');
    }
}

function highlightFoundWord() {
    gameState.selectedCells.forEach(cellId => {
        const [row, col] = cellId.split(',').map(Number);
        const td = document.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
        if (td) {
            td.classList.remove('selected');
            td.classList.add('found');
        }
    });
}

function showComboIndicator() {
    elements.comboMultiplier.textContent = gameState.comboMultiplier.toFixed(1);
    elements.comboIndicator.classList.add('active');
    
    setTimeout(() => {
        elements.comboIndicator.classList.remove('active');
    }, 2000);
}

function createWordFoundEffect() {
    // Create floating score animation
    const scoreElement = document.createElement('div');
    scoreElement.className = 'floating-score';
    scoreElement.textContent = `+${gameState.words.find(w => gameState.foundWords.includes(w)) ? 
        gameState.words.find(w => gameState.foundWords.includes(w)).length * 10 : 10}`;
    scoreElement.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--success-color);
        font-weight: bold;
        font-size: 1.5rem;
        pointer-events: none;
        z-index: 1000;
        animation: floatUp 1s ease-out forwards;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -150%) scale(1.2); }
        }
    `;
    document.head.appendChild(style);
    
    elements.wordSearchTable.parentElement.appendChild(scoreElement);
    
    setTimeout(() => {
        scoreElement.remove();
        style.remove();
    }, 1000);
}

function useHint() {
    if (gameState.hintsLeft <= 0 || gameState.isPaused) return;
    
    const remainingWords = gameState.words.filter(word => !gameState.foundWords.includes(word));
    if (remainingWords.length === 0) return;
    
    const hintWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
    const wordPosition = findWordInGrid(hintWord);
    
    if (wordPosition) {
        gameState.hintsLeft--;
        elements.hintsLeft.textContent = gameState.hintsLeft;
        
        // Highlight the word briefly
        wordPosition.forEach(([row, col]) => {
            const td = document.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
            if (td) {
                td.classList.add('hint');
                setTimeout(() => td.classList.remove('hint'), 2000);
            }
        });
        
        // Highlight word in list
        const wordElements = document.querySelectorAll('.word-item');
        wordElements.forEach(el => {
            if (el.textContent === hintWord) {
                el.classList.add('hint');
                setTimeout(() => el.classList.remove('hint'), 2000);
            }
        });
        
        playSound('hint');
    }
}

function findWordInGrid(word) {
    for (let row = 0; row < gameState.gridSize; row++) {
        for (let col = 0; col < gameState.gridSize; col++) {
            for (let direction = 0; direction < 8; direction++) {
                const position = checkWordAtPosition(word, row, col, direction);
                if (position) return position;
            }
        }
    }
    return null;
}

function checkWordAtPosition(word, startRow, startCol, direction) {
    const [rowDir, colDir] = getDirection(direction);
    const positions = [];
    
    for (let i = 0; i < word.length; i++) {
        const row = startRow + (rowDir * i);
        const col = startCol + (colDir * i);
        
        if (row < 0 || row >= gameState.gridSize || col < 0 || col >= gameState.gridSize) {
            return null;
        }
        
        if (gameState.grid[row][col] !== word[i]) {
            return null;
        }
        
        positions.push([row, col]);
    }
    
    return positions;
}

function shuffleGrid() {
    if (gameState.isPaused) return;
    
    // Shuffle only the empty spaces (non-word letters)
    const emptyPositions = [];
    const letters = [];
    
    for (let row = 0; row < gameState.gridSize; row++) {
        for (let col = 0; col < gameState.gridSize; col++) {
            if (!isPartOfWord(row, col)) {
                emptyPositions.push([row, col]);
                letters.push(gameState.grid[row][col]);
            }
        }
    }
    
    // Shuffle letters
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    // Place shuffled letters back
    emptyPositions.forEach(([row, col], index) => {
        gameState.grid[row][col] = letters[index];
    });
    
    renderGrid();
    playSound('shuffle');
}

function isPartOfWord(row, col) {
    return gameState.words.some(word => {
        for (let direction = 0; direction < 8; direction++) {
            const position = checkWordAtPosition(word, row, col, direction);
            if (position && position.some(([r, c]) => r === row && c === col)) {
                return true;
            }
        }
        return false;
    });
}

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        clearInterval(gameState.timer);
        elements.pauseButton.innerHTML = '<i class="fas fa-play"></i> Resume';
        elements.wordSearchTable.style.filter = 'blur(5px)';
    } else {
        startTimer();
        elements.pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
        elements.wordSearchTable.style.filter = 'none';
    }
}

function startTimer() {
    clearInterval(gameState.timer);
    
    gameState.timer = setInterval(() => {
        if (!gameState.isPaused && gameState.timeLeft > 0) {
            gameState.timeLeft--;
            updateUI();
            
            if (gameState.timeLeft <= 10) {
                elements.timeLeft.style.color = 'var(--danger-color)';
                elements.timeLeft.style.animation = 'pulse 1s infinite';
            }
            
            if (gameState.timeLeft === 0) {
                endGame(false);
            }
        }
    }, 1000);
}

function endGame(completed) {
    clearInterval(gameState.timer);
    
    // Update total score and streak
    gameState.totalScore += gameState.score;
    
    if (completed) {
        gameState.streak++;
        if (gameState.streak > gameState.bestStreak) {
            gameState.bestStreak = gameState.streak;
        }
    } else {
        gameState.streak = 0;
    }
    
    // Save to localStorage
    localStorage.setItem('totalScore', gameState.totalScore);
    localStorage.setItem('bestStreak', gameState.bestStreak);
    
    // Check for achievements
    const newAchievements = checkAchievements();
    
    // Show result modal
    showResultModal(completed, newAchievements);
    
    playSound(completed ? 'win' : 'lose');
}

function checkAchievements() {
    const achievements = [];
    const existingAchievements = gameState.achievements;
    
    // Define achievements
    const achievementList = [
        { id: 'first_win', name: 'First Victory', description: 'Complete your first game', condition: () => gameState.foundWords.length === gameState.words.length },
        { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a game in under 30 seconds', condition: () => gameState.foundWords.length === gameState.words.length && (gameState.startTime - gameState.timeLeft) < 30 },
        { id: 'combo_master', name: 'Combo Master', description: 'Achieve a 3x combo multiplier', condition: () => gameState.comboMultiplier >= 3 },
        { id: 'high_scorer', name: 'High Scorer', description: 'Score over 500 points in a single game', condition: () => gameState.score >= 500 },
        { id: 'streak_master', name: 'Streak Master', description: 'Win 5 games in a row', condition: () => gameState.streak >= 5 }
    ];
    
    achievementList.forEach(achievement => {
        if (!existingAchievements.includes(achievement.id) && achievement.condition()) {
            achievements.push(achievement);
            gameState.achievements.push(achievement.id);
        }
    });
    
    if (achievements.length > 0) {
        localStorage.setItem('achievements', JSON.stringify(gameState.achievements));
    }
    
    return achievements;
}

function showResultModal(completed, achievements) {
    const modal = elements.resultModal;
    const modalTitle = document.getElementById('modalTitle');
    const finalScore = document.getElementById('finalScore');
    const timeUsed = document.getElementById('timeUsed');
    const wordsFound = document.getElementById('wordsFound');
    const bestCombo = document.getElementById('bestCombo');
    const achievementSection = document.getElementById('achievementSection');
    const achievementsList = document.getElementById('achievementsList');
    
    modalTitle.textContent = completed ? 'Congratulations!' : 'Time\'s Up!';
    finalScore.textContent = gameState.score;
    timeUsed.textContent = `${gameState.startTime - gameState.timeLeft}s`;
    wordsFound.textContent = `${gameState.foundWords.length}/${gameState.words.length}`;
    bestCombo.textContent = `${gameState.comboMultiplier.toFixed(1)}x`;
    
    if (achievements.length > 0) {
        achievementSection.style.display = 'block';
        achievementsList.innerHTML = achievements.map(achievement => 
            `<div class="achievement-item">
                <i class="fas fa-trophy"></i>
                <div>
                    <strong>${achievement.name}</strong>
                    <div style="font-size: 0.875rem; opacity: 0.8;">${achievement.description}</div>
                </div>
            </div>`
        ).join('');
    } else {
        achievementSection.style.display = 'none';
    }
    
    modal.classList.add('active');
}

function closeModal() {
    elements.resultModal.classList.remove('active');
}

function updateUI() {
    elements.timeLeft.textContent = gameState.timeLeft;
    elements.scoreValue.textContent = gameState.score;
    elements.totalScore.textContent = gameState.totalScore;
    elements.streak.textContent = gameState.bestStreak;
    
    const progress = (gameState.foundWords.length / gameState.words.length) * 100;
    elements.progressValue.textContent = `${Math.round(progress)}%`;
    elements.progressBar.style.width = `${progress}%`;
    
    updateWordList();
}

function updateWordList() {
    elements.remainingWords.innerHTML = gameState.words.map(word => {
        const isFound = gameState.foundWords.includes(word);
        return `<div class="word-item ${isFound ? 'found' : ''}">${word}</div>`;
    }).join('');
}

function applyTheme(theme) {
    gameState.currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    document.body.className = theme === 'default' ? '' : `theme-${theme}`;
    elements.themeSelect.value = theme;
}

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    localStorage.setItem('soundEnabled', gameState.soundEnabled);
    
    if (gameState.soundEnabled) {
        elements.soundToggle.classList.remove('muted');
        elements.soundToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
    } else {
        elements.soundToggle.classList.add('muted');
        elements.soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
}

function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const soundMap = {
        start: { frequency: 440, duration: 0.2 },
        found: { frequency: 660, duration: 0.3 },
        miss: { frequency: 220, duration: 0.1 },
        hint: { frequency: 880, duration: 0.2 },
        shuffle: { frequency: 330, duration: 0.15 },
        win: { frequency: 523, duration: 0.5 },
        lose: { frequency: 196, duration: 0.4 }
    };
    
    const sound = soundMap[type];
    if (!sound) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
}

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 3 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Initialize the game
setDifficulty('easy');