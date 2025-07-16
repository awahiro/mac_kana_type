#!/bin/bash

# Kana Input Typing Practice App Startup Script
# Usage: ./bin/start.sh [port]

# Default port
PORT="8081"

# Get script directory and project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR" &> /dev/null && pwd )"

echo "=== Kana Input Typing Practice App ==="
echo "Project directory: $PROJECT_DIR"
echo "Port: $PORT"
echo ""

# Move to project directory
cd "$PROJECT_DIR"

echo "Starting server with Python ..."
echo "Please access http://localhost:$PORT/ in your browser"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
python -m http.server "$PORT"

