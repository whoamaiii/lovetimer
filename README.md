# Love Timer ⏰💕

A simple Love Timer app to help users track time since a start date, built with Vite. This project is configured to be "Codex-ready".

---

## Prerequisites

- Node.js (Version specified in `.devcontainer/devcontainer.json`, e.g., Node 20 or as managed by your environment)
- An OpenAI API Key (if any AI-related features are used by Codex, to be set in the environment)
- A JWT Secret (for any auth features, to be set in the environment)
- Optionally, a MongoDB instance if database features are used (e.g., `mongodb://localhost:27017/lovetimer`)

---

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/whoamaiii/lovetimer.git
    cd lovetimer
    ```

2.  **Install dependencies:**
    The `setup.sh` script (run by DevContainer or `codex.json` setup) handles this. Manually:
    ```bash
    npm install
    ```
    If not using DevContainer/Codex setup, run `bash setup.sh` once to ensure all dev tools and configs are set up.
    **You must complete this step before running `npm run test` or `npm run lint`.**

3.  **Configure Environment (for Codex or local execution needing these):**
    The `codex.json` file defines `secrets` that Codex will use:
    - `OPENAI_API_KEY`: Your OpenAI API key.
    - `JWT_SECRET`: A secure random string for JWTs.
    - `DATABASE_URL`: Defaults to `mongodb://localhost:27017/lovetimer`.
    If running locally and these are needed by the application logic (currently they are not directly used by the timer app itself but are placeholders for Codex), you might set them as environment variables.

---

## Running the Application

-   **Development Mode (Vite dev server):**
    ```bash
    npm run dev
    ```
    Access at: `http://localhost:5173` (or next available port if 5173 is busy).

-   **Production-like Mode (Builds then serves with Vite preview):**
    ```bash
    npm run start
    ```
    This runs `bin/launch.sh`, which builds the app and then serves it.
Access at: `http://localhost:3000`.

---

## Entry Point

The global entry point for the application is **`initializeLoveTimer`** in
`src/main.js`. This helper creates a `LoveTimerApp`, calls its `init()` method
and exposes the instance on `window.loveTimer` after the DOM is ready. The core
timer logic lives in **`timer.js`**, while **`theme.js`** and **`ui.js`** act as
helper modules for theme handling and user-interface updates.

---

## Testing

-   Run all tests using Jest (after running `npm install` and `bash setup.sh` if
    they haven't been executed automatically):
    ```bash
    npm run test
    ```

---

## Linting

-   Run ESLint to check for code quality issues (make sure dependencies are
    installed and `bash setup.sh` has been executed):
    ```bash
    npm run lint
    ```

---

## DevContainer

This project includes a DevContainer configuration (`.devcontainer/devcontainer.json`). If you open this project in a DevContainer-compatible editor (like VS Code with the Dev Containers extension):
- A consistent development environment will be created based on the specified Node.js image.
- The `setup.sh` script will be run automatically via `postCreateCommand` to install dependencies and configure the project.
- Ports 3000 and 5173 will be forwarded.

---

## Codex Integration

This project is configured for use with AI coding assistants like OpenAI Codex:

-   **`codex.json`**: The manifest file that tells Codex how to initialize, run, test, and manage the environment for this project. It defines entrypoints, environment variables/secrets, and setup scripts.
-   **`AGENTS.md`**: (To be created/verified) Provides guidance and instructions for AI agents working on this codebase.
-   **Standardized NPM Scripts**:
    -   `npm run start`: For the main application entrypoint.
    -   `npm run dev`: For the development server.
    -   `npm run test`: For running automated tests.
    -   `npm run lint`: For code linting.
-   **Setup Script (`setup.sh`)**: Automates the installation of dependencies and generation of necessary configuration files (`tsconfig.json`, `.eslintrc.json`, etc.).
---

## Code Structure

- **`src/main.js`** – exports `initializeLoveTimer`, the global bootstrap that creates the app instance.
- **`src/timer.js`** – houses the core timer logic.
- **`src/theme.js`** – helper module for managing themes.
- **`src/ui.js`** – helper module for DOM updates and interactions.

---
