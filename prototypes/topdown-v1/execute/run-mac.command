#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PORT="${1:-3000}"
URL="http://localhost:${PORT}"
LOG_FILE="$PROJECT_DIR/.server-${PORT}.log"
PID_FILE="$PROJECT_DIR/.server-${PORT}.pid"

cd "$PROJECT_DIR"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3를 찾을 수 없습니다."
  echo "설치 후 다시 실행해 주세요."
  exit 1
fi

is_running() {
  local pid=""
  if [[ -f "$PID_FILE" ]]; then
    pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  fi

  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    return 0
  fi

  return 1
}

if ! is_running; then
  nohup python3 -m http.server "$PORT" >"$LOG_FILE" 2>&1 &
  echo $! >"$PID_FILE"
  sleep 0.5
fi

open "$URL"

echo "Server URL: $URL"
echo "Log file: $LOG_FILE"
echo "Stop: kill \$(cat $PID_FILE)"
echo "최초 실행 문제 시: bash setup-mac.sh"
