import { getPixi } from './pixi.js';

const STAGE_COUNT = 10;

const STAGE_META = Array.from({ length: STAGE_COUNT }, (_, i) => ({
  id: i + 1,
  status: i === 0 ? 'current' : 'locked',
  playable: i === 0,
}));

// 0_guide.png(1080x1920) 기준 정규화 좌표
const STAGE_POS_NORM = {
  1: { x: 0.38, y: 0.90 },
  2: { x: 0.66, y: 0.84 },
  3: { x: 0.49, y: 0.78 },
  4: { x: 0.28, y: 0.72 },
  5: { x: 0.47, y: 0.66 },
  6: { x: 0.66, y: 0.62 },
  7: { x: 0.52, y: 0.55 },
  8: { x: 0.36, y: 0.49 },
  9: { x: 0.52, y: 0.43 },
  10: { x: 0.57, y: 0.34 },
};

const UI_POS_NORM = {
  worldTitle: { x: 0.5, y: 0.09 },
  starBar: { x: 0.5, y: 0.16 },
  back: { x: 0.06, y: 0.06 },
  home: { x: 0.14, y: 0.06 },
  page: { x: 0.92, y: 0.93 },
};

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
    const bgRect = layoutContainTop(bg, w, h);

    placeNormalized(title, bgRect, UI_POS_NORM.worldTitle);
    title.style.fontSize = Math.max(28, Math.round(bgRect.width * 0.08));

    fitByWidth(starBar, bgRect.width * 0.34);
    placeNormalized(starBar, bgRect, UI_POS_NORM.starBar);

    fitByWidth(topBack, bgRect.width * 0.10);
    placeNormalized(topBack, bgRect, UI_POS_NORM.back);

    fitByWidth(topHome, bgRect.width * 0.10);
    placeNormalized(topHome, bgRect, UI_POS_NORM.home);

    fitByWidth(pageButton, bgRect.width * 0.12);
    placeNormalized(pageButton, bgRect, UI_POS_NORM.page);

    const stageSize = bgRect.width * 0.17;

    stageNodes.forEach((node) => {
      const p = STAGE_POS_NORM[node.id];
      fitByWidth(node.button, stageSize);
      placeNormalized(node.button, bgRect, p);

      if (node.numberSprite) {
        fitByWidth(node.numberSprite, stageSize * 0.34);
        placeNormalized(node.numberSprite, bgRect, { x: p.x, y: p.y + 0.006 });
      }

      if (node.numberText) {
        node.numberText.style.fontSize = Math.max(16, Math.round(stageSize * 0.2));
        placeNormalized(node.numberText, bgRect, { x: p.x, y: p.y + 0.006 });
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

  return { id: meta.id, button, numberSprite, numberText };
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

const layoutContainTop = (sprite, viewW, viewH) => {
  const scale = Math.min(viewW / sprite.texture.width, viewH / sprite.texture.height);
  sprite.scale.set(scale);
  sprite.x = (viewW - sprite.texture.width * scale) * 0.5;
  sprite.y = 0;
  return {
    x: sprite.x,
    y: sprite.y,
    width: sprite.texture.width * scale,
    height: sprite.texture.height * scale,
  };
};

const placeNormalized = (displayObject, bgRect, norm) => {
  displayObject.position.set(bgRect.x + bgRect.width * norm.x, bgRect.y + bgRect.height * norm.y);
};

const fitByWidth = (sprite, targetWidth) => {
  const ratio = sprite.texture.height / sprite.texture.width;
  sprite.width = targetWidth;
  sprite.height = targetWidth * ratio;
};
