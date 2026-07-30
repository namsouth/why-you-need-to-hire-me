/**
 * Colour Word Game - Main Logic
 * Vue 3 Composition API
 */

// ========================================
// CONFIGURATION
// ========================================

const AVAILABLE_COLOURS = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Cyan', hex: '#06b6d4' },
];

const DEFAULT_SETTINGS = {
    mode: 'word',
    colours: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'],
    rows: 3,
    cols: 4,
    totalRounds: 3,
};

// ========================================
// INDEXEDDB HELPERS
// ========================================

const DB_NAME = 'ColourWordGame';
const DB_VERSION = 1;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('history')) {
                const store = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
                store.createIndex('date', 'date');
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveToDB(storeName, data) {
    try {
        const db = await openDB();
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        if (Array.isArray(data)) {
            store.clear();
            data.forEach(item => store.add(item));
        } else {
            store.put(data);
        }
        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = reject;
        });
    } catch (e) {
        console.error(`Failed to save to ${storeName}:`, e);
    }
}

async function loadFromDB(storeName, key = null) {
    try {
        const db = await openDB();
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const result = await new Promise((resolve, reject) => {
            const req = key ? store.get(key) : store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        return result;
    } catch (e) {
        console.error(`Failed to load from ${storeName}:`, e);
        return null;
    }
}

// ========================================
// VUE APP
// ========================================

const { createApp, ref, computed, watch, onMounted } = Vue;

const app = createApp({
    setup() {
        // ----- Reactive State -----
        const settings = ref({ ...DEFAULT_SETTINGS });
        const showSettings = ref(false);
        const showHistory = ref(false);
        const history = ref([]);

        // Game State
        const grid = ref([]);
        const sequence = ref([]);
        const currentSequenceIndex = ref(0);
        const currentRound = ref(0);
        const gameStarted = ref(false);
        const gameOver = ref(false);

        // Stats
        const totalTime = ref(0);
        const lastRoundTime = ref(0);
        const errorCount = ref(0);
        const roundStartTime = ref(null);
        const totalStartTime = ref(null);

        // ----- Computed Properties -----
        const mode = computed(() => settings.value.mode);
        const rows = computed(() => settings.value.rows);
        const cols = computed(() => settings.value.cols);
        const totalRounds = computed(() => settings.value.totalRounds);
        const activeColours = computed(() => settings.value.colours);

        const gridStyle = computed(() => ({
            gridTemplateColumns: `repeat(${cols.value}, 1fr)`,
            maxWidth: Math.min(cols.value * 120, 600) + 'px',
        }));

        // ----- Helper Functions -----
        function getColourHex(name) {
            const found = AVAILABLE_COLOURS.find(c => c.name === name);
            return found ? found.hex : '#ffffff';
        }

        function getRandomColourName() {
            const colours = activeColours.value;
            return colours[Math.floor(Math.random() * colours.length)];
        }

        function shuffleArray(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function formatTime(seconds) {
            if (!seconds || seconds < 0) return '0s';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
        }

        function isColourSelected(name) {
            return settings.value.colours.includes(name);
        }

        function getSequenceClass(idx) {
            if (idx === currentSequenceIndex.value && !gameOver.value) return 'active';
            if (idx < currentSequenceIndex.value) return 'completed';
            return '';
        }

        function getCardClass(idx) {
            const card = grid.value[idx];
            if (!card) return '';
            const classes = [];
            if (gameOver.value || !gameStarted.value || currentSequenceIndex.value >= sequence.value.length) {
                classes.push('disabled');
            }
            if (card.flashCorrect) classes.push('correct');
            if (card.flashWrong) classes.push('wrong');
            return classes.join(' ');
        }

        function getCardStyle(card) {
            return {
                backgroundColor: card.bgColor,
                color: card.textColor,
            };
        }

        function clearCardFlashes() {
            grid.value.forEach(card => {
                card.flashCorrect = false;
                card.flashWrong = false;
            });
        }

        // ----- Game Logic -----
        function generateSequence() {
            const length = rows.value * cols.value;
            const colours = activeColours.value;
            const seq = [];
            for (let i = 0; i < length; i++) {
                seq.push(colours[i % colours.length]);
            }
            return shuffleArray(seq);
        }

        function generateGrid() {
            const total = rows.value * cols.value;
            const newGrid = [];
            for (let i = 0; i < total; i++) {
                const bgColour = getRandomColourName();
                const wordColour = getRandomColourName();
                newGrid.push({
                    bgColor: getColourHex(bgColour),
                    textColor: getColourHex(wordColour),
                    word: wordColour,
                    bgName: bgColour,
                    wordName: wordColour,
                    flashCorrect: false,
                    flashWrong: false,
                });
            }
            return newGrid;
        }

        function initGame() {
            sequence.value = generateSequence();
            grid.value = generateGrid();
            currentSequenceIndex.value = 0;
            gameStarted.value = false;
            gameOver.value = false;
            errorCount.value = 0;
            totalTime.value = 0;
            lastRoundTime.value = 0;
            roundStartTime.value = null;
            totalStartTime.value = null;
            currentRound.value = 0;
            clearCardFlashes();
        }

        function startGame() {
            if (gameStarted.value) return;
            gameStarted.value = true;
            roundStartTime.value = Date.now();
            if (!totalStartTime.value) {
                totalStartTime.value = Date.now();
            }
        }

        function handleCardClick(index) {
            // Validation
            if (gameOver.value || !gameStarted.value || currentSequenceIndex.value >= sequence.value.length) {
                if (!gameStarted.value) startGame();
                return;
            }

            const card = grid.value[index];
            const target = sequence.value[currentSequenceIndex.value];
            let isCorrect = false;

            // Check match based on mode
            if (mode.value === 'word') {
                isCorrect = card.wordName === target;
            } else {
                isCorrect = card.bgName === target;
            }

            if (isCorrect) {
                // Correct click
                card.flashCorrect = true;
                setTimeout(() => { card.flashCorrect = false; }, 300);
                currentSequenceIndex.value++;

                // Check round completion
                if (currentSequenceIndex.value >= sequence.value.length) {
                    const now = Date.now();
                    lastRoundTime.value = (now - roundStartTime.value) / 1000;
                    totalTime.value = (now - totalStartTime.value) / 1000;
                    gameOver.value = true;
                    currentRound.value++;
                    saveRoundHistory();
                }
            } else {
                // Wrong click
                card.flashWrong = true;
                errorCount.value++;
                setTimeout(() => { card.flashWrong = false; }, 300);
            }
        }

        function saveRoundHistory() {
            const entry = {
                mode: mode.value,
                rows: rows.value,
                cols: cols.value,
                rounds: currentRound.value,
                totalTime: totalTime.value,
                errors: errorCount.value,
                date: new Date().toLocaleString(),
            };
            history.value.unshift(entry);
            saveToDB('history', history.value);
        }

        function nextRound() {
            if (currentRound.value < totalRounds.value) {
                // Start next round
                sequence.value = generateSequence();
                grid.value = generateGrid();
                currentSequenceIndex.value = 0;
                gameOver.value = false;
                gameStarted.value = false;
                roundStartTime.value = null;
                clearCardFlashes();
            } else {
                // All rounds complete
                alert(`🎉 Game Complete!\nTotal Time: ${formatTime(totalTime.value)}\nTotal Errors: ${errorCount.value}`);
                resetGame();
            }
        }

        function resetGame() {
            totalStartTime.value = null;
            currentRound.value = 0;
            initGame();
            totalTime.value = 0;
            lastRoundTime.value = 0;
            errorCount.value = 0;
        }

        // ----- Settings -----
        function toggleSettings() {
            showSettings.value = !showSettings.value;
            if (showSettings.value) showHistory.value = false;
        }

        function closeSettings() {
            showSettings.value = false;
        }

        function toggleHistory() {
            showHistory.value = !showHistory.value;
            if (showHistory.value) showSettings.value = false;
        }

        function closeHistory() {
            showHistory.value = false;
        }

        function toggleColour(name) {
            const idx = settings.value.colours.indexOf(name);
            if (idx >= 0) {
                if (settings.value.colours.length <= 2) {
                    alert('You need at least 2 colours!');
                    return;
                }
                settings.value.colours.splice(idx, 1);
            } else {
                settings.value.colours.push(name);
            }
        }

        async function saveSettings() {
            // Validation
            if (settings.value.colours.length < 2) {
                alert('Please select at least 2 colours!');
                return;
            }
            if (settings.value.rows < 2 || settings.value.rows > 6 || 
                settings.value.cols < 2 || settings.value.cols > 6) {
                alert('Rows and columns must be between 2 and 6!');
                return;
            }

            await saveToDB('settings', { id: 'main', ...settings.value });
            showSettings.value = false;
            resetGame();
        }

        async function clearHistory() {
            if (confirm('Clear all history?')) {
                history.value = [];
                await saveToDB('history', []);
            }
        }

        // ----- Load Data -----
        async function loadSettings() {
            const result = await loadFromDB('settings', 'main');
            if (result) {
                delete result.id;
                settings.value = { ...settings.value, ...result };
            }
        }

        async function loadHistory() {
            const result = await loadFromDB('history');
            if (result && result.length > 0) {
                history.value = result.map(({ id, ...rest }) => rest);
            }
        }

        // ----- Lifecycle -----
        onMounted(async () => {
            await loadSettings();
            await loadHistory();
            initGame();
        });

        // Watch settings changes
        watch([rows, cols, activeColours], () => {
            if (gameStarted.value || gameOver.value) {
                resetGame();
            } else {
                initGame();
            }
        });

        // ----- Return -----
        return {
            // State
            settings,
            showSettings,
            showHistory,
            history,
            grid,
            sequence,
            currentSequenceIndex,
            currentRound,
            gameStarted,
            gameOver,
            totalTime,
            lastRoundTime,
            errorCount,
            availableColours: AVAILABLE_COLOURS,
            
            // Computed
            mode,
            rows,
            cols,
            totalRounds,
            gridStyle,
            
            // Methods
            getColourHex,
            formatTime,
            isColourSelected,
            getSequenceClass,
            getCardClass,
            getCardStyle,
            handleCardClick,
            resetGame,
            nextRound,
            toggleSettings,
            closeSettings,
            toggleHistory,
            closeHistory,
            toggleColour,
            saveSettings,
            clearHistory,
        };
    }
});

app.mount('#app');