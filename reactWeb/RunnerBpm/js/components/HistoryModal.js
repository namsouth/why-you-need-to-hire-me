const HistoryModal = Vue.defineComponent({
  name: 'HistoryModal',
  props: {
    visible: { type: Boolean, default: false },
    history: { type: Array, default: () => [] }
  },
  emits: ['close', 'delete', 'clear'],
  setup(props, { emit }) {
    function formatDuration(sec) {
      return TimeUtils.formatMMSS(sec);
    }
    function formatDate(iso) {
      return new Date(iso).toLocaleString();
    }
    return { formatDuration, formatDate };
  },
  template: `
    <div v-if="visible" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-xl">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-lg font-semibold">History</h2>
          <button @click="$emit('close')" class="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="history.length === 0" class="text-center text-slate-500 py-10">
            No sessions yet
          </div>
          <div v-else class="space-y-3">
            <div v-for="item in history" :key="item.id"
              class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-medium">{{ formatDate(item.date) }}</div>
                  <div class="text-sm text-slate-500 mt-1">
                    {{ formatDuration(item.durationSeconds) }} · {{ item.totalSteps }} steps · {{ Math.round(item.averageBpm) }} bpm
                  </div>
                </div>
                <button @click="$emit('delete', item.id)"
                  class="text-red-500 hover:text-red-600 p-1">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          <button v-if="history.length" @click="$emit('clear')"
            class="flex-1 py-2.5 rounded-lg text-red-600 border border-red-300 dark:border-red-800 text-sm">
            Clear All
          </button>
          <button @click="$emit('close')"
            class="flex-1 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  `
});