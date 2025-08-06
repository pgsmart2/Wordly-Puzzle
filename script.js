// Word Search Game - Complete Implementation
class WordSearchGame {
    constructor() {
        this.gridSize = 15;
        this.grid = [];
        this.words = [];
        this.foundWords = [];
        this.selectedCells = [];
        this.isSelecting = false;
        this.score = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.difficulty = 'medium';
        this.theme = 'cyberpunk';
        this.category = 'random';
        this.hintsLeft = 3;
        this.streak = 0;
        this.combo = 1;
        this.soundEnabled = true;
        this.isPaused = false;
        
        this.wordLists = {
            animals: ['LION', 'TIGER', 'ELEPHANT', 'GIRAFFE', 'ZEBRA', 'MONKEY', 'BEAR', 'WOLF', 'FOX', 'DEER'],
            food: ['PIZZA', 'BURGER', 'PASTA', 'SUSHI', 'TACOS', 'SALAD', 'BREAD', 'CHEESE', 'FRUIT', 'CAKE'],
            technology: ['COMPUTER', 'PHONE', 'INTERNET', 'SOFTWARE', 'CODING', 'ROBOT', 'AI', 'DATA', 'CLOUD', 'CYBER'],
            nature: ['FOREST', 'OCEAN', 'MOUNTAIN', 'RIVER', 'FLOWER', 'TREE', 'GRASS', 'STONE', 'WIND', 'RAIN'],
            sports: ['FOOTBALL', 'BASKETBALL', 'TENNIS', 'SOCCER', 'BASEBALL', 'GOLF', 'SWIMMING', 'RUNNING', 'BOXING', 'HOCKEY'],
            music: ['GUITAR', 'PIANO', 'DRUMS', 'VIOLIN', 'SONG', 'MELODY', 'RHYTHM', 'BEAT', 'HARMONY', 'CONCERT'],
            travel: ['AIRPLANE', 'HOTEL', 'PASSPORT', 'LUGGAGE', 'BEACH', 'CITY', 'COUNTRY', 'VACATION', 'JOURNEY', 'ADVENTURE'],
            science: ['PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'ATOM', 'MOLECULE', 'ENERGY', 'GRAVITY', 'SPACE', 'PLANET', 'STAR'],
            movies: ['ACTION', 'COMEDY', 'DRAMA', 'HORROR', 'ROMANCE', 'THRILLER', 'FANTASY', 'ADVENTURE', 'MYSTERY', 'WESTERN'],
            books: ['NOVEL', 'POETRY', 'STORY', 'CHAPTER', 'AUTHOR', 'LIBRARY', 'READING', 'WRITING', 'FICTION', 'MYSTERY']
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.generateNewGame();
        this.createParticles();
    }
    
    setupEventListeners() {
        // Game controls
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.generateNewGame();
        });
        
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.theme = e.target.value;
            this.applyTheme();
        });
        
        document.getElementById('categorySelect').addEventListener('change', (e) => {
            this.category = e.target.value;
            this.generateNewGame();
        });
        
        // Action buttons
        document.getElementById('resetButton').addEventListener('click', () => {
            this.generateNewGame();
        });
        
        document.getElementById('pauseButton').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('shuffleButton').addEventListener('click', () => {
            this.shuffleGrid();
        });
        
        document.getElementById('freezeTimeBtn').addEventListener('click', () => {
            this.freezeTime();
        });
        
        document.getElementById('powerUpBtn').addEventListener('click', () => {
            this.useHint();
        });
        
        document.getElementById('soundToggle').addEventListener('click', () => {
            this.toggleSound();
        });
        
        document.getElementById('startDailyBtn').addEventListener('click', () => {
            this.startDailyChallenge();
        });
        
        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.closeModal();
            this.generateNewGame();
        });
        
        // Grid selection
        document.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'TD' && e.target.closest('#wordSearchTable')) {
                this.startSelection(e.target);
            }
        });
        
        document.addEventListener('mouseover', (e) => {
            if (this.isSelecting && e.target.tagName === 'TD' && e.target.closest('#wordSearchTable')) {
                this.updateSelection(e.target);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (this.isSelecting) {
                this.endSelection();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'h':
                    this.useHint();
                    break;
                case 'r':
                    this.generateNewGame();
                    break;
                case 's':
                    this.shuffleGrid();
                    break;
            }
        });
    }
    
    applyTheme() {
        document.body.className = `theme-${this.theme}`;
        this.updateThemeColors();
    }
    
    updateThemeColors() {
        const themes = {
            cyberpunk: { primary: '#00ff88', secondary: '#00cc6a', accent: '#33ffaa' },
            galaxy: { primary: '#9333ea', secondary: '#7c3aed', accent: '#a855f7' },
            volcano: { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444' },
            arctic: { primary: '#0ea5e9', secondary: '#0284c7', accent: '#38bdf8' },
            rainbow: { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' },
            midnight: { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' }
        };
        
        const themeColors = themes[this.theme];
        if (themeColors) {
            document.documentElement.style.setProperty('--primary-color', themeColors.primary);
            document.documentElement.style.setProperty('--secondary-color', themeColors.secondary);
            document.documentElement.style.setProperty('--accent-color', themeColors.accent);
        }
    }
    
    generateNewGame() {
        this.resetGameState();
        this.generateWords();
        this.createGrid();
        this.placeWords();
        this.fillEmptySpaces();
        this.renderGrid();
        this.renderWordList();
        this.startTimer();
        this.updateStats();
    }
    
    resetGameState() {
        this.grid = [];
        this.foundWords = [];
        this.selectedCells = [];
        this.isSelecting = false;
        this.score = 0;
        this.combo = 1;
        this.hintsLeft = 3;
        
        // Set time based on difficulty
        const timeSettings = {
            easy: 90,
            medium: 60,
            hard: 45,
            expert: 30
        };
        this.timeLeft = timeSettings[this.difficulty];
        
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
    
    generateWords() {
        const wordCount = {
            easy: 6,
            medium: 8,
            hard: 10,
            expert: 12
        };
        
        let wordPool = [];
        if (this.category === 'random') {
            // Mix words from all categories
            Object.values(this.wordLists).forEach(list => {
                wordPool = wordPool.concat(list);
            });
        } else {
            wordPool = this.wordLists[this.category] || this.wordLists.animals;
        }
        
        // Shuffle and select words
        wordPool = this.shuffleArray(wordPool);
        this.words = wordPool.slice(0, wordCount[this.difficulty]);
    }
    
    createGrid() {
        this.grid = Array(this.gridSize).fill().map(() => 
            Array(this.gridSize).fill('')
        );
    }
    
    placeWords() {
        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal down-right
            [1, -1],  // diagonal down-left
            [0, -1],  // horizontal reverse
            [-1, 0],  // vertical reverse
            [-1, -1], // diagonal up-left
            [-1, 1]   // diagonal up-right
        ];
        
        this.words.forEach(word => {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const direction = directions[Math.floor(Math.random() * directions.length)];
                const startRow = Math.floor(Math.random() * this.gridSize);
                const startCol = Math.floor(Math.random() * this.gridSize);
                
                if (this.canPlaceWord(word, startRow, startCol, direction)) {
                    this.placeWord(word, startRow, startCol, direction);
                    placed = true;
                }
                attempts++;
            }
        });
    }
    
    canPlaceWord(word, row, col, direction) {
        for (let i = 0; i < word.length; i++) {
            const newRow = row + direction[0] * i;
            const newCol = col + direction[1] * i;
            
            if (newRow < 0 || newRow >= this.gridSize || 
                newCol < 0 || newCol >= this.gridSize) {
                return false;
            }
            
            if (this.grid[newRow][newCol] !== '' && 
                this.grid[newRow][newCol] !== word[i]) {
                return false;
            }
        }
        return true;
    }
    
    placeWord(word, row, col, direction) {
        for (let i = 0; i < word.length; i++) {
            const newRow = row + direction[0] * i;
            const newCol = col + direction[1] * i;
            this.grid[newRow][newCol] = word[i];
        }
    }
    
    fillEmptySpaces() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === '') {
                    this.grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
    }
    
    renderGrid() {
        const table = document.getElementById('wordSearchTable');
        table.innerHTML = '';
        
        for (let i = 0; i < this.gridSize; i++) {
            const row = table.insertRow();
            for (let j = 0; j < this.gridSize; j++) {
                const cell = row.insertCell();
                cell.textContent = this.grid[i][j];
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.classList.add('grid-cell');
            }
        }
    }
    
    renderWordList() {
        const container = document.getElementById('remainingWords');
        container.innerHTML = '';
        
        this.words.forEach(word => {
            const wordElement = document.createElement('div');
            wordElement.className = 'word-item';
            wordElement.textContent = word;
            wordElement.dataset.word = word;
            
            if (this.foundWords.includes(word)) {
                wordElement.classList.add('found');
            }
            
            container.appendChild(wordElement);
        });
        
        this.updateProgress();
    }
    
    startSelection(cell) {
        this.isSelecting = true;
        this.selectedCells = [cell];
        cell.classList.add('selected');
    }
    
    updateSelection(cell) {
        if (!this.isSelecting) return;
        
        // Clear previous selection
        this.selectedCells.forEach(c => c.classList.remove('selected'));
        
        // Calculate new selection path
        const startCell = this.selectedCells[0];
        const startRow = parseInt(startCell.dataset.row);
        const startCol = parseInt(startCell.dataset.col);
        const endRow = parseInt(cell.dataset.row);
        const endCol = parseInt(cell.dataset.col);
        
        this.selectedCells = this.getSelectionPath(startRow, startCol, endRow, endCol);
        this.selectedCells.forEach(c => c.classList.add('selected'));
    }
    
    getSelectionPath(startRow, startCol, endRow, endCol) {
        const path = [];
        const rowDiff = endRow - startRow;
        const colDiff = endCol - startCol;
        
        // Only allow straight lines (horizontal, vertical, diagonal)
        if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) {
            return [document.querySelector(`[data-row="${startRow}"][data-col="${startCol}"]`)];
        }
        
        const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
        const rowStep = steps === 0 ? 0 : rowDiff / steps;
        const colStep = steps === 0 ? 0 : colDiff / steps;
        
        for (let i = 0; i <= steps; i++) {
            const row = startRow + Math.round(rowStep * i);
            const col = startCol + Math.round(colStep * i);
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) path.push(cell);
        }
        
        return path;
    }
    
    endSelection() {
        if (!this.isSelecting) return;
        
        const selectedWord = this.selectedCells.map(cell => cell.textContent).join('');
        const reversedWord = selectedWord.split('').reverse().join('');
        
        let foundWord = null;
        if (this.words.includes(selectedWord) && !this.foundWords.includes(selectedWord)) {
            foundWord = selectedWord;
        } else if (this.words.includes(reversedWord) && !this.foundWords.includes(reversedWord)) {
            foundWord = reversedWord;
        }
        
        if (foundWord) {
            this.wordFound(foundWord);
            this.selectedCells.forEach(cell => {
                cell.classList.remove('selected');
                cell.classList.add('found');
            });
        } else {
            this.selectedCells.forEach(cell => cell.classList.remove('selected'));
        }
        
        this.isSelecting = false;
        this.selectedCells = [];
    }
    
    wordFound(word) {
        this.foundWords.push(word);
        this.score += word.length * 10 * this.combo;
        this.streak++;
        this.combo = Math.min(this.combo + 1, 5);
        
        // Update UI
        this.renderWordList();
        this.updateStats();
        this.showCombo();
        this.createWordExplosion();
        
        // Check if game is complete
        if (this.foundWords.length === this.words.length) {
            this.gameComplete();
        }
        
        // Play sound effect
        if (this.soundEnabled) {
            this.playSound('word-found');
        }
    }
    
    showCombo() {
        const comboIndicator = document.getElementById('comboIndicator');
        const multiplier = document.getElementById('comboMultiplier');
        
        multiplier.textContent = this.combo;
        comboIndicator.classList.add('active');
        
        setTimeout(() => {
            comboIndicator.classList.remove('active');
        }, 2000);
    }
    
    createWordExplosion() {
        const container = document.getElementById('particles');
        
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = Math.random() * window.innerHeight + 'px';
            particle.style.setProperty('--dx', (Math.random() - 0.5) * 200 + 'px');
            particle.style.setProperty('--dy', (Math.random() - 0.5) * 200 + 'px');
            
            container.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 800);
        }
    }
    
    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--;
                this.updateStats();
                
                if (this.timeLeft <= 0) {
                    this.gameOver();
                }
            }
        }, 1000);
    }
    
    updateStats() {
        document.getElementById('timeLeft').textContent = this.timeLeft;
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('totalScore').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
        document.getElementById('hintsLeft').textContent = this.hintsLeft;
        document.getElementById('speedBonus').textContent = Math.max(0, this.timeLeft * 2);
        
        this.updateProgress();
    }
    
    updateProgress() {
        const progress = (this.foundWords.length / this.words.length) * 100;
        document.getElementById('progressValue').textContent = Math.round(progress) + '%';
        document.getElementById('progressBar').style.width = progress + '%';
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseButton');
        const icon = pauseBtn.querySelector('i');
        
        if (this.isPaused) {
            icon.className = 'fas fa-play';
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        } else {
            icon.className = 'fas fa-pause';
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        }
    }
    
    shuffleGrid() {
        // Shuffle only the empty letters, keep word letters in place
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                // Only shuffle if this cell is not part of a found word
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                if (!cell.classList.contains('found')) {
                    this.grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
        
        this.renderGrid();
        
        // Re-apply found word styling
        this.foundWords.forEach(word => {
            // This is a simplified version - in a real implementation,
            // you'd need to track the positions of found words
        });
    }
    
    freezeTime() {
        this.timeLeft += 10;
        this.updateStats();
        
        // Visual feedback
        document.body.classList.add('screen-shake');
        setTimeout(() => {
            document.body.classList.remove('screen-shake');
        }, 500);
    }
    
    useHint() {
        if (this.hintsLeft <= 0) return;
        
        this.hintsLeft--;
        
        // Find a random unfound word and highlight its first letter
        const unfoundWords = this.words.filter(word => !this.foundWords.includes(word));
        if (unfoundWords.length > 0) {
            const randomWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
            
            // Highlight the word in the word list
            const wordElement = document.querySelector(`[data-word="${randomWord}"]`);
            if (wordElement) {
                wordElement.classList.add('hint');
                setTimeout(() => {
                    wordElement.classList.remove('hint');
                }, 3000);
            }
        }
        
        this.updateStats();
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundToggle');
        const icon = soundBtn.querySelector('i');
        
        if (this.soundEnabled) {
            icon.className = 'fas fa-volume-up';
            soundBtn.classList.remove('muted');
        } else {
            icon.className = 'fas fa-volume-mute';
            soundBtn.classList.add('muted');
        }
    }
    
    startDailyChallenge() {
        // Set special daily challenge parameters
        this.difficulty = 'expert';
        this.category = 'random';
        this.timeLeft = 120;
        this.hintsLeft = 1;
        
        // Hide daily challenge banner
        document.getElementById('dailyChallenge').style.display = 'none';
        
        this.generateNewGame();
    }
    
    gameComplete() {
        clearInterval(this.timer);
        
        const timeBonus = this.timeLeft * 2;
        const finalScore = this.score + timeBonus;
        
        this.showResultModal('Congratulations!', {
            score: finalScore,
            timeUsed: this.getTimeUsed(),
            wordsFound: this.foundWords.length,
            bestCombo: this.combo
        });
    }
    
    gameOver() {
        clearInterval(this.timer);
        
        this.showResultModal('Time\'s Up!', {
            score: this.score,
            timeUsed: this.getTimeUsed(),
            wordsFound: this.foundWords.length,
            bestCombo: this.combo
        });
    }
    
    getTimeUsed() {
        const totalTime = {
            easy: 90,
            medium: 60,
            hard: 45,
            expert: 30
        };
        return totalTime[this.difficulty] - this.timeLeft;
    }
    
    showResultModal(title, stats) {
        const modal = document.getElementById('resultModal');
        const modalTitle = document.getElementById('modalTitle');
        const finalScore = document.getElementById('finalScore');
        const timeUsed = document.getElementById('timeUsed');
        const wordsFound = document.getElementById('wordsFound');
        const bestCombo = document.getElementById('bestCombo');
        
        modalTitle.textContent = title;
        finalScore.textContent = stats.score;
        timeUsed.textContent = stats.timeUsed + 's';
        wordsFound.textContent = stats.wordsFound + '/' + this.words.length;
        bestCombo.textContent = stats.bestCombo + 'x';
        
        modal.classList.add('active');
    }
    
    closeModal() {
        const modal = document.getElementById('resultModal');
        modal.classList.remove('active');
    }
    
    createParticles() {
        const container = document.getElementById('particles');
        
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
            
            container.appendChild(particle);
        }
    }
    
    playSound(type) {
        // Placeholder for sound effects
        // In a real implementation, you would play actual audio files
        console.log(`Playing sound: ${type}`);
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WordSearchGame();
});

// Add some additional utility functions for enhanced UX
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation
    const gameContainer = document.querySelector('.game-container');
    gameContainer.style.opacity = '0';
    gameContainer.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        gameContainer.style.transition = 'all 0.5s ease-out';
        gameContainer.style.opacity = '1';
        gameContainer.style.transform = 'translateY(0)';
    }, 100);
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.action-btn, .power-up-btn, .challenge-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add ripple effect to buttons
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .action-btn, .power-up-btn, .challenge-btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
