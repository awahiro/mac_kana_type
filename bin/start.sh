#!/bin/bash

# Kana Input Typing Practice App Startup Script
# Usage: ./bin/start.sh [port]

# Default port
PORT=${1:-8008}

# Get script directory and project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"

echo "=== Kana Input Typing Practice App ==="
echo "Project directory: $PROJECT_DIR"
echo "Port: $PORT"
echo ""

# Move to project directory
cd "$PROJECT_DIR"

# Select and start server
if command -v python3 &> /dev/null; then
    echo "Starting server with Python 3..."
    echo "Please access http://localhost:$PORT/src/ in your browser"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server "$PORT"
elif command -v python &> /dev/null; then
    echo "Starting server with Python 2..."
    echo "Please access http://localhost:$PORT/src/ in your browser"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer "$PORT"
elif command -v node &> /dev/null; then
    if command -v npx &> /dev/null; then
        echo "Starting server with Node.js (http-server)..."
        echo "Please access http://localhost:$PORT/src/ in your browser"
        echo ""
        echo "Press Ctrl+C to stop the server"
        echo ""
        npx http-server -p "$PORT"
    else
        echo "Node.js found but npx is not available."
        echo "Please install http-server globally: npm install -g http-server"
        exit 1
    fi
elif command -v ruby &> /dev/null; then
    echo "Starting server with Ruby..."
    echo "Please access http://localhost:$PORT/src/ in your browser"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    ruby -run -e httpd . -p "$PORT"
else
    echo "Error: No suitable server tool found."
    echo "Please install one of the following:"
    echo "  - Python 3 (recommended)"
    echo "  - Node.js"
    echo "  - Ruby"
    echo ""
    echo "Or open src/index.html directly in your browser."
    echo "(Note: Problem file auto-loading feature will not work)"
    exit 1
fi