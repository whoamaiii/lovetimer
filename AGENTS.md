# Contributor Guide for Love Timer (for AI Agents)

## Project Overview

This is a Vite-based application, primarily focused on timer functionality. It is configured with TypeScript (via `tsconfig.json`), ESLint for linting, Prettier for formatting, and Jest for testing. The goal is to maintain a clean, well-structured, and "Codex-ready" codebase.

### Key Directories & Files:

-   `src/`: Contains all source code.
    -   `main.js`: Main entry point for the application. Contains `@codex:` tags.
    -   `style.css`: Global styles.
    -   `config/`: Application configuration files.
    -   `utils/`: Utility functions.
    -   `setupTests.js`: Jest setup file.
-   `__tests__/`: Contains Jest test files (e.g., `example.test.js`).
-   `bin/launch.sh`: Script to build and run the application in a production-like mode.
-   `public/`: Static assets.
-   `index.html`: The main HTML file.
-   `package.json`: Defines scripts, dependencies, and project metadata.
-   `vite.config.js`: Vite configuration (if customized, currently likely default).
-   `codex.json`: Manifest for AI agent interaction and environment setup.
-   `setup.sh`: Script for setting up the development environment (installs dependencies, creates configs).
-   `.devcontainer/devcontainer.json`: Configuration for developing inside a container.
-   `.eslintrc.json`: ESLint configuration.
-   `tsconfig.json` & `tsconfig.node.json`: TypeScript configurations.

## Development Environment & Workflow

1.  **Environment Setup**:
    -   If using a DevContainer, the environment is set up automatically via `postCreateCommand` in `.devcontainer/devcontainer.json` (which runs `setup.sh`).
    -   If using Codex, the `setupScript` in `codex.json` (also `setup.sh`) handles this.
    -   Manually, run `npm install` and then `bash setup.sh` once.

2.  **Running the App**:
    -   For development: `npm run dev` (serves on `http://localhost:5173`).
    -   For production-like preview: `npm run start` (builds and serves on `http://localhost:3000`).

3.  **Making Changes**:
    -   Adhere to existing code style (ESLint + Prettier).
    -   If adding new features, consider creating relevant components or modules within `src/`.
    -   Update or add tests for any new or modified logic.

## Testing Instructions

-   **Run all tests**:
    ```bash
    npm run test
    ```
-   Tests are written using Jest and can be found in the `__tests__` directory.
-   Ensure all tests pass before committing changes.
-   Add new tests for new functionality or bug fixes. `src/setupTests.js` imports `@testing-library/jest-dom` for DOM-related assertions if you add React components and tests later.

## Linting and Formatting

-   **Run ESLint**:
    ```bash
    npm run lint
    ```
    This checks `src/**/*.{js,jsx,ts,tsx}` files. Fix any reported errors.
-   **Run Prettier**:
    ```bash
    npm run format
    ```
    This formats `src/**/*.{js,css,html,json}`. It's good practice to run this before committing.

## Code Style and Conventions

-   Follow ESLint rules defined in `.eslintrc.json` (extends recommended, TypeScript, React, Prettier).
-   Use ES Modules (`import`/`export`).
-   Write clear and concise code. Add comments where necessary to explain complex logic.

## Committing Changes

-   Write clear, descriptive commit messages.
-   Ensure tests pass (`npm run test`) and linting is clean (`npm run lint`) before committing.

## Working with Codex / AI Agents

-   **Understand the Goal**: Clarify the task requirements before starting.
-   **Use Provided Scripts**: Utilize `npm run dev`, `npm run start`, `npm run test`, `npm run lint`.
-   **File Structure**: Work within the existing file structure. Create new files/directories logically.
-   **`@codex:` Tags**: Pay attention to `@codex:` tags in files like `src/main.js` for hints on important code sections.
-   **Iterative Approach**: For complex tasks, break them down. Test and verify each smaller part.
-   **Context is Key**: Refer to `codex.json` for environment details and `README.md` for project overview.

## Debugging Tips

-   Use browser developer tools for front-end issues.
-   Check terminal output for errors from Vite, Node, Jest, or ESLint.
-   For issues with `npm run start` or `npm run dev`, ensure the respective ports (3000, 5173) are not in use by other applications.

This guide helps ensure consistency and quality when AI agents contribute to the Love Timer project.
