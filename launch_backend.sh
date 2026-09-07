#!/bin/bash

# ATS CV Analyzer - Backend Launcher
# This script launches the FastAPI backend development server

set -e

echo "🚀 Starting ATS CV Analyzer Backend..."

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Check if requirements are installed
if [ ! -f ".venv/installed" ]; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
    touch .venv/installed
fi

# Start FastAPI development server
echo "🌐 Starting FastAPI development server on http://localhost:8000"
uvicorn app.main:app --host 0.0.0.0 --reload