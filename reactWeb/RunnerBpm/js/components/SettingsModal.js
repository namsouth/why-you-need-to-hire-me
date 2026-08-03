const SettingsModal = Vue.defineComponent({
  name: 'SettingsModal',
  props: {
    visible: { type: Boolean, default: false },
    settings: { type: Object, required: true }
  },
  emits: ['close', 'save', 'open-history', 'export', 'import'],
  setup(props, { emit }) {
    const local = Vue.reactive({ ...props.settings });

    Vue.watch(() => props.visible, (v) => {
      if (v) Object.assign(local, props.settings);
    });

    const presets = [
      { label: 'A4', hz: 440 },
      { label: 'C5', hz: 523.25 },
      { label: 'E5', hz: 659.25 },
      { label: 'G5', hz: 783.99 },
      { label: 'A5', hz: 880 }
    ];

    function save() {
      emit('save', { ...local });
      emit('close');
    }

    function onFileChange(e) {
      const file = e.target.files[0];
      if (file) emit('import', file);
      e.target.value = '';
    }

    return { local, presets, save, onFileChange };
  },
  template: `
    <div v-if="visible" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-lg font-semibold">Settings</h2>
          <button @click="$emit('close')" class="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="p-5 space-y-5">
          <!-- Target BPM -->
          <div>
            <label class="block text-sm font-medium mb-1">Target BPM</label>
            <input type="number" v-model.number="local.targetBpm" min="10" max="220"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" />
          </div>

          <!-- Sound -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Sound</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="local.soundEnabled" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <!-- Volume -->
          <div>
            <label class="block text-sm font-medium mb-1">Volume ({{ local.volume }}%)</label>
            <input type="range" v-model.number="local.volume" min="0" max="100"
              class="w-full" />
          </div>

          <!-- Left Foot Tone -->
          <div>
            <label class="block text-sm font-medium mb-1">Left Foot Tone (Hz)</label>
            <input type="number" v-model.number="local.leftFootTone" min="100" max="2000" step="0.01"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 mb-2" />
            <div class="flex flex-wrap gap-2">
              <button v-for="p in presets" :key="'L'+p.hz"
                @click="local.leftFootTone = p.hz"
                class="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                {{ p.label }}
              </button>
            </div>
          </div>

          <!-- Right Foot Tone -->
          <div>
            <label class="block text-sm font-medium mb-1">Right Foot Tone (Hz)</label>
            <input type="number" v-model.number="local.rightFootTone" min="100" max="2000" step="0.01"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 mb-2" />
            <div class="flex flex-wrap gap-2">
              <button v-for="p in presets" :key="'R'+p.hz"
                @click="local.rightFootTone = p.hz"
                class="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                {{ p.label }}
              </button>
            </div>
          </div>

          <!-- Vibration -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Vibration (Start & Finish only)</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="local.vibration" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <!-- Dark Mode -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Dark Mode</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="local.darkMode" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <!-- Targets -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">Target Steps (0=off)</label>
              <input type="number" v-model.number="local.targetSteps" min="0"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Target Time min (0=off)</label>
              <input type="number" v-model.number="local.targetTimeMinutes" min="0"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" />
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-2 space-y-2">
            <button @click="$emit('open-history')"
              class="w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium">
              <i class="fa-solid fa-clock-rotate-left mr-2"></i> History
            </button>
            <button @click="$emit('export')"
              class="w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium">
              <i class="fa-solid fa-download mr-2"></i> Export JSON
            </button>
            <label class="w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium flex items-center justify-center cursor-pointer">
              <i class="fa-solid fa-upload mr-2"></i> Import JSON
              <input type="file" accept=".json,application/json" class="hidden" @change="onFileChange" />
            </label>
          </div>
        </div>

        <div class="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          <button @click="$emit('close')"
            class="flex-1 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm">
            Cancel
          </button>
          <button @click="save"
            class="flex-1 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium">
            Save
          </button>
        </div>
      </div>
    </div>
  `
});