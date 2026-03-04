import { Board } from './board.js';
import { COLORS, MAP_WALLS, PLAYER_START } from './config.js';
import { DebugUI } from './debug-ui.js';
import { DirectionClickInput } from './input.js';
import { Player } from './player.js';
import { waitForPixi } from './pixi.js';

let debugUi = null;

const bootstrap = async () => {
  const root = document.getElementById('app');

  if (!root) {
    throw new Error('app container(#app)을 찾지 못했습니다.');
  }
  debugUi = new DebugUI(root);
  setupGlobalErrorCapture();

  const app = await createPixiApp(root);
  root.appendChild(app.canvas ?? app.view);

  const board = new Board(app.stage, MAP_WALLS);
  const player = new Player(board, PLAYER_START);
  const initial = player.getGridPosition();
  debugUi.setState({ grid: `(${initial.x}, ${initial.y})`, animating: player.isAnimating() });

  const layout = () => {
    board.layout(app.renderer.width, app.renderer.height);
  };
  layout();

  window.addEventListener('resize', layout);

  new DirectionClickInput(
    app.canvas ?? app.view,
    () => getPlayerRendererPosition(player, board),
    (direction) => {
      const before = player.getGridPosition();
      const wasAnimating = player.isAnimating();
      const moved = !wasAnimating && player.trySlide(direction);
      const after = player.getGridPosition();
      debugUi.logMove(
        `before=(${before.x},${before.y}) after=(${after.x},${after.y}) anim=${wasAnimating} moved=${moved}`
      );
      debugUi.setState({ grid: `(${after.x}, ${after.y})`, animating: player.isAnimating() });
    },
    {
      onClick: ({ x, y, originX, originY, dx, dy }) => {
        debugUi.logInput(
          `click at=(${Math.round(x)},${Math.round(y)}) origin=(${Math.round(originX)},${Math.round(
            originY
          )}) dx=${Math.round(dx)} dy=${Math.round(dy)}`
        );
      },
      onDecision: ({ accepted, directionName, reason, dx, dy }) => {
        const direction = directionName ?? `rejected:${reason}`;
        debugUi.logInput(
          `decision dx=${Math.round(dx)} dy=${Math.round(dy)} dir=${direction} accepted=${accepted}`
        );
      },
    }
  );

  app.ticker.add(() => {
    const deltaMs = app.ticker.deltaMS;
    player.update(deltaMs);
    const pos = player.getGridPosition();
    debugUi.setState({ grid: `(${pos.x}, ${pos.y})`, animating: player.isAnimating() });
  });
};

const createPixiApp = async (root) => {
  const PIXI = await waitForPixi(3000);
  if (!PIXI) {
    throw new Error('PixiJS 로딩 실패: 네트워크 또는 CDN 접근 상태를 확인하세요.');
  }

  const options = {
    backgroundColor: COLORS.bg,
    resizeTo: root,
    antialias: true,
  };

  const app = new PIXI.Application(options);
  if (typeof app.init === 'function') {
    await app.init({
      background: COLORS.bg,
      resizeTo: root,
      antialias: true,
    });
  }

  return app;
};

const getPlayerRendererPosition = (player, board) => ({
  x: board.container.x + player.sprite.x,
  y: board.container.y + player.sprite.y,
});

const setupGlobalErrorCapture = () => {
  window.addEventListener('error', (event) => {
    const message = event.error?.stack || event.message || 'unknown error';
    debugUi?.logError(message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.stack || String(event.reason);
    debugUi?.logError(`promise: ${message}`);
  });

  const originalConsoleError = console.error.bind(console);
  console.error = (...args) => {
    const message = args
      .map((item) => {
        if (item instanceof Error) {
          return item.stack || item.message;
        }
        if (typeof item === 'string') {
          return item;
        }
        try {
          return JSON.stringify(item);
        } catch {
          return String(item);
        }
      })
      .join(' ');
    debugUi?.logError(message);
    originalConsoleError(...args);
  };
};

bootstrap().catch((error) => {
  console.error(error);
  const root = document.getElementById('app');
  if (root) {
    root.innerHTML = '<pre style="padding:16px;color:#b00020;">초기화 실패: 콘솔 오류를 확인하세요.</pre>';
  }
});
