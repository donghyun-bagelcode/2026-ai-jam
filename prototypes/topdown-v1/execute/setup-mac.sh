#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$SCRIPT_DIR"

echo "[setup] macOS 실행 준비를 시작합니다..."

echo "[setup] quarantine 속성 제거"
xattr -cr "$SCRIPT_DIR" || true

echo "[setup] .command 실행 권한 부여"
while IFS= read -r -d '' file; do
  chmod +x "$file"
  xattr -cr "$file" || true
  echo "  - prepared: $(basename "$file")"
done < <(find "$SCRIPT_DIR" -maxdepth 1 -type f -name "*.command" -print0)

echo
echo "[setup] 완료"
echo "다음 단계: run-mac.command 더블클릭"
