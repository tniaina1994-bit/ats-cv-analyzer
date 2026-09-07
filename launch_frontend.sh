#!/bin/bash

# ATS CV Analyzer - Frontend Launcher
# This script launches the Angular frontend development server

set -e

echo "🚀 Starting ATS CV Analyzer Frontend..."

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start Angular development server
echo "🌐 Starting Angular development server on http://localhost:4200"
ng serve --host 0.0.0.0