import { getPixi } from './pixi.js';

const STAGE_COUNT = 10;

const STAGE_META = Array.from({ length: STAGE_COUNT }, (_, i) => ({
  id: i + 1,
  status: i === 0 ? 'current' : 'locked',
  playable: i === 0,
}));

export const createLobbyScene = ({ app, textures, onSelectStage }) => {
  const PIXI = getPixi();
  if (!PIXI) {
    throw new Error('PixiJS 인스턴스를 찾지 못했습니다.');
  }

  const container = new PIXI.Container();
  container.visible = false;

  const bg = new PIXI.Sprite(textures.lobbyBg);
  container.addChild(bg);

  const title = new PIXI.Text('WORLD 1', {
    fontFamily: 'Avenir Next, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    fontWeight: '700',
    fontSize: 42,
    fill: 0xffffff,
    stroke: 0x1f2937,
    strokeThickness: 5,
  });
  title.anchor.set(0.5, 0.5);
  container.addChild(title);

  const starBar = new PIXI.Sprite(textures.starCollect);
  starBar.anchor.set(0.5, 0.5);
  container.addChild(starBar);

  const topBack = new PIXI.Sprite(textures.back);
  topBack.anchor.set(0.5, 0.5);
  topBack.eventMode = 'static';
  topBack.cursor = 'pointer';
  container.addChild(topBack);

  const topHome = new PIXI.Sprite(textures.home);
  topHome.anchor.set(0.5, 0.5);
  topHome.eventMode = 'static';
  topHome.cursor = 'pointer';
  container.addChild(topHome);

  const pageButton = new PIXI.Sprite(textures.pageButton);
  pageButton.anchor.set(0.5, 0.5);
  pageButton.eventMode = 'static';
  pageButton.cursor = 'pointer';
  container.addChild(pageButton);

  const stageNodes = STAGE_META.map((meta) => createStageNode(PIXI, textures, meta, onSelectStage));
  for (const node of stageNodes) {
    container.addChild(node.button);
    if (node.numberSprite) {
      container.addChild(node.numberSprite);
    }
    if (node.numberText) {
      container.addChild(node.numberText);
    }
  }

  const onResize = () => {
    const w = app.renderer.width;
    const h = app.renderer.height;

    layoutCover(bg, w, h);

    title.position.set(w * 0.5, h * 0.09);
    title.style.fontSize = Math.max(28, Math.round(w * 0.08));

    fitByWidth(starBar, w * 0.34);
    starBar.position.set(w * 0.5, h * 0.15);

    fitByWidth(topBack, w * 0.095);
    topBack.position.set(w * 0.09, h * 0.075);

    fitByWidth(topHome, w * 0.095);
    topHome.position.set(w * 0.2, h * 0.075);

    fitByWidth(pageButton, w * 0.11);
    pageButton.position.set(w * 0.91, h * 0.93);

    const points = getSPathPoints(w, h, STAGE_COUNT);
    const stageSize = w * 0.18;

    stageNodes.forEach((node, idx) => {
      const p = points[idx];
      fitByWidth(node.button, stageSize);
      node.button.position.set(p.x, p.y);

      if (node.numberSprite) {
        fitByWidth(node.numberSprite, stageSize * 0.34);
        node.numberSprite.position.set(p.x, p.y + stageSize * 0.02);
      }

      if (node.numberText) {
        node.numberText.style.fontSize = Math.max(16, Math.round(stageSize * 0.2));
        node.numberText.position.set(p.x, p.y + stageSize * 0.02);
      }
    });
  };

  return {
    container,
    onEnter: () => onResize(),
    onExit: () => {},
    onResize,
  };
};

const createStageNode = (PIXI, textures, meta, onSelectStage) => {
  const buttonTexture = pickStageTexture(textures, meta.status);
  const button = new PIXI.Sprite(buttonTexture);
  button.anchor.set(0.5, 0.5);

  button.eventMode = 'static';
  button.cursor = meta.playable ? 'pointer' : 'default';
  button.alpha = meta.playable ? 1 : 0.94;

  if (meta.playable) {
    button.on('pointertap', () => onSelectStage?.(meta.id));
  }

  let numberSprite = null;
  let numberText = null;

  if (meta.id >= 1 && meta.id <= 9) {
    numberSprite = new PIXI.Sprite(textures[`num${meta.id}`]);
    numberSprite.anchor.set(0.5, 0.5);
  } else {
    numberText = new PIXI.Text(String(meta.id), {
      fontFamily: 'Avenir Next, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      fontWeight: '800',
      fontSize: 24,
      fill: 0xffffff,
      stroke: 0x111827,
      strokeThickness: 4,
    });
    numberText.anchor.set(0.5, 0.5);
  }

  return { button, numberSprite, numberText };
};

const pickStageTexture = (textures, status) => {
  if (status === 'clear') {
    return textures.stageYellow;
  }
  if (status === 'unlocked') {
    return textures.stageBlue;
  }
  if (status === 'current') {
    return textures.stageCurrent;
  }
  return textures.stageRed;
};

const layoutCover = (sprite, viewW, viewH) => {
  const scale = Math.max(viewW / sprite.texture.width, viewH / sprite.texture.height);
  sprite.scale.set(scale);
  sprite.x = (viewW - sprite.texture.width * scale) * 0.5;
  sprite.y = (viewH - sprite.texture.height * scale) * 0.5;
};

const fitByWidth = (sprite, targetWidth) => {
  const ratio = sprite.texture.height / sprite.texture.width;
  sprite.width = targetWidth;
  sprite.height = targetWidth * ratio;
};

const getSPathPoints = (w, h, count) => {
  const points = [];
  const top = h * 0.24;
  const bottom = h * 0.83;
  const mid = w * 0.5;
  const amp = w * 0.22;

  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : i / (count - 1);
    const y = bottom - (bottom - top) * t;
    const x = mid + Math.sin((t * Math.PI * 2.2) + 0.3) * amp;
    points.push({ x, y });
  }

  return points;
};
