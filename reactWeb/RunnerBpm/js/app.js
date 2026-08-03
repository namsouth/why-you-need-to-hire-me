const { createApp, ref, reactive, computed, onMounted, onUnmounted, watch } = Vue;

const App = {
  components: {
    Header,
    Summary,
    Feet,
    Actions,
    SettingsModal,
    HistoryModal,
    Footer
  },
  setup() {
    // ---------- State ----------
    const settings = reactive(SettingsModel.load());
    const history = ref(HistoryModel.load());

    const isRunning = ref(false);
    const isCountingDown = ref(false);
    const countdownValue = ref(0);
    const activeFoot = ref(null);
    const totalSteps = ref(0);
    const elapsedSeconds = ref(0);
    const sessionStartTime = ref(null);
    const showSettings = ref(false);
    const showHistory = ref(false);
    const showFinishConfirm = ref(false);
    const showTargetBanner = ref(false);
    const targetBannerText = ref('');
    const sessionStartTimestamp = ref(null); // ms

    let elapsedTimer = null;
    let countdownTimer = null;

    // Live BPM calculation (steps per minute based on elapsed time)
    const currentBpm = computed(() => {
      if (elapsedSeconds.value < 1) return 0;
      return (totalSteps.value / elapsedSeconds.value) * 60;
    });

    // ---------- Dark mode ----------
    function applyTheme() {
      TailwindHelper.applyDarkMode(settings.darkMode);
    }
    applyTheme();

    // ---------- Vibration helper ----------
    function vibrate(pattern = 200) {
      if (settings.vibration && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    }

    // ---------- Metronome beat handler ----------
    function onBeat({ foot }) {
      activeFoot.value = foot;
      totalSteps.value += 1;

      // Check targets
      if (settings.targetSteps > 0 && totalSteps.value >= settings.targetSteps) {
        pause();
        showTargetReached('Target steps reached!');
      }
      if (settings.targetTimeMinutes > 0 && elapsedSeconds.value >= settings.targetTimeMinutes * 60) {
        pause();
        showTargetReached('Target time reached!');
      }
    }

    function showTargetReached(msg) {
      targetBannerText.value = msg;
      showTargetBanner.value = true;
      setTimeout(() => { showTargetBanner.value = false; }, 4000);
    }

    // ---------- Elapsed time ----------
    function startElapsedTimer() {
      stopElapsedTimer();
      sessionStartTime.value = Date.now() - elapsedSeconds.value * 1000;
      elapsedTimer = setInterval(() => {
        elapsedSeconds.value = Math.floor((Date.now() - sessionStartTime.value) / 1000);
      }, 250);
    }

    function stopElapsedTimer() {
      if (elapsedTimer) {
        clearInterval(elapsedTimer);
        elapsedTimer = null;
      }
    }

    // ---------- Play / Pause / Finish ----------
    function play() {
      if (isCountingDown.value || isRunning.value) return;

      // Resume audio context on user gesture
      AudioService.init();
      AudioService.setVolume(settings.volume);

      isCountingDown.value = true;
      countdownValue.value = 3;

      countdownTimer = setInterval(() => {
        countdownValue.value -= 1;
        if (countdownValue.value <= 0) {
          clearInterval(countdownTimer);
          countdownTimer = null;
          isCountingDown.value = false;
          startSession();
        }
      }, 1000);
    }

    function startSession() {
      isRunning.value = true;
      activeFoot.value = 'left';
      sessionStartTimestamp.value = Date.now();   // ← add this line

      // Force audio to wake up
      AudioService.resume();
      AudioService.setVolume(settings.volume);
      
      vibrate(150);
      MetronomeService.start({ ...settings }, onBeat);
      startElapsedTimer();
    }

    function pause() {
      isRunning.value = false;
      MetronomeService.stop();
      stopElapsedTimer();
      activeFoot.value = null;
    }

    function requestFinish() {
      if (totalSteps.value === 0 && elapsedSeconds.value === 0) {
        // nothing to save
        resetSession();
        return;
      }
      showFinishConfirm.value = true;
    }

    function confirmFinish() {
      showFinishConfirm.value = false;
      pause();
      vibrate([100, 50, 100]);

      // Save to history
      const avgBpm = elapsedSeconds.value > 0
        ? (totalSteps.value / elapsedSeconds.value) * 60
        : settings.targetBpm;

      const session = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        date: TimeUtils.nowISO(),
        durationSeconds: elapsedSeconds.value,
        totalSteps: totalSteps.value,
        targetBpm: settings.targetBpm,
        averageBpm: Math.round(avgBpm * 10) / 10,
        notes: ''
      };

      history.value = HistoryModel.add(session);
      resetSession();
    }

    function resetSession() {
      totalSteps.value = 0;
      elapsedSeconds.value = 0;
      activeFoot.value = null;
      sessionStartTime.value = null;
      sessionStartTimestamp.value = null;   // ← add this line
    }

    // ---------- Settings ----------
    function saveSettings(newSettings) {
      Object.assign(settings, newSettings);
      SettingsModel.save(settings);
      AudioService.setVolume(settings.volume);
      applyTheme();

      if (isRunning.value) {
        MetronomeService.updateSettings({ ...settings });
      }
    }

    // ---------- History ----------
    function deleteHistoryItem(id) {
      history.value = HistoryModel.remove(id);
    }
    function clearHistory() {
      if (confirm('Clear all history?')) {
        history.value = HistoryModel.clear();
      }
    }

    // ---------- Import / Export ----------
    function doExport() {
      StorageService.exportAll();
    }
    async function doImport(file) {
      try {
        await StorageService.importAll(file, 'overwrite');
        Object.assign(settings, SettingsModel.load());
        history.value = HistoryModel.load();
        applyTheme();
        AudioService.setVolume(settings.volume);
        alert('Import successful');
      } catch (e) {
        alert('Import failed: ' + e.message);
      }
    }

    // ---------- Lifecycle ----------
    onMounted(() => {
      AudioService.init();
      AudioService.setVolume(settings.volume);
    });

    onUnmounted(() => {
      pause();
      if (countdownTimer) clearInterval(countdownTimer);
    });

    // Keep audio alive when possible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && isRunning.value) {
        AudioService.resume();
      }
    });

    return {
      settings,
      history,
      isRunning,
      isCountingDown,
      countdownValue,
      activeFoot,
      totalSteps,
      elapsedSeconds,
      currentBpm,
      showSettings,
      showHistory,
      showFinishConfirm,
      showTargetBanner,
      targetBannerText,// ← add this line
      
      TimeUtils,
      sessionStartTimestamp,   // ← add
      play,
      pause,
      requestFinish,
      confirmFinish,
      saveSettings,
      deleteHistoryItem,
      clearHistory,
      doExport,
      doImport
    };
  },
  template: `
    <div class="h-full flex flex-col relative">
      <!-- Target reached banner -->
      <div v-if="showTargetBanner"
        class="target-banner absolute top-0 inset-x-0 z-40 bg-amber-500 text-white text-center py-3 font-medium shadow">
        {{ targetBannerText }}
      </div>

      <!-- Countdown overlay -->
      <div v-if="isCountingDown"
        class="countdown-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div class="text-9xl font-bold text-white animate-pulse">
          {{ countdownValue }}
        </div>
      </div>

      <!-- Finish confirm -->
      <div v-if="showFinishConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
          <h3 class="text-lg font-semibold mb-2">Finish session?</h3>
          <p class="text-sm text-slate-500 mb-6">
            Time: {{ TimeUtils.formatMMSS(elapsedSeconds) }} · Steps: {{ totalSteps }}
          </p>
          <div class="flex gap-3">
            <button @click="showFinishConfirm = false"
              class="flex-1 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600">
              Cancel
            </button>
            <button @click="confirmFinish"
              class="flex-1 py-2.5 rounded-lg bg-primary-600 text-white">
              Finish & Save
            </button>
          </div>
        </div>
      </div>

      <Header @open-settings="showSettings = true" />

      <main class="flex-1 flex flex-col">
        <Summary
          :elapsed-seconds="elapsedSeconds"
          :total-steps="totalSteps"
          :start-timestamp="sessionStartTimestamp"
        />

        <Feet :active-foot="activeFoot" />

        <Actions
          :is-running="isRunning"
          :is-counting-down="isCountingDown"
          @play="play"
          @pause="pause"
          @finish="requestFinish"
        />
      </main>

      <Footer />

      <SettingsModal
        :visible="showSettings"
        :settings="settings"
        @close="showSettings = false"
        @save="saveSettings"
        @open-history="showHistory = true; showSettings = false"
        @export="doExport"
        @import="doImport"
      />

      <HistoryModal
        :visible="showHistory"
        :history="history"
        @close="showHistory = false"
        @delete="deleteHistoryItem"
        @clear="clearHistory"
      />
    </div>
  `
};

createApp(App).mount('#app');