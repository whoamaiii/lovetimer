#!/usr/bin/env bash
# This script builds the application and serves it using the preview command.

echo "Building the application..."
npm run build

echo "Starting the application preview server on port 3000..."
npm run preview
