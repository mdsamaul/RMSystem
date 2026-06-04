#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
ENV_FILE="$ROOT_DIR/.env"

if [ -f "$ENV_FILE" ]; then
  set -a
  . "$ENV_FILE"
  set +a
fi

BACKEND_PID=""
FRONTEND_PID=""
BACKEND_PORT="${BACKEND_PORT:-8081}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
SERVER_ADDRESS="${SERVER_ADDRESS:-0.0.0.0}"

get_lan_ip() {
  if command -v powershell.exe >/dev/null 2>&1; then
    powershell.exe -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { `$_.IPAddress -notlike '127.*' -and `$_.IPAddress -notlike '169.254.*' -and `$_.PrefixOrigin -ne 'WellKnown' } | Select-Object -First 1 -ExpandProperty IPAddress" 2>/dev/null | tr -d '\r'
  elif command -v hostname >/dev/null 2>&1; then
    hostname -I 2>/dev/null | awk '{print $1}'
  fi
}

LAN_IP="${LAN_IP:-$(get_lan_ip)}"

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

echo "Starting backend on http://$SERVER_ADDRESS:$BACKEND_PORT"
(
  cd "$BACKEND_DIR"
  if [ -f "./mvnw" ]; then
    chmod +x ./mvnw 2>/dev/null || true
    ./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.address=$SERVER_ADDRESS --server.port=$BACKEND_PORT"
  elif [ -f "./mvnw.cmd" ]; then
    ./mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--server.address=$SERVER_ADDRESS --server.port=$BACKEND_PORT"
  else
    mvn spring-boot:run -Dspring-boot.run.arguments="--server.address=$SERVER_ADDRESS --server.port=$BACKEND_PORT"
  fi
) &
BACKEND_PID=$!

echo "Starting frontend on http://0.0.0.0:$FRONTEND_PORT"
(
  cd "$FRONTEND_DIR"
  if command -v yarn >/dev/null 2>&1; then
    yarn dev --host 0.0.0.0 --port "$FRONTEND_PORT"
  else
    npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT"
  fi
) &
FRONTEND_PID=$!

echo
echo "Backend PID : $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo
echo "Open on this PC       : http://localhost:$FRONTEND_PORT"
if [ -n "$LAN_IP" ]; then
  echo "Open from phone/PC    : http://$LAN_IP:$FRONTEND_PORT"
  echo "Backend health/base   : http://$LAN_IP:$BACKEND_PORT"
else
  echo "LAN IP was not detected. Use your PC IPv4 address with port $FRONTEND_PORT."
fi
echo "Press Ctrl+C to stop both servers."
echo

wait -n "$BACKEND_PID" "$FRONTEND_PID"

