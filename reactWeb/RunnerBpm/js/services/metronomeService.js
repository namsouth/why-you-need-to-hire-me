const MetronomeService = {
  intervalId: null,
  isRunning: false,
  currentFoot: 'left', // 'left' | 'right'
  onBeat: null,        // callback({ foot, step })
  settings: null,

  start(settings, onBeatCallback) {
    this.stop();
    this.settings = settings;
    this.onBeat = onBeatCallback;
    this.currentFoot = 'left';
    this.isRunning = true;

    const intervalMs = 60000 / settings.targetBpm;

    // first beat immediately
    this._tick();

    this.intervalId = setInterval(() => {
      this._tick();
    }, intervalMs);
  },

  _tick() {
    if (!this.isRunning) return;

    const foot = this.currentFoot;
    const isLeft = foot === 'left';

    if (this.settings.soundEnabled) {
      if (isLeft) {
        AudioService.playLeft(this.settings.leftFootTone);
      } else {
        AudioService.playRight(this.settings.rightFootTone);
      }
    }

    if (typeof this.onBeat === 'function') {
      this.onBeat({ foot, isLeft });
    }

    // alternate
    this.currentFoot = isLeft ? 'right' : 'left';
  },

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  },

  updateSettings(newSettings) {
    this.settings = newSettings;
    if (this.isRunning) {
      // restart with new BPM
      const cb = this.onBeat;
      this.start(newSettings, cb);
    }
  }
};