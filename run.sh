#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

BACKEND_PID=""
FRONTEND_PID=""

get_lan_ip() {
  local ip=""

  if command -v hostname >/dev/null 2>&1; then
    ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
    if [ -n "$ip" ]; then
      echo "$ip"
      return 0
    fi
  fi

  if command -v ipconfig >/dev/null 2>&1; then
    ip="$(ipconfig 2>/dev/null | awk '/IPv4 Address|IPv4/{gsub("\r",""); print $NF; exit}')"
    if [ -n "$ip" ]; then
      echo "$ip"
      return 0
    fi
  fi

  echo "YOUR_PC_IP"
}

LAN_IP="$(get_lan_ip)"

cleanup() {
  echo
  echo "Stopping backend and frontend..."

  if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "Starting backend on http://localhost:8081"
(
  cd "$BACKEND_DIR"
  if [ -f "./mvnw" ]; then
    chmod +x ./mvnw 2>/dev/null || true
    ./mvnw spring-boot:run
  elif [ -f "./mvnw.cmd" ]; then
    ./mvnw.cmd spring-boot:run
  else
    mvn spring-boot:run
  fi
) &
BACKEND_PID=$!

echo "Starting frontend on http://localhost:3000"
echo "Phone URL: http://$LAN_IP:3000"
(
  cd "$FRONTEND_DIR"
  if command -v yarn >/dev/null 2>&1; then
    yarn dev --host 0.0.0.0
  else
    npm run dev -- --host 0.0.0.0
  fi
) &
FRONTEND_PID=$!

echo
echo "Backend PID : $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo
echo "Open on this PC : http://localhost:3000"
echo "Open on phone   : http://$LAN_IP:3000"
echo "Make sure your phone and PC are on the same Wi-Fi."
echo "Press Ctrl+C to stop both servers."
echo

wait -n "$BACKEND_PID" "$FRONTEND_PID"

