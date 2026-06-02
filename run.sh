#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

BACKEND_PID=""
FRONTEND_PID=""

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
echo "Press Ctrl+C to stop both servers."
echo

wait -n "$BACKEND_PID" "$FRONTEND_PID"

