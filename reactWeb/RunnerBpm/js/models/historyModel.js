const HistoryModel = {
  load() {
    try {
      const raw = localStorage.getItem('runnerbpm_history');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to load history', e);
      return [];
    }
  },

  save(history) {
    localStorage.setItem('runnerbpm_history', JSON.stringify(history));
  },

  add(session) {
    const history = this.load();
    history.unshift(session);
    this.save(history);
    return history;
  },

  remove(id) {
    const history = this.load().filter(s => s.id !== id);
    this.save(history);
    return history;
  },

  clear() {
    this.save([]);
    return [];
  }
};