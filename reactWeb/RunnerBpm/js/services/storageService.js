const StorageService = {
  exportAll() {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: SettingsModel.load(),
      history: HistoryModel.load()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runnerbpm-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async importAll(file, mode = 'overwrite') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.settings || !Array.isArray(data.history)) {
            throw new Error('Invalid backup file');
          }

          if (mode === 'overwrite') {
            SettingsModel.save(data.settings);
            HistoryModel.save(data.history);
          } else {
            // merge
            const currentSettings = SettingsModel.load();
            SettingsModel.save({ ...currentSettings, ...data.settings });
            const currentHistory = HistoryModel.load();
            const merged = [...data.history, ...currentHistory];
            // simple dedupe by id
            const seen = new Set();
            const unique = merged.filter(s => {
              if (seen.has(s.id)) return false;
              seen.add(s.id);
              return true;
            });
            HistoryModel.save(unique);
          }
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
};