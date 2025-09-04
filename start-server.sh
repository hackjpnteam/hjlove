#!/bin/bash

echo "サーバー起動オプション"
echo "====================="
echo "1. Python HTTP Server (port 8000)"
echo "2. Python HTTP Server (port 3000)"
echo "3. Node.js Server (port 3001)"
echo ""
echo "どのサーバーを起動しますか？ (1-3): "
read choice

case $choice in
  1)
    echo "Starting Python server on http://localhost:8000"
    python3 -m http.server 8000
    ;;
  2)
    echo "Starting Python server on http://localhost:3000"
    python3 -m http.server 3000
    ;;
  3)
    echo "Starting Node.js server on http://localhost:3001"
    npm start
    ;;
  *)
    echo "Invalid choice"
    ;;
esac