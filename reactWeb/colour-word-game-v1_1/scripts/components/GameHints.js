import { defineComponent } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

export default defineComponent({
    name: 'GameHints',
    props: {
        mode: String,
        modeLabel: String,
        modeClass: String,
        roundModeLabel: String,
        roundModeClass: String,
        gameStarted: Boolean,
        currentItem: String,
        nextItem: String,
        isGameComplete: Boolean,
        progressText: String,
        progressPercent: Number,
        currentRound: Number,
        totalRounds: Number,
        getColourHex: Function,
    },
    template: `
        <div class="game-hints">
            <div class="hints-content">
                <!-- Mode Badge -->
                <div class="mode-badge">
                    <span class="hints-label">Mode:</span>
                    <span class="mode-indicator" :class="modeClass">
                        {{ modeLabel }}
                    </span>
                    <span v-if="mode === 'both' && gameStarted" 
                          class="mode-indicator ml-2" 
                          :class="roundModeClass">
                        {{ roundModeLabel }}
                    </span>
                </div>

                <!-- Sequence Display -->
                <div class="sequence-display">
                    <div class="sequence-target">
                        <span class="sequence-label">🎯</span>
                        <span v-if="currentItem && !isGameComplete" 
                              class="sequence-current"
                              :style="{ color: getColourHex(currentItem) }">
                            {{ currentItem }}
                        </span>
                        <span v-else-if="isGameComplete" class="sequence-done">
                            ✅ Complete!
                        </span>
                        <span v-else class="sequence-placeholder">—</span>

                        <span v-if="nextItem && !isGameComplete" class="sequence-arrow">→</span>
                        <span v-if="nextItem && !isGameComplete" 
                              class="sequence-next"
                              :style="{ color: getColourHex(nextItem) }">
                            {{ nextItem }}
                        </span>
                    </div>

                    <div class="sequence-progress">
                        <span class="progress-text">{{ progressText }}</span>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" 
                                 :style="{ width: progressPercent + '%' }"></div>
                        </div>
                    </div>
                </div>

                <div class="round-info">
                    Round {{ currentRound }} / {{ totalRounds }}
                </div>
            </div>
        </div>
    `,
});