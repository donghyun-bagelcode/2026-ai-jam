---
name: min-move-solver
description: >-
  슬라이드 퍼즐의 최소 이동 횟수(M)를 계산하는 알고리즘 구현.
  "최소 이동", "M값 계산", "BFS", "최적 경로", "솔버" 등의 요청에 사용.
---

# Min Move Solver — 최소 이동 횟수(M) 계산

## 목적

스테이지의 최소 이동 횟수(M)를 계산한다.
M은 별 평가의 기준값이다 (P==M → 3별, P<=M+2 → 2별, 그 외 → 1별).

## 상태 공간 정의

슬라이드 퍼즐의 상태는 단순 위치가 아니다:

```
State = (playerPosition, collectedKeys, portalActive)
```

- `playerPosition`: 격자 좌표 (row, col)
- `collectedKeys`: 비트마스크 (3개 키 → 0b000 ~ 0b111)
- `portalActive`: collectedKeys === 0b111 이면 true

상태 공간 크기: `gridCells × 8(키 조합) = 최대 ~400 상태` (7×7 격자 기준)

## 알고리즘: BFS

- 시작 상태: (startPos, 0b000, false)
- 목표 상태: portalActive === true && playerPosition === portalPosition
- 전이: 4방향 슬라이드 (벽까지 이동, 경로 상 키 수집 반영)
- 비용: 슬라이드 1회 = 1

### 주의사항

- 슬라이드 경로 위의 키를 모두 수집해야 함 (도착지만 보면 안 됨)
- 비활성 포탈은 벽으로 취급 (슬라이드가 포탈에서 멈춤)
- 활성 포탈은 통과 가능하되, 도달하면 클리어

## 구현 시 보완할 내용

- [ ] 구체적 TypeScript 코드 구조
- [ ] 테스트 케이스 (알려진 M값을 가진 샘플 스테이지)
- [ ] 성능 최적화 (필요 시)
