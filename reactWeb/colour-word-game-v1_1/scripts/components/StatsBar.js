import { defineComponent } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { formatTime } from '../gameLogic.js';

export default defineComponent({
    name: 'StatsBar',
    props: {
        totalTime: Number,
        lastRoundTime: Number,
        errorCount: Number,
    },
    template: `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">⏱ Total Time</div>
                <div class="stat-value">{{ formatTime(totalTime) }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">🔄 Last Round</div>
                <div class="stat-value">{{ formatTime(lastRoundTime) }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">❌ Errors</div>
                <div class="stat-value">{{ errorCount }}</div>
            </div>
        </div>
    `,
    methods: { formatTime }
});