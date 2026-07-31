import { AVAILABLE_COLOURS } from './config.js';

// ----- Helpers (unchanged) -----
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

// ----- Math Mode Helpers -----
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMathExpression() {
    const ops = ['+', '-', '×', '÷'];
    let a, b, op, answer;
    let attempts = 0;
    do {
        op = ops[Math.floor(Math.random() * ops.length)];
        if (op === '+') {
            a = getRandomInt(1, 50);
            b = getRandomInt(1, 50);
            answer = a + b;
        } else if (op === '-') {
            a = getRandomInt(1, 50);
            b = getRandomInt(1, a); // ensure non-negative result
            answer = a - b;
        } else if (op === '×') {
            a = getRandomInt(1, 12);
            b = getRandomInt(1, 12);
            answer = a * b;
        } else { // ÷
            b = getRandomInt(1, 12);
            answer = getRandomInt(1, 12);
            a = b * answer; // ensure integer division
        }
        attempts++;
    } while (attempts < 20 && (answer < 0 || answer > 100));
    return { expression: `${a} ${op} ${b}`, answer };
}

// ----- RPS Constants -----
const RPS_COLOURS = ['Red', 'Blue'];
const SYMBOLS = ['Rock', 'Paper', 'Scissors'];
export const SYMBOL_ICONS = {
    Rock: 'fa-regular fa-hand-back-fist',
    Paper: 'fa-regular fa-hand',
    Scissors: 'fa-regular fa-hand-scissors'
};
export const COUNTER = {
    Rock: 'Paper',
    Paper: 'Scissors',
    Scissors: 'Rock'
};

export function getOppositeColour(colour) {
    return colour === 'Red' ? 'Blue' : 'Red';
}

function getRandomRPSItem() {
    const colour = RPS_COLOURS[Math.floor(Math.random() * RPS_COLOURS.length)];
    const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    return { colour, symbol };
}

// ----- Core Sequence Generation (now ensures no consecutive duplicates) -----
export function generateSequence(mode, activeColours, rows, cols) {
    const length = rows * cols;
    const seq = [];
    let last = null;

    for (let i = 0; i < length; i++) {
        let item;
        let attempts = 0;
        do {
            if (mode === 'word' || mode === 'colour') {
                // For word/colour, item is a colour name string
                const colour = getRandomColourName(activeColours);
                item = colour;
            } else if (mode === 'math') {
                const expr = generateMathExpression();
                item = { expression: expr.expression, answer: expr.answer };
            } else if (mode === 'rps') {
                const rps = getRandomRPSItem();
                item = { colour: rps.colour, symbol: rps.symbol };
            }
            attempts++;
        } while (attempts < 20 && (last !== null && isEqualItem(item, last)));
        seq.push(item);
        last = item;
    }
    return seq;
}

// Helper to compare two items for equality (to avoid consecutive duplicates)
function isEqualItem(a, b) {
    if (typeof a === 'string' && typeof b === 'string') return a === b;
    if (typeof a === 'object' && typeof b === 'object') {
        // For math or rps, compare all properties
        return JSON.stringify(a) === JSON.stringify(b);
    }
    return false;
}

// ----- Grid Generation -----
export function generateGridFromSequence(sequence, activeColours, mode) {
    const total = sequence.length;
    const newGrid = [];

    for (let i = 0; i < total; i++) {
        let card = {};
        const target = sequence[i];

        if (mode === 'word') {
            // target is a colour name (string)
            const wordColour = target;
            const bgColour = getDifferentColourName(wordColour, activeColours);
            card = {
                bgColor: getColourHex(bgColour),
                word: wordColour,
                bgName: bgColour,
                wordName: wordColour,
                target: target,
                icon: null,       // not used
                value: wordColour, // for matching
                sequenceIndex: i,
                flashCorrect: false,
                flashWrong: false,
                matched: false,
            };
        } else if (mode === 'colour') {
            const bgColour = target;
            const wordColour = getDifferentColourName(bgColour, activeColours);
            card = {
                bgColor: getColourHex(bgColour),
                word: wordColour,
                bgName: bgColour,
                wordName: wordColour,
                target: target,
                icon: null,
                value: bgColour,
                sequenceIndex: i,
                flashCorrect: false,
                flashWrong: false,
                matched: false,
            };
        } else if (mode === 'math') {
            // target is { expression, answer }
            const answer = target.answer;
            // We'll use a neutral background (grey) and black text
            // The card's word will be the answer as a string
            card = {
                bgColor: '#e2e8f0', // light grey
                word: String(answer),
                bgName: 'math',
                wordName: String(answer),
                target: target,
                icon: null,
                value: answer, // numeric
                sequenceIndex: i,
                flashCorrect: false,
                flashWrong: false,
                matched: false,
            };
        } else if (mode === 'rps') {
            // target is { colour, symbol }
            // The correct card must be opposite colour and counter symbol
            const correctColour = getOppositeColour(target.colour);
            const correctSymbol = COUNTER[target.symbol];
            card = {
                bgColor: getColourHex(correctColour),
                word: correctSymbol, // we'll render icon separately
                bgName: correctColour,
                wordName: correctSymbol,
                target: target,
                icon: SYMBOL_ICONS[correctSymbol],
                value: { colour: correctColour, symbol: correctSymbol },
                sequenceIndex: i,
                flashCorrect: false,
                flashWrong: false,
                matched: false,
            };
        }
        newGrid.push(card);
    }

    return shuffleArray(newGrid);
}

// ----- Mode selection for 'mix' -----
export function determineRoundMode(mode) {
    if (mode === 'mix') {
        const options = ['word', 'colour', 'math', 'rps'];
        return options[Math.floor(Math.random() * options.length)];
    }
    return mode; // word, colour, math, rps
}

// For settings UI – check if a colour is selected
export function isColourSelected(settingsColours, name) {
    return settingsColours.includes(name);
}
