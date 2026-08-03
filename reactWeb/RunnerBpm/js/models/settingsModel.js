const SettingsModel = {
  defaults: {
    targetBpm: 160,
    soundEnabled: true,
    volume: 70,
    leftFootTone: 440,      // A4
    rightFootTone: 523.25,  // C5
    vibration: false,
    darkMode: true,
    targetSteps: 0,
    targetTimeMinutes: 0
  },

  load() {
    try {
      const raw = localStorage.getItem('runnerbpm_settings');
      if (!raw) return { ...this.defaults };
      return { ...this.defaults, ...JSON.parse(raw) };
    } catch (e) {
      console.warn('Failed to load settings', e);
      return { ...this.defaults };
    }
  },

  save(settings) {
    localStorage.setItem('runnerbpm_settings', JSON.stringify(settings));
  }
};