import { defineComponent } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

export default defineComponent({
    name: 'Controls',
    emits: ['reset-game'],
    template: `
        <div class="controls">
            <button @click="$emit('reset-game')" class="btn-primary">
                🔄 New Game
            </button>
        </div>
    `,
});