const AudioService = {
  ctx: null,
  masterGain: null,

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.setVolume(70);
  },

  setVolume(percent) {
    if (!this.masterGain) return;
    const v = Math.max(0, Math.min(100, percent)) / 100;
    // slightly louder curve
    this.masterGain.gain.value = v * 0.8;
  },

  async resume() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
        console.log('AudioContext resumed');
      } catch (e) {
        console.warn('Failed to resume AudioContext', e);
      }
    }
  },

  playTone(frequency, duration = 0.12) {
    this.resume().then(() => {
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = frequency;

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.4, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    });
  },

  playLeft(freq) {
    this.playTone(freq || 440);
  },

  playRight(freq) {
    this.playTone(freq || 523.25);
  },

  // Test function – you can call it from console
  test() {
    this.playLeft(440);
    setTimeout(() => this.playRight(523), 300);
  }
};