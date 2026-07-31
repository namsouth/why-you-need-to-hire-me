// Centralised constants and defaults

export const AVAILABLE_COLOURS = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Cyan', hex: '#06b6d4' },
];

export const DEFAULT_SETTINGS = {
    mode: 'both',
    colours: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'],
    rows: 4,
    cols: 4,
    totalRounds: 3,
};

export const STORAGE_KEYS = {
    SETTINGS: 'colourWordGame_settings',
    HISTORY: 'colourWordGame_history',
};