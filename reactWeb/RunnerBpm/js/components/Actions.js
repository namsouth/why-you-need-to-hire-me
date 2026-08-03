const Actions = Vue.defineComponent({
  name: 'Actions',
  props: {
    isRunning: { type: Boolean, default: false },
    isCountingDown: { type: Boolean, default: false }
  },
  emits: ['play', 'pause', 'finish'],
  template: `
    <section class="flex justify-center gap-6 px-4 py-6">
      <button
        v-if="!isRunning && !isCountingDown"
        @click="$emit('play')"
        class="w-20 h-20 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-3xl shadow-lg flex items-center justify-center transition active:scale-95"
      >
        <i class="fa-solid fa-play ml-1"></i>
      </button>

      <button
        v-else-if="isRunning"
        @click="$emit('pause')"
        class="w-20 h-20 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-3xl shadow-lg flex items-center justify-center transition active:scale-95"
      >
        <i class="fa-solid fa-pause"></i>
      </button>

      <button
        v-else
        disabled
        class="w-20 h-20 rounded-full bg-slate-400 text-white text-3xl shadow-lg flex items-center justify-center opacity-60"
      >
        <i class="fa-solid fa-spinner fa-spin"></i>
      </button>

      <button
        @click="$emit('finish')"
        class="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xl shadow flex items-center justify-center transition active:scale-95"
        title="Finish"
      >
        <i class="fa-solid fa-flag-checkered"></i>
      </button>
    </section>
  `
});