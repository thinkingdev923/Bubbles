import {
  animate,
  generateCanvas,
  findBallAtPoint,
  randomBetween,
} from "./helpers.js";
import {
  makeBall,
  checkBallCollision,
  adjustBallPositions,
  resolveBallCollision,
} from "./ball.js";
import { makeRipple } from "./ripple.js";
import { centerTextBlock } from "./centerTextBlock.js";
import { makeAudioManager } from "./audio.js";
import { makeCountdown } from "./countdown.js";
import { makeLifeManager } from "./lives.js";
import { makeLevelManager } from "./level.js";
import { randomColor } from "./colors.js";
import { drawScore } from "./score.js";

const [CTX, canvasWidth, canvasHeight] = generateCanvas({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: "#canvas",
});
const audioManager = makeAudioManager();
const lifeManager = makeLifeManager(CTX, canvasWidth, canvasHeight);
const levelManager = makeLevelManager(
  CTX,
  canvasWidth,
  canvasHeight,
  onLevelEnd,
  onAdvance
);
let clicksTotal;
let ballsPoppedTotal;
let ballsMissedTotal;
let clicksRound;
let ballsPoppedRound;
let ballsMissedRound;
let balls;
let ripples;
let gameOverCountdown;

function handleBallClick({ clientX: x, clientY: y }) {
  const collidingBall = findBallAtPoint(balls, { x, y });
  clicksTotal++;
  clicksRound++;

  if (collidingBall) {
    collidingBall.pop();
    audioManager.playRandomPluck();
  } else {
    ripples.push(makeRipple(CTX, { x, y }));
    audioManager.playRandomFireworks();
  }
}

function handleBallTouch(e) {
  for (let index = 0; index < e.touches.length; index++) {
    handleBallClick(e.touches[index]);
  }

  e.preventDefault();
}

document.addEventListener("touchmove", (e) => e.preventDefault(), {
  passive: false,
});

restartGame();
animate((deltaTime) => {
  CTX.clearRect(0, 0, canvasWidth, canvasHeight);

  balls.forEach((b) => b.update(deltaTime));

  // Run collisions
  getBallsInPlay().forEach((ballA) => {
    getBallsInPlay().forEach((ballB) => {
      if (ballA !== ballB) {
        const collision = checkBallCollision(ballA, ballB);
        if (collision[0]) {
          adjustBallPositions(ballA, ballB, collision[1]);
          resolveBallCollision(ballA, ballB);
        }
      }
    });
  });

  // Draw level +life text underneath balls
  if (!levelManager.isGameOver()) {
    // Always draw lives
    levelManager.drawLevelNumber();
    lifeManager.draw();
  }

  // Draw balls and ripples
  ripples.forEach((r) => r.draw());
  balls.forEach((b) => b.draw(deltaTime));

  levelManager.drawInterstitialMessage({
    initialMessage: () =>
      centerTextBlock(CTX, canvasWidth, canvasHeight, [`Pop the bubble`]),
    firstMissMessage: () =>
      centerTextBlock(CTX, canvasWidth, canvasHeight, [
        `Miss a bubble, lose a life`,
      ]),
    defaultMessage: (timeElapsed) =>
      drawScore(
        CTX,
        canvasWidth,
        canvasHeight,
        clicksRound,
        ballsPoppedRound,
        ballsMissedRound,
        timeElapsed
      ),
    endGameMessage: (timeElapsed) => {
      drawScore(
        CTX,
        canvasWidth,
        canvasHeight,
        clicksTotal,
        ballsPoppedTotal,
        ballsMissedTotal,
        timeElapsed
      );
      CTX.save();
      CTX.translate(canvasWidth / 2, canvasHeight - 200);
      gameOverCountdown.draw();
      CTX.restore();
    },
  });
});

function restartGame() {
  gameOverCountdown = false;
  clicksTotal = 0;
  ballsPoppedTotal = 0;
  ballsMissedTotal = 0;
  clicksRound = 0;
  ballsPoppedRound = 0;
  ballsMissedRound = 0;
  balls = [];
  ripples = [];
  levelManager.reset();
  lifeManager.reset();
  levelManager.advanceLevel();
}

function onGameEnd() {
  audioManager.playLose();
  levelManager.onGameOver();

  document.removeEventListener("click", handleBallClick);
  document.removeEventListener("touchstart", handleBallTouch, {
    passive: false,
  });

  gameOverCountdown = makeCountdown(CTX, 5, () => {
    document.addEventListener("click", restartGame, { once: true });
    document.addEventListener("touchstart", restartGame, {
      passive: false,
      once: true,
    });
  });
}

function onLevelEnd() {
  audioManager.playLevel();
  document.removeEventListener("click", handleBallClick);
  document.removeEventListener("touchstart", handleBallTouch, {
    passive: false,
  });
}

function onAdvance() {
  clicksRound = 0;
  ballsPoppedRound = 0;
  ballsMissedRound = 0;
  // Allow popping animation to finish playing for previous level balls
  balls = balls
    .filter((b) => b.isPopped() && b.shouldRender())
    .concat(makeRandomBalls(getNumBalls()));
  ripples = [];
  audioManager.initialize();
  document.addEventListener("click", handleBallClick);
  document.addEventListener("touchstart", handleBallTouch, {
    passive: false,
  });
}

function onPop() {
  ballsPoppedTotal++;
  ballsPoppedRound++;

  if (getBallsRemaining() <= 0) {
    levelManager.advanceLevel();
  }
}

function onMiss() {
  if (!levelManager.isGameOver()) {
    ballsMissedTotal++;
    ballsMissedRound++;
    lifeManager.subtract();
    audioManager.playMiss();
    levelManager.setFirstMiss();

    if (lifeManager.getLives() <= 0) {
      onGameEnd();
    } else if (getBallsRemaining() <= 0) {
      levelManager.advanceLevel();
    }
  }
}

function getBallsInPlay() {
  return balls.filter((b) => b.isRemaining() && b.shouldRender());
}

function getBallsRemaining() {
  return balls.filter((b) => b.isRemaining());
}

function getNumBalls() {
  return Math.floor(levelManager.getLevel() * 1.4);
}

function makeRandomBalls(num) {
  const radius = 44;
  return new Array(num).fill().map(() =>
    makeBall(
      CTX,
      canvasWidth,
      canvasHeight,
      {
        startPosition: {
          x: randomBetween(canvasWidth / 8, canvasWidth - canvasWidth / 8),
          y: -radius,
        },
        startVelocity: {
          x: randomBetween(-12, 12),
          y: 0,
        },
        radius,
        fill: randomColor(),
        delay: randomBetween(0, num * 400),
        shouldDrawTrajectory: false,
      },
      onPop,
      onMiss
    )
  );
}
