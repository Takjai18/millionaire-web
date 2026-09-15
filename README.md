# Who Wants to Be a Millionaire (百萬富翁) - Web App Spec

This repository is an event-ready web app implementation of "Who Wants to Be a Millionaire" designed for church gatherings, youth fellowships, and stage events. It is built using React (Vite) + Tailwind CSS and deployed via GitHub to Cloudflare Pages.

---

## 1. Project Goal & Display Target
- **Target Display**: Optimized for 16:9 desktop & church projector screen.
- **Language**: Traditional Chinese (繁體中文) default for all UI elements.
- **Theme**: Classic TV show styling (Deep navy/midnight blue background `#020617`, gold accents, metallic borders).

---

## 2. Core Game Architecture & Rules

### 2.1 Modes
1. **Classic 15-Question Mode**:
   - 15 questions ascending in difficulty.
   - Guaranteed Safe Havens at **Q5 ($1,000)** and **Q10 ($32,000)**.
   - Grand Prize at **Q15 ($1,000,000)**.
   - Incorrect answers drop the participant back to the last locked safe haven ($0, $1,000, or $32,000).
2. **Custom Event Mode**:
   - Host chooses question count (e.g. 8, 10, or 12 questions).
   - Host configures custom safe havens and custom labels (e.g. "恩典獎", "終極大獎").

### 2.2 Lifelines (三大錦囊)
- **50:50 (五十五十)**: Randomly disables 2 wrong options.
- **Ask the Audience (問現場觀眾)**: Simulates audience polling with a bar chart modal. Weighting depends on question tier (earlier questions lean 70-85% towards the correct answer; later tiers distribute more evenly).
- **Phone a Friend (打電話問朋友)**: A dramatic 30-second countdown modal for making a **REAL live phone call** on stage.

### 2.3 Audio System
- Built-in Web Audio API synthesizer for essential chimes (tick, lock-in, correct, wrong).
- HTML5 Audio hooks for external audio assets placed in `/public/sounds/`.

### 2.4 Admin & Question Bank
- Admin Modal to edit/add/delete questions.
- Support JSON Export & JSON Import to prep trivia before events.
- Persistent state using `localStorage`.

---

## 3. Directory Structure
```text
├── public/
│   └── sounds/              # Audio files
├── src/
│   ├── components/
│   │   ├── MoneyLadder.jsx  # Vertical prize tree
│   │   ├── Lifelines.jsx    # 50:50, Audience, Phone triggers
│   │   ├── QuestionBox.jsx  # Diamond question container & 4 choices
│   │   ├── Modals/
│   │   │   ├── AudienceModal.jsx # Simulated poll bar chart
│   │   │   ├── PhoneModal.jsx    # 30-sec stage countdown
│   │   │   └── AdminModal.jsx    # Custom question editor & JSON import/export
│   ├── utils/
│   │   └── soundPlayer.js   # Web Audio synthesizer & sound controller
│   ├── data/
│   │   └── initialQuestions.json
│   ├── App.jsx              # Main stage view
│   └── index.css
├── package.json
└── vite.config.js
```

---

## 4. Grok Build Tasks (What to complete next)
1. Enhance CSS diamond/hexagonal clip-paths for authentic TV buttons (`polygon(...)`).
2. Complete the `AudienceModal` animated bar chart and `PhoneModal` 30s timer.
3. Polish the `AdminModal` to include full JSON import/export and dynamic question addition.
