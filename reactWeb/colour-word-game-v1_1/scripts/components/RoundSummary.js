import { defineComponent } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { formatTime } from '../gameLogic.js';

export default defineComponent({
    name: 'RoundSummary',
    props: {
        show: Boolean,
        roundSummary: Object,
        currentRound: Number,
        totalRounds: Number,
    },
    emits: ['next-round', 'finish-game'],
    template: `
        <div v-if="show" class="grid-overlay">
            <div class="overlay-content summary-content">
                <h2 class="text-2xl font-bold mb-2">
                    ✅ Round {{ currentRound  + 1 }} Complete!
                </h2>
                <div class="summary-stats">
                    <div class="summary-item">
                        <span class="summary-label">⏱ Time</span>
                        <span class="summary-value">{{ formatTime(roundSummary.time) }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">❌ Errors</span>
                        <span class="summary-value">{{ roundSummary.errors }}</span>
                    </div>
                </div>
                <div class="flex gap-4 justify-center">
                    <button v-if="currentRound < totalRounds" 
                            @click="$emit('next-round')" 
                            class="btn-success">
                        Next Round →
                    </button>
                    <button v-else 
                            @click="$emit('finish-game')" 
                            class="btn-primary">
                        🎉 Finish Game
                    </button>
                </div>
            </div>
        </div>
    `,
    methods: { formatTime },
});
