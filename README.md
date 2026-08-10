# Love Timer ⏰💕

A romantic timer that counts every second since your anniversary, remastered
with a **Liquid Glass** interface inspired by the latest iOS design language:
translucent, refractive panels with specular highlights and a slowly
travelling spectral "diffraction" edge, floating over an ambient light scene.

Built with Vite and vanilla JavaScript — no framework required.

---

## Features

- **The original anniversary, preserved** — the app defaults to
  June 4, 2024 at 07:39, the date recovered from this project's earliest
  history. A "use our original date" reset in the settings sheet restores
  it at any time, and a test guards the constant against regressions.
- **Live time breakdown** — days, hours, minutes and seconds together,
  the running total of seconds, and a friendly "that is X years, Y months
  of us" summary.
- **Editable anniversary date** — pick your own date in a glass settings
  sheet; it is persisted in `localStorage`.
- **Anniversary progress bar** — a gradient bar fills as the next
  anniversary approaches.
- **Liquid light interactions** — the hero card's specular highlight
  follows your pointer and the pane tilts like real glass; tapping the
  card bursts a handful of hearts.
- **Anniversary countdown** — days remaining until the next anniversary,
  with a confetti celebration on the day itself.
- **Million-second milestones** — confetti and a special message every
  million seconds.
- **Rotating romantic messages** — localized in 8 languages.
- **Light / dark / auto themes** — follows the system by default, with the
  choice persisted.
- **Accessibility** — skip link, ARIA live regions, keyboard navigation,
  screen-reader announcements, and full `prefers-reduced-motion`,
  `prefers-contrast` and print support.
- **Performance-aware** — pauses updates when the tab is hidden, caps the
  number of floating hearts based on device capability.

---

## Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/whoamaiii/lovetimer.git
   cd lovetimer
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

   You must complete this step before running `npm run test` or `npm run lint`.

---

## Running the Application

- **Development mode (Vite dev server):**

  ```bash
  npm run dev
  ```

  Access at: `http://localhost:5173`.

- **Production-like mode (builds then serves with Vite preview):**

  ```bash
  npm run start
  ```

  Access at: `http://localhost:3000`.

---

## Code Structure

- **`index.html`** — the Liquid Glass layout: ambient scene, glass control
  bar, hero card with time tiles, message card, settings sheet.
- **`src/main.js`** — exports `LoveTimerApp` (all timer, theme, animation and
  settings logic) and `initializeLoveTimer`, the bootstrap that creates the
  app instance and exposes it on `window.loveTimer`.
- **`src/style.css`** — design tokens and the glass material system
  (`.glass`, `.glass-inner`, `.diffract`), themes, and animations.
- **`src/config/`** — modular configuration: start date, locales and
  translations, animation/performance/theme/accessibility settings, and
  validation.
- **`src/utils/timeBreakdown.js`** — pure helper that splits total seconds
  into days / hours / minutes / seconds.
- **`__tests__/`** — Jest test suites (jsdom environment).

---

## Testing

Run all tests with Jest (after `npm install`):

```bash
npm run test
```

---

## Linting and Formatting

```bash
npm run lint     # ESLint over src/
npm run format   # Prettier over src/
```

---

## DevContainer

This project includes a DevContainer configuration
(`.devcontainer/devcontainer.json`). Opening the project in a
DevContainer-compatible editor will set up Node, install dependencies via
`setup.sh`, and forward ports 3000 and 5173.

---

## AI Agent Integration

This project is configured for use with AI coding assistants:

- **`codex.json`** — manifest describing entrypoints, setup and test commands.
- **`AGENTS.md`** — guidance for AI agents working on this codebase.
- **Standardized npm scripts** — `start`, `dev`, `test`, `lint`, `format`.
