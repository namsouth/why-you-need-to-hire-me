const Feet = Vue.defineComponent({
  name: 'Feet',
  props: {
    activeFoot: { type: String, default: null } // 'left' | 'right' | null
  },
  template: `
    <section class="flex justify-center items-center gap-12 sm:gap-20 py-8">
      <!-- Left -->
      <div class="flex flex-col items-center gap-2">
        <div
          class="text-6xl sm:text-7xl transition-all duration-100"
          :class="activeFoot === 'left' ? 'foot-active text-blue-500' : 'foot-inactive text-slate-400 dark:text-slate-600'"
        >
          <i class="fa-solid fa-shoe-prints fa-flip-horizontal"></i>
        </div>
        <span class="text-sm font-medium" :class="activeFoot === 'left' ? 'text-blue-500' : 'text-slate-400'">Left</span>
      </div>

      <!-- Right -->
      <div class="flex flex-col items-center gap-2">
        <div
          class="text-6xl sm:text-7xl transition-all duration-100"
          :class="activeFoot === 'right' ? 'foot-active text-emerald-500' : 'foot-inactive text-slate-400 dark:text-slate-600'"
        >
          <i class="fa-solid fa-shoe-prints"></i>
        </div>
        <span class="text-sm font-medium" :class="activeFoot === 'right' ? 'text-emerald-500' : 'text-slate-400'">Right</span>
      </div>
    </section>
  `
});