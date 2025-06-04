# Love Timer ⏰💕

A romantic love timer counting every precious second since your anniversary, with beautiful animations and astronomical features.

---

## Quickstart

```bash
git clone https://github.com/yourusername/love-timer.git
cd love-timer
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Features

- **Real-time Counter**: Tracks elapsed seconds since your special date
- **Anniversary Countdown**: Shows days until next anniversary
- **Romantic Messages**: Rotating collection of love messages
- **Heart Animations**: Floating hearts with smooth animations
- **Astronomical Panel**: Moon phases, sunrise/sunset times, and constellation info
- **Accessibility**: Full screen reader support and keyboard navigation
- **Responsive Design**: Works beautifully on all devices
- **Theme Support**: Auto/light/dark themes with system preference detection

## Architecture Overview

- **index.html**: Main HTML entry point.
- **src/**: Application source code.
  - **main.js**: App bootstrap and root logic.
  - **style.css**: Global styles.
  - **astro/**: Astronomical features (star map, moon phase).
  - **config/**: App configuration (themes, locales, start date, etc).
  - **utils/**: Helper functions (date calculations, formatting).
- **public/**: Static assets.
- **docs/**: Documentation and setup guides.

---

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Feature Flags

- `VITE_ENABLE_ASTRO`: Enable star sky background (default: false)

### Astro payload

The first time the star-sky flag is ON the app streams ~350 kB of star-catalog JSON from jsDelivr (d3-celestial datapath). Subsequent loads are cached by the browser.

## Configuration

Copy `.env.example` to `.env` and adjust settings as needed.

---

## Contributing

1. Fork the repository and create a feature branch.
2. Follow the existing code style (see `.eslintrc.cjs` and `.prettierrc.json`).
3. Write clear commit messages and document public APIs.
4. Add or update tests if applicable.
5. Open a pull request with a clear description of your changes.

For questions or bug reports, please open an issue.

---
