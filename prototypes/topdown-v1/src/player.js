import { SLIDE_DURATION_MS, TILE_SIZE } from './config.js';
import { getPixi } from './pixi.js';

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);
const CHARACTER_SCALE = 1.28;
const CHARACTER_BOTTOM_OFFSET = -0.04;
const CHARACTER_X_OFFSET = -0.05;

export class Player {
  constructor(board, startCell, textures) {
    this.board = board;
    this.PIXI = getPixi();
    if (!this.PIXI) {
      throw new Error('PixiJS 인스턴스를 찾지 못했습니다.');
    }
    this.textures = textures;

    this.gridX = startCell.x;
    this.gridY = startCell.y;

    this.animating = false;
    this.fromPx = { x: 0, y: 0 };
    this.toPx = { x: 0, y: 0 };
    this.elapsedMs = 0;

    this.sprite = new this.PIXI.Sprite(this.textures.character);
    this.sprite.anchor.set(0.5, 1);
    this.applyObjectScale(this.sprite, CHARACTER_SCALE);
    this.board.objectLayer.addChild(this.sprite);

    this.syncSpriteToGrid();
  }

  syncSpriteToGrid() {
    const cell = this.board.toPixel(this.gridX, this.gridY);
    this.sprite.x = cell.x + TILE_SIZE * (0.5 + CHARACTER_X_OFFSET);
    this.sprite.y = cell.y + TILE_SIZE * (1 + CHARACTER_BOTTOM_OFFSET);
    this.sprite.zIndex = this.sprite.y;
  }

  isAnimating() {
    return this.animating;
  }

  getGridPosition() {
    return { x: this.gridX, y: this.gridY };
  }

  resetTo(startCell) {
    this.gridX = startCell.x;
    this.gridY = startCell.y;
    this.animating = false;
    this.elapsedMs = 0;
    this.syncSpriteToGrid();
  }

  trySlide(direction, options = {}) {
    if (this.animating) {
      return { moved: false, reason: 'animating', path: [] };
    }

    const { dest, path } = this.findStopCell(direction.dx, direction.dy, options.stopAtCell);
    if (dest.x === this.gridX && dest.y === this.gridY) {
      return { moved: false, reason: 'blocked', path: [] };
    }

    this.fromPx = { x: this.sprite.x, y: this.sprite.y };
    const targetCellPx = this.board.toPixel(dest.x, dest.y);
    this.toPx = {
      x: targetCellPx.x + TILE_SIZE * (0.5 + CHARACTER_X_OFFSET),
      y: targetCellPx.y + TILE_SIZE * (1 + CHARACTER_BOTTOM_OFFSET),
    };

    this.gridX = dest.x;
    this.gridY = dest.y;

    this.elapsedMs = 0;
    this.animating = true;
    return { moved: true, path, dest };
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
    this.sprite.zIndex = this.sprite.y;

    if (normalized >= 1) {
      this.animating = false;
      this.syncSpriteToGrid();
    }
  }

  findStopCell(dx, dy, stopAtCell) {
    let nextX = this.gridX;
    let nextY = this.gridY;
    const path = [];

    while (this.board.canStand(nextX + dx, nextY + dy)) {
      nextX += dx;
      nextY += dy;
      path.push({ x: nextX, y: nextY });
      if (stopAtCell && stopAtCell(nextX, nextY)) {
        break;
      }
    }

    return { dest: { x: nextX, y: nextY }, path };
  }

  applyObjectScale(sprite, scaleFactor) {
    const texW = sprite.texture.width || 1;
    const texH = sprite.texture.height || 1;
    const base = TILE_SIZE * scaleFactor;
    const fitScale = base / Math.max(texW, texH);
    sprite.width = texW * fitScale;
    sprite.height = texH * fitScale;
  }
}
