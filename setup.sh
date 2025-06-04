#!/bin/bash

echo "Starting Love Timer DevContainer setup..."

# Step 1: Install all production dependencies
echo "Installing production dependencies..."
npm install

# Step 2: Install development dependencies for TypeScript, ESLint, and Prettier
echo "Installing development dependencies..."
npm install -D eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier \
  @types/node \
  @types/react \
  @types/react-dom \
  jest \
  jest-environment-jsdom \
  @testing-library/react \
  @testing-library/jest-dom

# Step 3: Generate tsconfig.json if it doesn't exist
if [ ! -f tsconfig.json ]; then
  echo "Creating tsconfig.json..."
  cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
else
  echo "tsconfig.json already exists, skipping..."
fi

# Step 4: Generate tsconfig.node.json if it doesn't exist
if [ ! -f tsconfig.node.json ]; then
  echo "Creating tsconfig.node.json..."
  cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF
else
  echo "tsconfig.node.json already exists, skipping..."
fi

# Step 5: Generate .eslintrc.json if it doesn't exist
if [ ! -f .eslintrc.json ]; then
  echo "Creating .eslintrc.json..."
  cat > .eslintrc.json << 'EOF'
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "react"],
  "rules": {
    "react/react-in-jsx-scope": "off"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
EOF
else
  echo ".eslintrc.json already exists, skipping..."
fi

# Step 6: Print success message
echo "Environment setup complete!"
