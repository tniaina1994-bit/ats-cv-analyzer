#!/bin/bash

# ATS CV Analyzer - Main Launcher
# This script launches both frontend and backend services

set -e

echo "🚀 Starting ATS CV Analyzer..."
echo "================================"

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    echo "✅ Services stopped."
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔧 Starting backend..."
cd "$SCRIPT_DIR/backend"
source .venv/bin/activate 2>/dev/null || true
uvicorn app.main:app --host 0.0.0.0 --reload &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 2

# Start frontend in background
echo "🎨 Starting frontend..."
cd "$SCRIPT_DIR/frontend"
ng serve --host 0.0.0.0 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ ATS CV Analyzer is running!"
echo "   Frontend: http://localhost:4200"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for any process to exit
wait -n $FRONTEND_PID $BACKEND_PID

# Exit with status of process that exited first
exit $?