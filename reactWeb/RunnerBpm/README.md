# RunnerBpm – Detailed Product & Technical Specification

**Version:** 1.2  
**Date:** 2026-08-03  
**Status:** Final review – ready for approval before coding

---

## 1. Project Overview

**RunnerBpm** is a static single-page web application that acts as a **cadence / metronome trainer** for runners / walkers.

The user sets a target BPM (steps per minute). When the session starts, the app:
- Plays a distinct tone for the **Left foot** and a different tone for the **Right foot** (both fully configurable)
- Alternates a visual highlight between Left and Right foot on every beat
- Counts total steps (Left + Right)
- Tracks elapsed time
- Continues running (time, steps, sound) even if the browser tab is in the background (as far as the browser allows)

All settings and session history are stored in `localStorage` and can be exported / imported as JSON.

The app is delivered as a **Progressive Web App (PWA)** so it can be installed on the home screen and work offline.

---

## 2. Tech Stack

| Layer              | Technology                                      | Notes |
|--------------------|--------------------------------------------------|-------|
| UI Framework       | Vue 3 (CDN)                                      | Using `defineComponent` only |
| Styling            | Tailwind CSS (CDN) + small JS helper             | Dynamic class control via a utility function |
| Icons              | Font Awesome 6 Solid (CDN)                       | `fa-shoe-prints` for feet |
| Storage            | `localStorage`                                   | Settings + History |
| Architecture       | MVVM                                              | Clear separation of Model / View / ViewModel |
| Build              | None (pure static)                               | Multiple `.js` files loaded by `index.html` |
| PWA                | Web App Manifest + Service Worker                | Installable + offline support |
| Extra              | PowerShell script                                | Creates folder structure + empty files |

All libraries loaded from CDN. No build step, no npm.

---

## 3. Folder & File Structure

```
RunnerBpm/
├── index.html
├── manifest.json
├── sw.js                          ← Service Worker
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── css/
│   └── (optional custom.css)
├── js/
│   ├── app.js                     ← Root Vue app + template composition
│   ├── models/
│   │   ├── settingsModel.js
│   │   └── historyModel.js
│   ├── components/
│   │   ├── Header.js
│   │   ├── Summary.js
│   │   ├── Feet.js
│   │   ├── Actions.js
│   │   ├── SettingsModal.js
│   │   ├── HistoryModal.js
│   │   └── Footer.js
│   ├── services/
│   │   ├── storageService.js
│   │   ├── audioService.js
│   │   └── metronomeService.js
│   └── utils/
│       ├── timeUtils.js
│       └── tailwindHelper.js
├── create-structure.ps1
└── README.md
```

---

## 4. Architecture (MVVM)

### Model
- `settingsModel.js` – all user preferences including left/right foot tones
- `historyModel.js` – array of finished sessions

### View
- Pure Vue templates inside each component

### ViewModel
- Each component’s logic acts as ViewModel
- `app.js` owns the shared reactive session state and composes all components

### Services
- `storageService.js` – load / save / export / import
- `audioService.js` – Web Audio API, separate oscillators/frequencies for Left & Right foot
- `metronomeService.js` – precise beat timer, step counting, foot alternation

---

## 5. UI Layout (Top → Bottom)

### 5.1 Header (very compact)
```
[RunnerBpm]  |  Cadence Trainer  |  Current Date & Time (small)  |  ⚙️
```
- Clicking ⚙️ opens **Settings Modal**

### 5.2 Summary Section
```
Time Used          Steps          BPM
MM:SS              1234           168
(larger)           (larger)       (smaller under Steps)
```

### 5.3 Left / Right Foot Section
```
     👟 Left                👟 Right
   (dim / bright)         (dim / bright)
```
- Font Awesome `fa-shoe-prints`
- Automatically alternates on every beat
- Active foot is bright / scaled / colored; inactive is dimmed

### 5.4 Action Section
```
[ ▶ Play ]          [ Finish ]
```
- **Play** → large centered countdown **3 → 2 → 1** → starts metronome & switches to Pause
- **Pause** → freezes time, steps and sound
- **Finish** → confirmation modal → auto-saves session to history → resets

### 5.5 Footer
```
RunnerBpm v1.0.0  |  © 2026
```

---

## 6. Detailed Feature List

### 6.1 Metronome & Cadence Engine
- Target BPM (default **160**)
- On every beat:
  - Plays the configured **Left foot tone** or **Right foot tone**
  - Alternates visual highlight
  - Increments total step count by 1
- Continues in background (browser permitting)

### 6.2 Settings Modal

| Setting                    | Type          | Default     | Notes |
|----------------------------|---------------|-------------|-------|
| Target BPM                 | number        | **160**     | Range 60–220 |
| Sound On/Off               | boolean       | true        | Master switch |
| Sound Volume               | 0–100         | 70          | |
| **Left Foot Tone**         | Hz + presets  | 440 Hz      | Number input (Hz) **+** preset buttons (e.g. A4, C5, E5…) |
| **Right Foot Tone**        | Hz + presets  | 523.25 Hz   | Number input (Hz) **+** preset buttons (e.g. A4, C5, E5…) |
| Vibration                  | boolean       | false       | Only on **Start** and **Finish** (`navigator.vibrate`) |
| Dark Mode                  | boolean       | **true**    | |
| Target Steps               | number        | 0 (off)     | 0 = disabled |
| Target Time (minutes)      | number        | 0 (off)     | 0 = disabled |

When **Target Steps** or **Target Time** is reached → **auto-pause + visual banner only** (no browser Notification API).

### 6.3 History
- Separate **History Modal**
- Auto-save **only on Finish**
- Each session records:
  ```json
  {
    "id": "uuid",
    "date": "ISO string",
    "durationSeconds": 1845,
    "totalSteps": 3120,
    "targetBpm": 160,
    "averageBpm": 158.7,
    "notes": ""
  }
  ```
- Newest first, delete individual or clear all

### 6.4 Export / Import
- Full backup of `{ settings, history }` as JSON file
- Import with merge or overwrite option

### 6.5 Countdown
- Large centered numbers only: **3 → 2 → 1**
- After “1” the metronome starts immediately

### 6.6 Vibration
- Uses `navigator.vibrate`
- Only triggered on **session start** (after countdown) and **Finish**

### 6.7 PWA Support
- `manifest.json` with name, short_name, icons, theme color, display: standalone
- Service Worker (`sw.js`) for offline caching of all static assets
- Installable on mobile & desktop

### 6.8 Footer
- Hard-coded version: **RunnerBpm v1.0.0**

---

## 7. Data Models (localStorage)

**Keys**
- `runnerbpm_settings`
- `runnerbpm_history`

**Settings shape**
```json
{
  "targetBpm": 160,
  "soundEnabled": true,
  "volume": 70,
  "leftFootTone": 440,
  "rightFootTone": 523.25,
  "vibration": false,
  "darkMode": true,
  "targetSteps": 0,
  "targetTimeMinutes": 0
}
```

**History shape** – array of session objects (see 6.3)

---

## 8. Component Responsibilities

| File                  | Responsibility |
|-----------------------|----------------|
| `Header.js`           | Logo, title, live clock, Settings button |
| `Summary.js`          | Time / Steps / BPM display |
| `Feet.js`             | Left & Right foot icons + active state |
| `Actions.js`          | Play/Pause, Finish, countdown overlay |
| `SettingsModal.js`    | All settings including Left/Right foot tones (Hz input + presets) + Export/Import |
| `HistoryModal.js`     | Session list + delete |
| `Footer.js`           | Hard-coded version `v1.0.0` |
| `app.js`              | Root, session state, composition |
| `metronomeService.js` | Beat timer, step count, foot alternation |
| `audioService.js`     | Separate tones for Left & Right + volume |
| `storageService.js`   | localStorage + JSON export/import |
| `tailwindHelper.js`   | Dark mode & dynamic class utilities |

---

## 9. PowerShell Script (`create-structure.ps1`)

Creates the complete folder tree and all empty files listed in section 3 so you can copy-paste the real content afterwards.

---

## 10. Confirmed Decisions

| # | Decision                                      | Status |
|---|-----------------------------------------------|--------|
| 1 | Default Target BPM = **160**                  | Confirmed |
| 2 | Countdown = **large centered numbers only**   | Confirmed |
| 3 | Target reached → **auto-pause + visual banner only** | Confirmed |
| 4 | History → **auto-save only on Finish**        | Confirmed |
| 5 | Dark Mode default = **true**                  | Confirmed |
| 6 | Vibration only on **Start** and **Finish**     | Confirmed |
| 7 | **Left Foot Tone + Right Foot Tone** (Hz input + preset buttons) | Confirmed |
| 8 | Footer with hard-coded **v1.0.0**             | Confirmed |
| 9 | PWA (manifest + service worker)               | Confirmed |

---

## 11. Final Clarifications (now locked)

| Item                              | Decision                                      |
|-----------------------------------|-----------------------------------------------|
| Left / Right tone UI              | **Both**: number input (Hz) + preset buttons |
| Target reached notification       | **Visual banner only** (no Notification API) |
| Version number                    | Hard-coded `v1.0.0`                           |

---

## 12. Next Step

This document (v1.2) is now complete and consistent with all your answers.

Please reply with:

- ✅ **Approved – start coding**

or any last tiny change.

Once approved I will deliver:

1. The PowerShell script (`create-structure.ps1`)
2. Every source file in clearly separated code blocks ready for copy-paste
