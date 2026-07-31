import { defineComponent } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

export default defineComponent({
    name: 'GameGrid',
    props: {
        grid: Array,
        gameStarted: Boolean,
        gameOver: Boolean,
        currentSequenceIndex: Number,
        sequence: Array,
        gridStyle: Object,
        getCardClass: Function,
        getCardStyle: Function,
    },
    emits: ['card-click'],
    template: `
        <div class="grid-container">
            <div class="game-grid" :style="gridStyle">
                <div v-for="(card, idx) in grid" :key="idx"
                     class="card"
                     :class="getCardClass(idx)"
                     :style="getCardStyle(card)"
                     @click="$emit('card-click', idx)">
                    <span class="word-text">{{ card.word }}</span>
                </div>
            </div>
            <!-- Overlays are now separate components, rendered outside -->
            <slot></slot>
        </div>
    `,
});