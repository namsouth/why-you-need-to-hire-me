import { STORAGE_KEYS } from './config.js';

export function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`✅ Saved to localStorage: ${key}`);
        return true;
    } catch (e) {
        console.error(`Failed to save to localStorage (${key}):`, e);
        return false;
    }
}

export function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch (e) {
        console.error(`Failed to load from localStorage (${key}):`, e);
        return null;
    }
}