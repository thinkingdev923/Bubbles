import {
  animate,
  generateCanvas,
  randomBetween,
  findBallAtPoint,
} from "./helpers.js";
import {
  makeBall,
  checkBallCollision,
  adjustBallPositions,
  resolveBallCollision,
} from "./ball.js";
import { makeRipple } from "./ripple.js";
import { randomColor } from "./colors.js";
import { centerTextBlock } from "./centerTextBlock.js";
import { makeAudioManager } from "./audio.js";

const [CTX, canvasWidth, canvasHeight] = generateCanvas({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: "#canvas",
});
const audioManager = makeAudioManager();
let level;
let clicksTotal;
let ballsPoppedTotal;
let ballsMissedTotal;
let clicksRound;
let ballsPoppedRound;
let ballsMissedRound;
let firstMissLevel;
let lives;
let balls;
let ripples;
let gameOver;
let interstitialShowing;

function handleBallClick({ clientX: x, clientY: y }) {
  const collidingBall = findBallAtPoint(balls, { x, y });
  clicksTotal++;
  clicksRound++;

  if (collidingBall) {
    collidingBall.pop();
    audioManager.playRandomPluck();
  } else {
    ripples.push(makeRipple(CTX, { x, y }));
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

  // Run collisions
  getBallsInPlay().forEach((ballA) => {
    ballA.update(deltaTime);
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

  // Draw interstitial if active
  if (interstitialShowing) {
    level === 1
      ? centerTextBlock(CTX, canvasWidth, canvasHeight, [
          `Click the bubble`,
          `Click to continue`,
        ])
      : firstMissLevel && firstMissLevel === level - 1
      ? centerTextBlock(CTX, canvasWidth, canvasHeight, [
          `If you miss a ball you lose a life`,
          `Click to continue`,
        ])
      : centerTextBlock(CTX, canvasWidth, canvasHeight, [
          `Total Clicks: ${clicksRound}`,
          `Total Popped: ${ballsPoppedRound}`,
          `Accuracy: ${
            clicksRound > 0
              ? Math.floor((ballsPoppedRound / clicksRound) * 100)
              : 0
          }%`,
          `Click to continue`,
        ]);
  }

  // Draw level text underneath balls if interstitial is not showing
  else if (!gameOver) {
    CTX.save();
    CTX.font = "500 24px -apple-system, BlinkMacSystemFont, sans-serif";
    CTX.fillStyle = "#fff";
    CTX.fillText(`Level: ${level}`, 8, 32);
    CTX.translate(canvasWidth - 8, 0);
    CTX.textAlign = "right";
    CTX.fillText(`♥ ${lives}`, 0, 32);
    CTX.restore();
  }

  // Always draw lives
  if (!gameOver) {
    CTX.save();
    CTX.font = "500 24px -apple-system, BlinkMacSystemFont, sans-serif";
    CTX.fillStyle = "#fff";
    CTX.textAlign = "right";
    CTX.translate(canvasWidth - 8, 0);
    CTX.fillText(`♥ ${lives}`, 0, 32);
    CTX.restore();
  }

  // Draw balls and ripples
  ripples.forEach((r) => r.draw());
  balls.forEach((b) => b.draw(deltaTime));

  // Draw end game info over balls
  if (gameOver) {
    centerTextBlock(CTX, canvasWidth, canvasHeight, [
      `Max Level Reached: ${level}`,
      `Total Bubbles Played: ${ballsPoppedTotal + ballsMissedTotal}`,
      `Total Clicks: ${clicksTotal}`,
      `Total Popped: ${ballsPoppedTotal}`,
      `Accuracy: ${
        clicksTotal > 0 ? Math.floor((ballsPoppedTotal / clicksTotal) * 100) : 0
      }%`,
      `Click to restart`,
    ]);
  }
});

function advanceLevel() {
  level = level ? level + 1 : 1;

  interstitialShowing = true;

  const handleAdvance = () => {
    interstitialShowing = false;
    clicksRound = 0;
    ballsPoppedRound = 0;
    ballsMissedRound = 0;
    // Allow popping animation to finish playing for previous level balls
    balls = balls
      .filter((b) => b.isPopped() && b.shouldRender())
      .concat(makeRandomBalls(getNumBalls()));
    ripples = [];
  };

  // On interstitial continue
  document.addEventListener("click", handleAdvance, { once: true });
  document.addEventListener("touchstart", handleAdvance, {
    passive: false,
    once: true,
  });
}

function restartGame() {
  gameOver = false;
  level = false;
  clicksTotal = 0;
  ballsPoppedTotal = 0;
  ballsMissedTotal = 0;
  clicksRound = 0;
  ballsPoppedRound = 0;
  ballsMissedRound = 0;
  firstMissLevel = false;
  lives = 10;
  balls = [];
  ripples = [];
  advanceLevel();
  document.addEventListener("click", handleBallClick);
  document.addEventListener("touchstart", handleBallTouch, { passive: false });
}

function onGameEnd() {
  gameOver = true;

  document.removeEventListener("click", handleBallClick);
  document.removeEventListener("touchstart", handleBallTouch, {
    passive: false,
  });

  document.addEventListener("click", restartGame, { once: true });
  document.addEventListener("touchstart", restartGame, {
    passive: false,
    once: true,
  });
}

function onPop() {
  ballsPoppedTotal++;
  ballsPoppedRound++;

  if (getBallsRemaining() <= 0) {
    advanceLevel();
  }
}

function onMiss() {
  if (!gameOver) {
    ballsMissedTotal++;
    ballsMissedRound++;
    lives--;

    audioManager.playMiss();

    if (!firstMissLevel) firstMissLevel = level;

    if (lives <= 0) {
      onGameEnd();
    } else if (getBallsRemaining() <= 0) {
      advanceLevel();
    }
  }
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
      },
      onPop,
      onMiss
    )
  );
}

function getBallsInPlay() {
  return balls.filter((b) => b.isRemaining() && b.shouldRender());
}

function getBallsRemaining() {
  return balls.filter((b) => b.isRemaining());
}

function getNumBalls() {
  return Math.floor(level * 1.4);
}
