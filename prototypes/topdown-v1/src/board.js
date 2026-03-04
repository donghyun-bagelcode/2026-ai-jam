import { BOARD_PADDING, COLORS, GRID_SIZE, TILE_GAP, TILE_SIZE } from './config.js';
import { getPixi } from './pixi.js';

const wallKey = (x, y) => `${x},${y}`;

export class Board {
  constructor(stage, walls, keyCells, portalCell) {
    this.stage = stage;
    this.PIXI = getPixi();
    if (!this.PIXI) {
      throw new Error('PixiJS 인스턴스를 찾지 못했습니다.');
    }
    this.walls = new Set(walls.map((cell) => wallKey(cell.x, cell.y)));
    this.keyCellsInitial = keyCells.map((cell) => ({ ...cell }));
    this.keyCells = new Set(keyCells.map((cell) => wallKey(cell.x, cell.y)));
    this.portalCell = { ...portalCell };
    this.portalActive = false;

    this.container = new this.PIXI.Container();
    this.stage.addChild(this.container);
    this.objectLayer = new this.PIXI.Container();

    this.gridPixelSize = GRID_SIZE * TILE_SIZE + (GRID_SIZE - 1) * TILE_GAP;
    this.boardPixelSize = this.gridPixelSize + BOARD_PADDING * 2;

    this.draw();
  }

  layout(viewWidth, viewHeight) {
    this.container.x = Math.floor((viewWidth - this.boardPixelSize) / 2);
    this.container.y = Math.floor((viewHeight - this.boardPixelSize) / 2);
  }

  draw() {
    const bg = new this.PIXI.Graphics();
    bg.beginFill(0xffffff);
    bg.drawRoundedRect(0, 0, this.boardPixelSize, this.boardPixelSize, 24);
    bg.endFill();
    this.container.addChild(bg);

    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const tile = new this.PIXI.Graphics();
        tile.beginFill(COLORS.floor);
        tile.drawRoundedRect(0, 0, TILE_SIZE, TILE_SIZE, 12);
        tile.endFill();

        const world = this.toPixel(x, y);
        tile.x = world.x;
        tile.y = world.y;

        this.container.addChild(tile);

        if (this.isWall(x, y)) {
          const wall = new this.PIXI.Graphics();
          wall.beginFill(COLORS.wall);
          wall.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
          wall.endFill();
          wall.x = world.x;
          wall.y = world.y;
          this.container.addChild(wall);
        }
      }
    }

    this.container.addChild(this.objectLayer);
    this.renderObjects();
  }

  renderObjects() {
    this.objectLayer.removeChildren();
    this.renderPortal();
    this.renderKeys();
  }

  renderKeys() {
    for (const key of this.keyCells) {
      const [x, y] = key.split(',').map(Number);
      const keyGraphic = new this.PIXI.Graphics();
      keyGraphic.beginFill(COLORS.key);
      keyGraphic.drawCircle(0, 0, TILE_SIZE * 0.18);
      keyGraphic.endFill();
      const pos = this.toPixel(x, y);
      keyGraphic.x = pos.x + TILE_SIZE * 0.5;
      keyGraphic.y = pos.y + TILE_SIZE * 0.5;
      this.objectLayer.addChild(keyGraphic);
    }
  }

  renderPortal() {
    const portal = new this.PIXI.Graphics();
    const pos = this.toPixel(this.portalCell.x, this.portalCell.y);
    portal.x = pos.x + TILE_SIZE * 0.5;
    portal.y = pos.y + TILE_SIZE * 0.5;

    portal.lineStyle(4, 0xffffff, 0.75);
    portal.beginFill(this.portalActive ? COLORS.portalActive : COLORS.portalInactive);
    portal.drawCircle(0, 0, TILE_SIZE * 0.28);
    portal.endFill();
    this.objectLayer.addChild(portal);
  }

  isWall(x, y) {
    return this.walls.has(wallKey(x, y));
  }

  isInside(x, y) {
    return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
  }

  canStand(x, y) {
    return this.isInside(x, y) && !this.isWall(x, y);
  }

  collectKeysOnPath(pathCells) {
    let collected = 0;
    for (const cell of pathCells) {
      const key = wallKey(cell.x, cell.y);
      if (this.keyCells.has(key)) {
        this.keyCells.delete(key);
        collected += 1;
      }
    }
    if (collected > 0) {
      this.renderObjects();
    }
    return collected;
  }

  setPortalActive(active) {
    this.portalActive = active;
    this.renderObjects();
  }

  isPortalOnPath(pathCells) {
    return pathCells.some((cell) => cell.x === this.portalCell.x && cell.y === this.portalCell.y);
  }

  resetObjects() {
    this.keyCells = new Set(this.keyCellsInitial.map((cell) => wallKey(cell.x, cell.y)));
    this.portalActive = false;
    this.renderObjects();
  }

  toPixel(gridX, gridY) {
    return {
      x: BOARD_PADDING + gridX * (TILE_SIZE + TILE_GAP),
      y: BOARD_PADDING + gridY * (TILE_SIZE + TILE_GAP),
    };
  }
}
