import { defineComponent } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

export default defineComponent({
    name: 'StartModal',
    props: {
        show: Boolean,
        isCountingDown: Boolean,
        countdownValue: Number,
        currentRound: Number,
    },
    emits: ['start-countdown'],
    template: `
        <div v-if="show" class="grid-overlay">
            <div class="overlay-content">
                <div v-if="isCountingDown" class="countdown-number">
                    {{ countdownValue }}
                </div>
                <div v-else>
                    <h2 class="text-2xl font-bold mb-4">
                        🎯 Round {{ currentRound }}
                    </h2>
                    <button @click="$emit('start-countdown')" class="btn-primary">
                        Start Round
                    </button>
                </div>
            </div>
        </div>
    `,
});