import { makeCanvasManager } from "./canvas.js";
import { animate, findBallAtPoint, randomBetween } from "./helpers.js";
import {
  makeBall,
  checkBallCollision,
  adjustBallPositions,
  resolveBallCollision,
} from "./ball.js";
import { makeRipple } from "./ripple.js";
import { makeAudioManager } from "./audio.js";
import { makeLifeManager } from "./lives.js";
import { makeLevelManager } from "./level.js";
import { makeContinueButtonManager } from "./continueButton.js";
import { centerTextBlock } from "./centerTextBlock.js";
import { randomColor } from "./colors.js";
import { drawScore } from "./score.js";

const canvasManager = makeCanvasManager({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: "#canvas",
});
const audioManager = makeAudioManager();
const lifeManager = makeLifeManager(canvasManager);
const levelManager = makeLevelManager(canvasManager, onLevelAdvance);
const continueButtonManager = makeContinueButtonManager(canvasManager);
const CTX = canvasManager.getContext();
let clicksTotal;
let ballsPoppedTotal;
let ballsMissedTotal;
let clicksRound;
let ballsPoppedRound;
let ballsMissedRound;
let balls;
let ripples;

function restartGame() {
  clicksTotal = 0;
  ballsPoppedTotal = 0;
  ballsMissedTotal = 0;
  clicksRound = 0;
  ballsPoppedRound = 0;
  ballsMissedRound = 0;
  balls = [];
  ripples = [];
  lifeManager.reset();
  levelManager.reset();
  levelManager.showLevelInterstitial();
}
restartGame();

document.addEventListener("pointerdown", (e) => {
  if (levelManager.isGameOver()) {
    if (continueButtonManager.wasButtonClicked(e.clientX, e.clientY)) {
      restartGame();
    }
  } else if (levelManager.isInterstitialShowing()) {
    if (continueButtonManager.wasButtonClicked(e.clientX, e.clientY)) {
      levelManager.dismissInterstitialAndAdvanceLevel();
    }
  } else {
    handleBallClick(e);
  }
});

document.addEventListener("touchmove", (e) => e.preventDefault(), {
  passive: false,
});

animate((deltaTime) => {
  CTX.clearRect(0, 0, canvasManager.getWidth(), canvasManager.getHeight());

  // Calculate new positions for all balls
  balls.forEach((b) => b.update(deltaTime));

  // Run collision detection
  const ballsInPlay = balls.filter((b) => b.isRemaining() && b.shouldRender());
  ballsInPlay.forEach((ballA) => {
    ballsInPlay.forEach((ballB) => {
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
  levelManager.drawLevelNumber();

  if (!levelManager.isGameOver()) lifeManager.draw();

  // Draw ripples and balls
  ripples.forEach((r) => r.draw());
  balls.forEach((b) => b.draw(deltaTime));

  levelManager.drawInterstitialMessage({
    initialMessage: (msElapsed) => {
      centerTextBlock(canvasManager, [`Pop the bubble`]);
      continueButtonManager.draw(msElapsed, 0, "Play");
    },
    firstMissMessage: (msElapsed) => {
      centerTextBlock(canvasManager, [`Miss a bubble, lose a life`]);
      continueButtonManager.draw(msElapsed, 1000);
    },
    defaultMessage: (msElapsed) => {
      drawScore(
        canvasManager,
        clicksRound,
        ballsPoppedRound,
        ballsMissedRound,
        msElapsed
      );
      continueButtonManager.draw(msElapsed, 2000);
    },
    endGameMessage: (msElapsed) => {
      drawScore(
        canvasManager,
        clicksTotal,
        ballsPoppedTotal,
        ballsMissedTotal,
        msElapsed
      );
      continueButtonManager.draw(msElapsed, 2000, "Play Again");
    },
  });
});

function handleBallClick({ clientX: x, clientY: y }) {
  const collidingBall = findBallAtPoint(balls, { x, y });
  clicksTotal++;
  clicksRound++;

  if (collidingBall) {
    collidingBall.pop();
    audioManager.playRandomPluck();
  } else {
    ripples.push(makeRipple(canvasManager, { x, y }));
    audioManager.playRandomFireworks();
  }
}

function onPop() {
  ballsPoppedTotal++;
  ballsPoppedRound++;

  if (getBallsRemaining() <= 0) {
    levelManager.showLevelInterstitial();
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
      levelManager.showLevelInterstitial();
    }
  }
}

function onGameEnd() {
  audioManager.playLose();
  levelManager.onGameOver();
}

function onLevelAdvance() {
  clicksRound = 0;
  ballsPoppedRound = 0;
  ballsMissedRound = 0;
  const numBalls = Math.floor(levelManager.getLevel() * 1.4);
  // Allow popping animation to finish playing for previous level balls
  balls = balls
    .filter((b) => b.isPopped() && b.shouldRender())
    .concat(makeRandomBalls(numBalls));
  ripples = [];

  // Call on first interaction. Subsequent calls are ignored.
  audioManager.initialize();
  audioManager.playLevel();
}

function makeRandomBalls(num) {
  const radius = 44;
  return new Array(num).fill().map(() =>
    makeBall(
      canvasManager,
      {
        startPosition: {
          x: randomBetween(
            canvasManager.getWidth() / 8,
            canvasManager.getWidth() - canvasManager.getWidth() / 8
          ),
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

function getBallsRemaining() {
  return balls.filter((b) => b.isRemaining());
}
