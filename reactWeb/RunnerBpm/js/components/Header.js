const Header = Vue.defineComponent({
  name: 'Header',
  props: {
    title: { type: String, default: 'Cadence Trainer' }
  },
  emits: ['open-settings'],
  setup(props, { emit }) {
    const now = Vue.ref(new Date());
    let timer = null;

    Vue.onMounted(() => {
      timer = setInterval(() => {
        now.value = new Date();
      }, 1000);
    });

    Vue.onUnmounted(() => {
      if (timer) clearInterval(timer);
    });

    const formatted = Vue.computed(() => TimeUtils.formatDateTime(now.value));

    return { formatted };
  },
  template: `
    <header class="flex items-center justify-between px-3 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b border-slate-200 dark:border-slate-700 text-sm">
      <div class="flex items-center gap-2 font-bold text-primary-600 dark:text-primary-500">
        <i class="fa-solid fa-person-running"></i>
        <span>RunnerBpm</span>
      </div>
      <div class="text-slate-500 dark:text-slate-400 text-xs hidden sm:block">
        {{ title }}
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-slate-500 dark:text-slate-400">{{ formatted }}</span>
        <button
          @click="$emit('open-settings')"
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          title="Settings"
        >
          <i class="fa-solid fa-gear"></i>
        </button>
      </div>
    </header>
  `
});