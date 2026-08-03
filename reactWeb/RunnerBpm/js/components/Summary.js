const Summary = Vue.defineComponent({
  name: 'Summary',
  props: {
    elapsedSeconds: { type: Number, default: 0 },
    totalSteps: { type: Number, default: 0 },
    startTimestamp: { type: Number, default: null } // ms since epoch, null = not started
  },
  setup(props) {
    const now = Vue.ref(new Date());
    let clockTimer = null;

    Vue.onMounted(() => {
      clockTimer = setInterval(() => {
        now.value = new Date();
      }, 1000);
    });

    Vue.onUnmounted(() => {
      if (clockTimer) clearInterval(clockTimer);
    });

    const timeDisplay = Vue.computed(() => TimeUtils.formatMMSS(props.elapsedSeconds));

    // Format HH:MM
    function formatHM(date) {
      if (!date) return '--:--';
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    }

    const startDisplay = Vue.computed(() => {
      if (!props.startTimestamp) return '--:--';
      return formatHM(new Date(props.startTimestamp));
    });

    const endDisplay = Vue.computed(() => {
      // always live current time
      return formatHM(now.value);
    });

    return { timeDisplay, startDisplay, endDisplay };
  },
  template: `
    <section class="grid grid-cols-3 gap-2 px-4 py-4">
      <!-- Time Used -->
      <div class="text-center">
        <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Time Used</div>
        <div class="text-2xl sm:text-3xl font-bold tabular-nums mt-1">{{ timeDisplay }}</div>
      </div>

      <!-- Steps -->
      <div class="text-center">
        <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Steps</div>
        <div class="text-2xl sm:text-3xl font-bold tabular-nums mt-1">{{ totalSteps }}</div>
      </div>

      <!-- Start / End -->
      <div class="text-center">
        <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Start / End</div>
        <div class="text-lg sm:text-xl font-bold tabular-nums mt-1 leading-tight">
          <div>{{ startDisplay }}</div>
          <div class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ endDisplay }}</div>
        </div>
      </div>
    </section>
  `
});