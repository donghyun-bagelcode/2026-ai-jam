import { COLORS, SLIDE_DURATION_MS, TILE_SIZE } from './config.js';
import { getPixi } from './pixi.js';

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);

export class Player {
  constructor(board, startCell) {
    this.board = board;
    this.PIXI = getPixi();
    if (!this.PIXI) {
      throw new Error('PixiJS 인스턴스를 찾지 못했습니다.');
    }

    this.gridX = startCell.x;
    this.gridY = startCell.y;

    this.animating = false;
    this.fromPx = { x: 0, y: 0 };
    this.toPx = { x: 0, y: 0 };
    this.elapsedMs = 0;

    this.sprite = new this.PIXI.Graphics();
    this.sprite.beginFill(COLORS.player);
    this.sprite.drawCircle(0, 0, TILE_SIZE * 0.34);
    this.sprite.endFill();
    this.board.container.addChild(this.sprite);

    this.syncSpriteToGrid();
  }

  syncSpriteToGrid() {
    const cell = this.board.toPixel(this.gridX, this.gridY);
    this.sprite.x = cell.x + TILE_SIZE * 0.5;
    this.sprite.y = cell.y + TILE_SIZE * 0.5;
  }

  isAnimating() {
    return this.animating;
  }

  getGridPosition() {
    return { x: this.gridX, y: this.gridY };
  }

  trySlide(direction) {
    if (this.animating) {
      return false;
    }

    const dest = this.findStopCell(direction.dx, direction.dy);
    if (dest.x === this.gridX && dest.y === this.gridY) {
      return false;
    }

    this.fromPx = { x: this.sprite.x, y: this.sprite.y };
    const targetCellPx = this.board.toPixel(dest.x, dest.y);
    this.toPx = {
      x: targetCellPx.x + TILE_SIZE * 0.5,
      y: targetCellPx.y + TILE_SIZE * 0.5,
    };

    this.gridX = dest.x;
    this.gridY = dest.y;

    this.elapsedMs = 0;
    this.animating = true;
    return true;
  }

  update(deltaMs) {
    if (!this.animating) {
      return;
    }

    this.elapsedMs += deltaMs;
    const normalized = Math.min(this.elapsedMs / SLIDE_DURATION_MS, 1);
    const eased = easeInOutCubic(normalized);

    this.sprite.x = this.fromPx.x + (this.toPx.x - this.fromPx.x) * eased;
    this.sprite.y = this.fromPx.y + (this.toPx.y - this.fromPx.y) * eased;

    if (normalized >= 1) {
      this.animating = false;
      this.syncSpriteToGrid();
    }
  }

  findStopCell(dx, dy) {
    let nextX = this.gridX;
    let nextY = this.gridY;

    while (this.board.canStand(nextX + dx, nextY + dy)) {
      nextX += dx;
      nextY += dy;
    }

    return { x: nextX, y: nextY };
  }
}
