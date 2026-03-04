export const GRID_SIZE = 7;
export const TILE_SIZE = 64;
export const TILE_GAP = 8;
export const BOARD_PADDING = 20;
export const SLIDE_DURATION_MS = 260;

export const COLORS = {
  bg: 0xf0f2f5,
  floor: 0xdadfe5,
  wall: 0x3d4652,
  player: 0x2f80ed,
};

export const MAP_WALLS = [
  { x: 0, y: 2 },
  { x: 6, y: 2 },
  { x: 0, y: 4 },
  { x: 6, y: 4 },
  { x: 2, y: 0 },
  { x: 4, y: 0 },
  { x: 2, y: 6 },
  { x: 4, y: 6 },
  { x: 3, y: 2 },
  { x: 3, y: 4 },
];

export const PLAYER_START = { x: 3, y: 6 };

export const SWIPE_MIN_DISTANCE = 28;
