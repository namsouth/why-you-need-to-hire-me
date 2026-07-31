import { defineComponent } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { AVAILABLE_COLOURS } from '../config.js';
import { isColourSelected } from '../gameLogic.js';

export default defineComponent({
    name: 'SettingsModal',
    props: {
        show: Boolean,
        settings: Object,
    },
    emits: ['close', 'save', 'toggle-colour'],
    template: `
        <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">⚙️ Settings</h2>
                    <button @click="$emit('close')" class="modal-close">✕</button>
                </div>
                
                <div class="modal-body">
                    <!-- Mode -->
                    <div class="setting-group">
                        <span>v1.1</span>
                    </div>
                    <!-- Mode -->
                    <div class="setting-group">
                        <label class="setting-label">Game Mode</label>
                        <select v-model="settings.mode" class="setting-input">
                            <option value="word">Word Mode (match the word)</option>
                            <option value="colour">Colour Mode (match the background)</option>
                            <option value="both">Both (random each round)</option>
                        </select>
                    </div>

                    <!-- Colours -->
                    <div class="setting-group">
                        <label class="setting-label">Colours (click to toggle)</label>
                        <div class="colour-picker">
                            <div v-for="color in availableColours" :key="color.name"
                                 class="colour-swatch"
                                 :style="{ backgroundColor: color.hex }"
                                 :class="{ 'colour-active': isColourSelected(settings.colours, color.name), 'colour-inactive': !isColourSelected(settings.colours, color.name) }"
                                 @click="$emit('toggle-colour', color.name)">
                            </div>
                        </div>
                        <div class="setting-hint">Select at least 2 colours</div>
                    </div>

                    <!-- Grid size -->
                    <div class="setting-row">
                        <div class="setting-group">
                            <label class="setting-label">Rows (M)</label>
                            <input type="number" v-model.number="settings.rows" min="2" max="6" class="setting-input">
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Columns (N)</label>
                            <input type="number" v-model.number="settings.cols" min="2" max="6" class="setting-input">
                        </div>
                    </div>

                    <!-- Rounds -->
                    <div class="setting-group">
                        <label class="setting-label">Total Rounds</label>
                        <input type="number" v-model.number="settings.totalRounds" min="1" max="20" class="setting-input">
                    </div>

                    <button @click="$emit('save')" class="btn-primary btn-full">
                        💾 Save Settings & Restart
                    </button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            availableColours: AVAILABLE_COLOURS,
        };
    },
    methods: {
        isColourSelected,
    },
});