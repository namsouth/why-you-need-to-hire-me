import { AVAILABLE_COLOURS } from './config.js';

// ----- Helpers -----
export function getColourHex(name) {
    const found = AVAILABLE_COLOURS.find(c => c.name === name);
    return found ? found.hex : '#ffffff';
}

export function getRandomColourName(activeColours) {
    return activeColours[Math.floor(Math.random() * activeColours.length)];
}

export function getDifferentColourName(exclude, activeColours) {
    const colours = activeColours.filter(c => c !== exclude);
    if (colours.length === 0) return exclude;
    return colours[Math.floor(Math.random() * colours.length)];
}

export function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function formatTime(seconds) {
    if (!seconds || seconds < 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

// ----- Game-specific logic -----
export function generateSequence(activeColours, rows, cols) {
    const length = rows * cols;
    const seq = [];
    let last = null;
    for (let i = 0; i < length; i++) {
        let colour;
        if (i === 0) {
            colour = getRandomColourName(activeColours);
        } else {
            colour = getDifferentColourName(last, activeColours);
        }
        seq.push(colour);
        last = colour;
    }
    return seq; // no need to shuffle – already random and no consecutive repeats
}

export function generateGridFromSequence(sequence, activeColours, currentRoundMode) {
    const total = sequence.length;
    const newGrid = [];

    for (let i = 0; i < total; i++) {
        const targetColour = sequence[i];
        let bgColour, wordColour;

        if (currentRoundMode === 'word') {
            wordColour = targetColour;
            bgColour = getDifferentColourName(wordColour, activeColours);
            if (!bgColour) bgColour = wordColour;
        } else { // colour mode
            bgColour = targetColour;
            wordColour = getDifferentColourName(bgColour, activeColours);
            if (!wordColour) wordColour = bgColour;
        }

        newGrid.push({
            bgColor: getColourHex(bgColour),
            textColor: '#ffffff',
            word: wordColour,
            bgName: bgColour,
            wordName: wordColour,
            target: targetColour,
            sequenceIndex: i,
            flashCorrect: false,
            flashWrong: false,
            matched: false,
        });
    }

    return shuffleArray(newGrid);
}

export function determineRoundMode(mode) {
    if (mode === 'both') {
        return Math.random() < 0.5 ? 'word' : 'colour';
    }
    return mode;
}

// For settings UI – check if a colour is selected
export function isColourSelected(settingsColours, name) {
    return settingsColours.includes(name);
}