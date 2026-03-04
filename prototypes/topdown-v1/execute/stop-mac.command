#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PORT="${1:-3000}"
PID_FILE="$PROJECT_DIR/.server-${PORT}.pid"

cd "$PROJECT_DIR"

if [[ ! -f "$PID_FILE" ]]; then
  echo "PID 파일이 없습니다: $PID_FILE"
  echo "이미 종료되었거나 run-mac.command로 실행하지 않았을 수 있습니다."
  echo "최초 실행 전 설정: bash setup-mac.sh"
  exit 0
fi

PID="$(cat "$PID_FILE" 2>/dev/null || true)"
if [[ -z "$PID" ]]; then
  echo "PID 파일이 비어 있습니다."
  rm -f "$PID_FILE"
  exit 0
fi

if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  echo "서버 종료 완료 (pid: $PID, port: $PORT)"
else
  echo "프로세스가 이미 종료되어 있습니다 (pid: $PID)"
fi

rm -f "$PID_FILE"
