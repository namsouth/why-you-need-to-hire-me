const TailwindHelper = {
  applyDarkMode(enabled) {
    const html = document.documentElement;
    if (enabled) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  },

  // Simple utility to toggle classes on an element
  toggleClass(el, className, force) {
    if (!el) return;
    if (typeof force === 'boolean') {
      el.classList.toggle(className, force);
    } else {
      el.classList.toggle(className);
    }
  }
};