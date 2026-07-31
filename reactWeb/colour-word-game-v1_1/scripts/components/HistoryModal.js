import { defineComponent } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { formatTime } from '../gameLogic.js';

export default defineComponent({
    name: 'HistoryModal',
    props: {
        show: Boolean,
        history: Array,
    },
    emits: ['close', 'clear-history'],
    template: `
        <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-content modal-wide">
                <div class="modal-header">
                    <h2 class="modal-title">📊 Score History</h2>
                    <button @click="$emit('close')" class="modal-close">✕</button>
                </div>
                
                <div class="modal-body history-body">
                    <div v-if="history.length === 0" class="history-empty">
                        No history yet. Play a game to see records!
                    </div>
                    <div v-for="(entry, idx) in history" :key="idx" class="history-item">
                        <div class="history-info">
                            <div class="history-mode">{{ entry.mode }} mode</div>
                            <div class="history-date">{{ entry.date }}</div>
                        </div>
                        <div class="history-stats">
                            <div>⏱ {{ formatTime(entry.totalTime) }}</div>
                            <div>❌ {{ entry.errors }} errors</div>
                            <div class="history-grid">{{ entry.rows }}×{{ entry.cols }} • {{ entry.rounds }} rounds</div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button v-if="history.length > 0" @click="$emit('clear-history')" class="btn-danger">
                        🗑️ Clear History
                    </button>
                </div>
            </div>
        </div>
    `,
    methods: { formatTime }
});