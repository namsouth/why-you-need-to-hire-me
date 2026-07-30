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
// LOCALSTORAGE HELPERS
// ========================================

const STORAGE_KEYS = {
    SETTINGS: 'colourWordGame_settings',
    HISTORY: 'colourWordGame_history',
};

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`✅ Saved to localStorage: ${key}`);
        return true;
    } catch (e) {
        console.error(`Failed to save to localStorage (${key}):`, e);
        return false;
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch (e) {
        console.error(`Failed to load from localStorage (${key}):`, e);
        return null;
    }
}

// ========================================
// VUE APP
// ========================================

const { createApp, ref, computed, watch, onMounted, nextTick } = Vue;

const app = createApp({
    setup() {
        // ----- Reactive State -----
        const settings = ref({ ...DEFAULT_SETTINGS });
        const showSettings = ref(false);
        const showHistory = ref(false);
        const history = ref([]);
        const saveStatus = ref('');
        const isLoading = ref(true);
        const isInitialLoad = ref(true);

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

        // Modal / Countdown
        const showStartModal = ref(false);
        const isCountingDown = ref(false);
        const countdownValue = ref(3);
        const showRoundSummary = ref(false);
        const roundSummary = ref({ time: 0, errors: 0 });

        // Current round matching mode (for 'both' setting)
        const currentRoundMode = ref('word');

        // ----- Computed Properties -----
        const mode = computed(() => settings.value.mode);
        const rows = computed(() => settings.value.rows);
        const cols = computed(() => settings.value.cols);
        const totalRounds = computed(() => settings.value.totalRounds);
        const activeColours = computed(() => settings.value.colours);

        const modeLabel = computed(() => {
            const m = mode.value;
            if (m === 'word') return '📝 Word';
            if (m === 'colour') return '🎨 Colour';
            return '🔀 Both';
        });

        const modeClass = computed(() => {
            const m = mode.value;
            if (m === 'word') return 'mode-word';
            if (m === 'colour') return 'mode-colour';
            return 'mode-both';
        });

        const roundModeLabel = computed(() => {
            if (mode.value !== 'both') return '';
            return currentRoundMode.value === 'word' ? '📝 Match WORD' : '🎨 Match COLOUR';
        });

        const roundModeClass = computed(() => {
            if (mode.value !== 'both') return '';
            return currentRoundMode.value === 'word' ? 'mode-word' : 'mode-colour';
        });

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

        function getDifferentColourName(exclude) {
            const colours = activeColours.value.filter(c => c !== exclude);
            if (colours.length === 0) return exclude;
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

        function getSequenceColour(item) {
            return getColourHex(item);
        }

        function getCardClass(idx) {
            const card = grid.value[idx];
            if (!card) return '';
            const classes = [];
            if (gameOver.value || !gameStarted.value || currentSequenceIndex.value >= sequence.value.length) {
                classes.push('disabled');
            }
            if (card.matched) classes.push('matched');
            if (card.flashCorrect) classes.push('correct');
            if (card.flashWrong) classes.push('wrong');
            return classes.join(' ');
        }

        function getCardStyle(card) {
            return {
                backgroundColor: card.bgColor,
                color: '#ffffff',
            };
        }

        function clearCardFlashes() {
            grid.value.forEach(card => {
                card.flashCorrect = false;
                card.flashWrong = false;
            });
        }

        function showSaveFeedback(message, isSuccess = true) {
            saveStatus.value = message;
            setTimeout(() => {
                saveStatus.value = '';
            }, 3000);
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

        function generateGridFromSequence(seq) {
            const total = seq.length;
            const newGrid = [];
            
            for (let i = 0; i < total; i++) {
                const targetColour = seq[i];
                let bgColour, wordColour;
                
                if (currentRoundMode.value === 'word') {
                    wordColour = targetColour;
                    bgColour = getDifferentColourName(wordColour);
                    if (!bgColour) bgColour = wordColour;
                } else {
                    bgColour = targetColour;
                    wordColour = getDifferentColourName(bgColour);
                    if (!wordColour) wordColour = bgColour;
                }
                
                newGrid.push({
                    bgColor: getColourHex(bgColour),
                    textColor: '#ffffff',
                    word: wordColour,
                    bgName: bgColour,
                    wordName: wordColour,
                    target: targetColour,
                    sequenceIndex: i,
                    flashCorrect: false,
                    flashWrong: false,
                    matched: false,
                });
            }
            
            return shuffleArray(newGrid);
        }

        function initGame() {
            determineRoundMode();
            sequence.value = generateSequence();
            grid.value = generateGridFromSequence(sequence.value);
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
            showStartModal.value = false;
            showRoundSummary.value = false;
            isCountingDown.value = false;
        }

        function determineRoundMode() {
            if (mode.value === 'both') {
                currentRoundMode.value = Math.random() < 0.5 ? 'word' : 'colour';
            } else {
                currentRoundMode.value = mode.value;
            }
        }

        // ----- Countdown & Round Start -----
        function startCountdown() {
            isCountingDown.value = true;
            countdownValue.value = 3;
            const interval = setInterval(() => {
                countdownValue.value -= 1;
                if (countdownValue.value === 0) {
                    clearInterval(interval);
                    isCountingDown.value = false;
                    showStartModal.value = false;
                    beginRound();
                }
            }, 700);
        }

        function beginRound() {
            grid.value.forEach(c => { 
                c.matched = false; 
                c.flashCorrect = false; 
                c.flashWrong = false; 
            });
            currentSequenceIndex.value = 0;
            gameOver.value = false;
            gameStarted.value = true;
            roundStartTime.value = Date.now();
            if (!totalStartTime.value) {
                totalStartTime.value = Date.now();
            }
        }

        function showRoundStartModal() {
            showStartModal.value = true;
            isCountingDown.value = false;
            countdownValue.value = 3;
        }

        // ----- Card Click -----
        function handleCardClick(index) {
            if (!gameStarted.value || gameOver.value || currentSequenceIndex.value >= sequence.value.length) {
                return;
            }

            const card = grid.value[index];
            if (card.matched) return;

            const target = sequence.value[currentSequenceIndex.value];
            let isCorrect = false;

            if (currentRoundMode.value === 'word') {
                isCorrect = card.wordName === target;
            } else {
                isCorrect = card.bgName === target;
            }

            if (isCorrect) {
                card.matched = true;
                card.flashCorrect = true;
                setTimeout(() => { card.flashCorrect = false; }, 300);
                currentSequenceIndex.value++;

                if (currentSequenceIndex.value >= sequence.value.length) {
                    const now = Date.now();
                    lastRoundTime.value = (now - roundStartTime.value) / 1000;
                    totalTime.value = (now - totalStartTime.value) / 1000;
                    gameOver.value = true;
                    gameStarted.value = false;
                    currentRound.value++;
                    roundSummary.value = {
                        time: lastRoundTime.value,
                        errors: errorCount.value,
                    };
                    showRoundSummary.value = true;
                    saveRoundHistory();
                }
            } else {
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
            const saved = saveToLocalStorage(STORAGE_KEYS.HISTORY, history.value);
            if (saved) {
                console.log('✅ History saved to localStorage');
            } else {
                console.warn('⚠️ Failed to save history');
            }
        }

        // ----- Next Round / Finish -----
        function nextRound() {
            showRoundSummary.value = false;
            if (currentRound.value < totalRounds.value) {
                determineRoundMode();
                sequence.value = generateSequence();
                grid.value = generateGridFromSequence(sequence.value);
                grid.value.forEach(c => { 
                    c.matched = false; 
                    c.flashCorrect = false; 
                    c.flashWrong = false; 
                });
                currentSequenceIndex.value = 0;
                gameOver.value = false;
                gameStarted.value = false;
                showRoundStartModal();
            } else {
                finishGame();
            }
        }

        function finishGame() {
            showRoundSummary.value = false;
            alert(`🎉 Game Complete!\nTotal Time: ${formatTime(totalTime.value)}\nTotal Errors: ${errorCount.value}`);
            resetGame();
        }

        // ----- Reset -----
        function resetGame() {
            totalStartTime.value = null;
            currentRound.value = 0;
            initGame();
            totalTime.value = 0;
            lastRoundTime.value = 0;
            errorCount.value = 0;
            showRoundStartModal();
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

        function saveSettings() {
            if (settings.value.colours.length < 2) {
                alert('Please select at least 2 colours!');
                return;
            }
            if (settings.value.rows < 2 || settings.value.rows > 6 || 
                settings.value.cols < 2 || settings.value.cols > 6) {
                alert('Rows and columns must be between 2 and 6!');
                return;
            }

            const saved = saveToLocalStorage(STORAGE_KEYS.SETTINGS, settings.value);
            if (saved) {
                showSaveFeedback('✅ Settings saved successfully!');
                showSettings.value = false;
                resetGame();
            } else {
                showSaveFeedback('❌ Failed to save settings!', false);
            }
        }

        function clearHistory() {
            if (confirm('Clear all history?')) {
                history.value = [];
                const saved = saveToLocalStorage(STORAGE_KEYS.HISTORY, []);
                if (saved) {
                    showSaveFeedback('✅ History cleared successfully!');
                } else {
                    showSaveFeedback('❌ Failed to clear history!', false);
                }
            }
        }

        // ----- Load Data -----
        function loadSettings() {
            const result = loadFromLocalStorage(STORAGE_KEYS.SETTINGS);
            if (result) {
                settings.value = { ...DEFAULT_SETTINGS, ...result };
                console.log('✅ Settings loaded from localStorage:', settings.value);
                return true;
            } else {
                console.log('ℹ️ No saved settings found, using defaults');
                return false;
            }
        }

        function loadHistory() {
            const result = loadFromLocalStorage(STORAGE_KEYS.HISTORY);
            if (result && result.length > 0) {
                history.value = result;
                console.log(`✅ Loaded ${history.value.length} history entries from localStorage`);
                return true;
            } else {
                console.log('ℹ️ No history found in localStorage');
                return false;
            }
        }

        // ----- Lifecycle -----
        onMounted(async () => {
            console.log('🎮 Colour Word Game - Loading...');
            isLoading.value = true;
            isInitialLoad.value = true;
            
            try {
                loadSettings();
                loadHistory();
                initGame();
                await nextTick();
                showRoundStartModal();
                console.log('✅ Game ready with loaded settings!');
            } catch (error) {
                console.error('❌ Error loading game data:', error);
                settings.value = { ...DEFAULT_SETTINGS };
                initGame();
                await nextTick();
                showRoundStartModal();
            } finally {
                isLoading.value = false;
                setTimeout(() => {
                    isInitialLoad.value = false;
                }, 100);
            }
        });

        // Watch settings changes - skip during initial load
        watch([rows, cols, activeColours], () => {
            if (isLoading.value || isInitialLoad.value) {
                console.log('⏳ Skipping watch during initial load');
                return;
            }
            
            console.log('🔄 Settings changed, resetting game');
            if (gameStarted.value || gameOver.value || showStartModal.value) {
                resetGame();
            } else {
                initGame();
                showRoundStartModal();
            }
        });

        // ----- Return -----
        return {
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
            saveStatus,
            isLoading,
            
            showStartModal,
            isCountingDown,
            countdownValue,
            showRoundSummary,
            roundSummary,
            currentRoundMode,
            
            mode,
            modeLabel,
            modeClass,
            roundModeLabel,
            roundModeClass,
            rows,
            cols,
            totalRounds,
            gridStyle,
            
            getColourHex,
            getSequenceColour,
            formatTime,
            isColourSelected,
            getSequenceClass,
            getCardClass,
            getCardStyle,
            handleCardClick,
            resetGame,
            startCountdown,
            nextRound,
            finishGame,
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
