import { createApp, ref, computed, onMounted, nextTick, watch } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

// Import modules
import { AVAILABLE_COLOURS, DEFAULT_SETTINGS, STORAGE_KEYS } from './config.js';
import { saveToLocalStorage, loadFromLocalStorage } from './storage.js';
import * as gameLogic from './gameLogic.js';

// Import components
import StatsBar from './components/StatsBar.js';
import GameHints from './components/GameHints.js';
import GameGrid from './components/GameGrid.js';
import StartModal from './components/StartModal.js';
import RoundSummary from './components/RoundSummary.js';
import Controls from './components/Controls.js';
import SettingsModal from './components/SettingsModal.js';
import HistoryModal from './components/HistoryModal.js';

const app = createApp({
    components: {
        StatsBar,
        GameHints,
        GameGrid,
        StartModal,
        RoundSummary,
        Controls,
        SettingsModal,
        HistoryModal,
    },
    template: `
        <!-- HEADER -->
        <header class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                🎨 Colour Word Game
            </h1>
            <div class="flex gap-3">
                <button @click="toggleSettings" class="btn-secondary text-sm">
                    ⚙️ Settings
                </button>
                <button @click="toggleHistory" class="btn-secondary text-sm">
                    📊 History
                </button>
            </div>
        </header>

        <!-- STATS -->
        <stats-bar 
            :total-time="totalTime"
            :last-round-time="lastRoundTime"
            :error-count="errorCount"
        />

        <!-- GAME HINTS -->
        <game-hints
            :mode="mode"
            :mode-label="modeLabel"
            :mode-class="modeClass"
            :round-mode-label="roundModeLabel"
            :round-mode-class="roundModeClass"
            :game-started="gameStarted"
            :current-item="currentItem"
            :next-item="nextItem"
            :is-game-complete="isGameComplete"
            :progress-text="progressText"
            :progress-percent="progressPercent"
            :current-round="currentRound"
            :total-rounds="totalRounds"
        />

        <!-- GRID + OVERLAYS -->
        <game-grid
            :grid="grid"
            :game-started="gameStarted"
            :game-over="gameOver"
            :current-sequence-index="currentSequenceIndex"
            :sequence="sequence"
            :grid-style="gridStyle"
            :get-card-class="getCardClass"
            :get-card-style="getCardStyle"
            @card-click="handleCardClick"
        >	
            <!-- Overlays -->
            <start-modal
                :show="showStartModal"
                :is-counting-down="isCountingDown"
                :countdown-value="countdownValue"
                :current-round="currentRound"
                @start-countdown="startCountdown"
            />
            <round-summary
                :show="showRoundSummary"
                :round-summary="roundSummary"
                :current-round="currentRound"
                :total-rounds="totalRounds"
                @next-round="nextRound"
                @finish-game="finishGame"
            />
        </game-grid>

        <!-- CONTROLS -->
        <controls @reset-game="resetGame" />

        <!-- SETTINGS MODAL -->
        <settings-modal
            :show="showSettings"
            :settings="settings"
            @close="closeSettings"
            @save="saveSettings"
            @toggle-colour="toggleColour"
        />

        <!-- HISTORY MODAL -->
        <history-modal
            :show="showHistory"
            :history="history"
            @close="closeHistory"
            @clear-history="clearHistory"
        />
    `,
    setup() {
        // ----- Reactive state -----
        const settings = ref({ ...DEFAULT_SETTINGS });
        const showSettings = ref(false);
        const showHistory = ref(false);
        const history = ref([]);
        const isLoading = ref(true);
        const isInitialLoad = ref(true);

        const grid = ref([]);
        const sequence = ref([]);
        const currentSequenceIndex = ref(0);
        const currentRound = ref(0);
        const gameStarted = ref(false);
        const gameOver = ref(false);

        const totalTime = ref(0);
        const lastRoundTime = ref(0);
        const errorCount = ref(0);
        const roundStartTime = ref(null);
        const totalStartTime = ref(null);

        const showStartModal = ref(false);
        const isCountingDown = ref(false);
        const countdownValue = ref(3);
        const showRoundSummary = ref(false);
        const roundSummary = ref({ time: 0, errors: 0 });

        const currentRoundMode = ref('word'); // actual mode for this round

        // ----- Computed (mode labels) -----
        const mode = computed(() => settings.value.mode);
        const rows = computed(() => settings.value.rows);
        const cols = computed(() => settings.value.cols);
        const totalRounds = computed(() => settings.value.totalRounds);
        const activeColours = computed(() => settings.value.colours);

        const modeLabel = computed(() => {
            const m = mode.value;
            switch (m) {
                case 'word': return '📝 Word';
                case 'colour': return '🎨 Colour';
                case 'math': return '🔢 Math';
                case 'rps': return '🪨 RPS';
                case 'mix': return '🎲 Mix';
                default: return m;
            }
        });

        const modeClass = computed(() => {
            const m = mode.value;
            switch (m) {
                case 'word': return 'mode-word';
                case 'colour': return 'mode-colour';
                case 'math': return 'mode-math';
                case 'rps': return 'mode-rps';
                case 'mix': return 'mode-mix';
                default: return '';
            }
        });

        const roundModeLabel = computed(() => {
            if (mode.value !== 'mix') return '';
            const m = currentRoundMode.value;
            if (m === 'word') return '📝 Match WORD';
            if (m === 'colour') return '🎨 Match COLOUR';
            if (m === 'math') return '🔢 Solve MATH';
            if (m === 'rps') return '🪨 Beat RPS';
            return '';
        });

        const roundModeClass = computed(() => {
            if (mode.value !== 'mix') return '';
            const m = currentRoundMode.value;
            if (m === 'word') return 'mode-word';
            if (m === 'colour') return 'mode-colour';
            if (m === 'math') return 'mode-math';
            if (m === 'rps') return 'mode-rps';
            return '';
        });

        const gridStyle = computed(() => ({
            gridTemplateColumns: `repeat(${cols.value}, 1fr)`,
            maxWidth: Math.min(cols.value * 120, 600) + 'px',
        }));

        // ----- Computed for sequence display (NEW) -----
        const currentItem = computed(() => {
            const idx = currentSequenceIndex.value;
            if (idx < sequence.value.length) {
                const item = sequence.value[idx];
                if (typeof item === 'string') {
                    // word or colour mode
                    return { label: item, color: gameLogic.getColourHex(item) };
                } else if (item.expression !== undefined) {
                    // math mode
                    return { label: item.expression, color: null };
                } else if (item.colour !== undefined && item.symbol !== undefined) {
                    // rps mode
                    const hex = gameLogic.getColourHex(item.colour);
                    const icon = gameLogic.SYMBOL_ICONS ? gameLogic.SYMBOL_ICONS[item.symbol] : '';
                    return { label: `${item.colour} ${item.symbol}`, color: hex };
                }
            }
            return null;
        });

        const nextItem = computed(() => {
            const idx = currentSequenceIndex.value + 1;
            if (idx < sequence.value.length) {
                const item = sequence.value[idx];
                if (typeof item === 'string') {
                    return { label: item, color: gameLogic.getColourHex(item) };
                } else if (item.expression !== undefined) {
                    return { label: item.expression, color: null };
                } else if (item.colour !== undefined && item.symbol !== undefined) {
                    const hex = gameLogic.getColourHex(item.colour);
                    return { label: `${item.colour} ${item.symbol}`, color: hex };
                }
            }
            return null;
        });

        const progressText = computed(() => {
            const total = sequence.value.length;
            const current = Math.min(currentSequenceIndex.value + 1, total);
            return `${current} / ${total}`;
        });

        const progressPercent = computed(() => {
            const total = sequence.value.length;
            if (total === 0) return 0;
            const current = Math.min(currentSequenceIndex.value + 1, total);
            return Math.round((current / total) * 100);
        });

        const isGameComplete = computed(() => {
            return currentSequenceIndex.value >= sequence.value.length && sequence.value.length > 0;
        });

        // ----- Core Game Functions -----
        function initGame() {
            determineRoundMode();
            const modeForRound = currentRoundMode.value;
            sequence.value = gameLogic.generateSequence(modeForRound, activeColours.value, rows.value, cols.value);
            grid.value = gameLogic.generateGridFromSequence(sequence.value, activeColours.value, modeForRound);
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
            const selected = mode.value;
            currentRoundMode.value = gameLogic.determineRoundMode(selected);
        }

        function clearCardFlashes() {
            grid.value.forEach(card => {
                card.flashCorrect = false;
                card.flashWrong = false;
            });
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

        function showRoundStartModal() {
            showStartModal.value = true;
            isCountingDown.value = false;
            countdownValue.value = 3;
        }

        // ----- Card Click Handler (updated for new modes) -----
        function handleCardClick(index) {
            if (!gameStarted.value || gameOver.value || currentSequenceIndex.value >= sequence.value.length) {
                return;
            }

            const card = grid.value[index];
            if (card.matched) return;

            const target = sequence.value[currentSequenceIndex.value];
            let isCorrect = false;
            const mode = currentRoundMode.value;

            if (mode === 'word') {
                isCorrect = card.wordName === target;
            } else if (mode === 'colour') {
                isCorrect = card.bgName === target;
            } else if (mode === 'math') {
                // target is { expression, answer }
                const answer = target.answer;
                isCorrect = parseInt(card.word) === answer;
            } else if (mode === 'rps') {
                // target is { colour, symbol }
                // The correct card must have opposite colour and counter symbol
                const correctColour = gameLogic.getOppositeColour(target.colour);
                const correctSymbol = gameLogic.COUNTER[target.symbol];
                isCorrect = (card.bgName === correctColour && card.wordName === correctSymbol);
            }

            if (isCorrect) {
                card.matched = true;
                card.flashCorrect = true;
                setTimeout(() => { card.flashCorrect = false; }, 300);
                currentSequenceIndex.value++;

                if (currentSequenceIndex.value >= sequence.value.length) {
                    const now = Date.now();
                    const roundDuration = (now - roundStartTime.value) / 1000;
                    lastRoundTime.value = roundDuration;
                    totalTime.value += roundDuration; ;
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
            saveToLocalStorage(STORAGE_KEYS.HISTORY, history.value);
        }

        function nextRound() {
            showRoundSummary.value = false;
            if (currentRound.value < totalRounds.value) {
                determineRoundMode();
                const modeForRound = currentRoundMode.value;
                sequence.value = gameLogic.generateSequence(modeForRound, activeColours.value, rows.value, cols.value);
                grid.value = gameLogic.generateGridFromSequence(sequence.value, activeColours.value, modeForRound);
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
            alert(`🎉 Game Complete!\nTotal Time: ${gameLogic.formatTime(totalTime.value)}\nTotal Errors: ${errorCount.value}`);
            resetGame();
        }

        function resetGame() {
            totalStartTime.value = null;
            currentRound.value = 0;
            initGame();
            totalTime.value = 0;
            lastRoundTime.value = 0;
            errorCount.value = 0;
            showRoundStartModal();
        }

        // ----- Card styling -----
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
            // Always use grey background; for math mode use black text, else colour hex
            const bg = '#e2e8f0';
            let color = card.bgColor; // default for word/colour/rps
            if (currentRoundMode.value === 'math') {
                color = '#1e293b'; // dark grey/black for math
            }
            return { backgroundColor: bg, color };
        }

        // ----- Settings & History (unchanged) -----
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
                showSettings.value = false;
                resetGame();
            } else {
                alert('Failed to save settings!');
            }
        }

        function clearHistory() {
            if (confirm('Clear all history?')) {
                history.value = [];
                saveToLocalStorage(STORAGE_KEYS.HISTORY, []);
            }
        }

        function loadSettings() {
            const result = loadFromLocalStorage(STORAGE_KEYS.SETTINGS);
            if (result) {
                settings.value = { ...DEFAULT_SETTINGS, ...result };
            }
        }

        function loadHistory() {
            const result = loadFromLocalStorage(STORAGE_KEYS.HISTORY);
            if (result && result.length > 0) {
                history.value = result;
            }
        }

        // Lifecycle
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

        // Return
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
            currentItem,
            nextItem,
            progressText,
            progressPercent,
            isGameComplete,
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
