import { BOARD_PADDING, COLORS, GRID_SIZE, TILE_GAP, TILE_SIZE } from './config.js';
import { getPixi } from './pixi.js';

const wallKey = (x, y) => `${x},${y}`;

export class Board {
  constructor(stage, walls) {
    this.stage = stage;
    this.PIXI = getPixi();
    if (!this.PIXI) {
      throw new Error('PixiJS 인스턴스를 찾지 못했습니다.');
    }
    this.walls = new Set(walls.map((cell) => wallKey(cell.x, cell.y)));

    this.container = new this.PIXI.Container();
    this.stage.addChild(this.container);

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

  toPixel(gridX, gridY) {
    return {
      x: BOARD_PADDING + gridX * (TILE_SIZE + TILE_GAP),
      y: BOARD_PADDING + gridY * (TILE_SIZE + TILE_GAP),
    };
  }
}
