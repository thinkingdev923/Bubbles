import { makeCanvasManager } from "./canvas.js";
import {
  animate,
  findBallAtPoint,
  randomBetween,
  transition,
} from "./helpers.js";
import {
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
import { drawScore } from "./score.js";
import { levels, makeLevelBalls } from "./levelData.js";
import { drawHoldBlastPreview, makeHoldBlast } from "./holdBlast.js";
import { BLAST_HOLD_THRESHOLD, SLINGSHOT_MOVE_THRESHOLD } from "./constants.js";

const URLParams = new URLSearchParams(window.location.search);
const previewData = JSON.parse(decodeURIComponent(URLParams.get("level")));
const previewDataPresent = !!window.location.search && previewData;

if (previewDataPresent) {
  const previewTitle = `Bubbles! - “${previewData.name}”`;
  const previewDesc = "Click to play this custom level preview";
  document.title = previewTitle;
  document
    .querySelector('meta[property="og:title"]')
    .setAttribute("content", previewTitle);
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", previewDesc);
  document
    .querySelector('meta[property="og:description"]')
    .setAttribute("content", previewDesc);
}

const canvasManager = makeCanvasManager({
  initialWidth: window.innerWidth,
  initialHeight: window.innerHeight,
  attachNode: "#canvas",
});
const audioManager = makeAudioManager();
const lifeManager = makeLifeManager(canvasManager);
const levelManager = makeLevelManager(
  canvasManager,
  onInterstitial,
  previewDataPresent ? onPreviewAdvance : onLevelAdvance,
  previewDataPresent
);
const continueButtonManager = makeContinueButtonManager(canvasManager);
const CTX = canvasManager.getContext();

// This one intentionally not reset on game restart
let usingTouch = null;

// These are all reset on game restart
let pointerData;
let holdBlasts;
let clicksTotal;
let ballsPoppedTotal;
let ballsMissedTotal;
let clicksRound;
let ballsPoppedRound;
let ballsMissedRound;
let balls;
let ripples;

function resetGame() {
  pointerData = [];
  holdBlasts = [];
  balls = [];
  ripples = [];
  clicksTotal = 0;
  ballsPoppedTotal = 0;
  ballsMissedTotal = 0;
  clicksRound = 0;
  ballsPoppedRound = 0;
  ballsMissedRound = 0;
  lifeManager.reset();
  levelManager.reset();
  levelManager.showLevelInterstitial();
  audioManager.resetPluckSequence();
}
resetGame();

function resetLevelData() {
  clicksRound = 0;
  ballsPoppedRound = 0;
  ballsMissedRound = 0;
  audioManager.resetPluckSequence();
}

function resetOngoingVisuals() {
  pointerData = [];
  holdBlasts = holdBlasts.filter((b) => !b.isGone());
  ripples = [];
}

document.addEventListener("pointerdown", (e) => {
  const { pointerId, pointerType, clientX: x, clientY: y } = e;

  if (usingTouch === null) usingTouch = pointerType === "touch";

  if (levelManager.isInterstitialShowing()) {
    continueButtonManager.handleClick(
      { x, y },
      levelManager.isGameOver() || levelManager.isLastLevel()
        ? resetGame
        : levelManager.dismissInterstitialAndAdvanceLevel
    );
  } else {
    pointerData.push({
      id: pointerId,
      startPosition: { x, y },
      currentPosition: { x, y },
      endPosition: null,
      holdStart: Date.now(),
    });

    handleGameClick({ x, y });
  }

  e.preventDefault();
});

document.addEventListener("pointerup", (e) => {
  const { pointerId, clientX: x, clientY: y } = e;

  pointerData.forEach((pointer, pointerIndex) => {
    if (pointerId === pointer.id) {
      pointer.currentPosition = { x, y };
      pointerData.splice(pointerIndex, 1);

      if (!levelManager.isInterstitialShowing())
        handleCompletePointerObject(pointer);
    }
  });

  e.preventDefault();
});

document.addEventListener("pointermove", (e) => {
  const { pointerId, clientX: x, clientY: y } = e;

  pointerData.forEach((pointer) => {
    if (pointerId === pointer.id) pointer.currentPosition = { x, y };
  });

  if (levelManager.isInterstitialShowing())
    continueButtonManager.handleHover({ x, y });

  e.preventDefault();
});

document.addEventListener("keydown", ({ key }) => {
  const validKey = key === " " || key === "Enter";

  if (validKey && levelManager.isGameOver()) {
    resetGame();
  } else if (validKey && levelManager.isInterstitialShowing()) {
    levelManager.dismissInterstitialAndAdvanceLevel();
  }
});

// Scale or translate the entire game
const cameraWrapper = (drawFunc) => {
  const activeHoldBlasts = holdBlasts.filter((b) => !b.isGone()).length;

  const cameraShake = (magnitudeProgress) => {
    const rotationAmount = transition(0, Math.PI / 90, magnitudeProgress);
    const shakeAmount = transition(0, 4, magnitudeProgress);

    // Translate to center and rotate randomly
    CTX.translate(canvasManager.getWidth() / 2, canvasManager.getHeight() / 2);
    CTX.rotate(randomBetween(-rotationAmount, rotationAmount));

    // Translate back to top left to reset w/o calling restore()
    CTX.translate(
      -canvasManager.getWidth() / 2,
      -canvasManager.getHeight() / 2
    );

    // Move canvas randomly
    CTX.translate(
      randomBetween(-shakeAmount, shakeAmount),
      randomBetween(-shakeAmount, shakeAmount)
    );
  };

  if (activeHoldBlasts) {
    CTX.save();
    cameraShake(0.5);
    drawFunc();
    CTX.restore();
  } else {
    drawFunc();
  }
};

animate((deltaTime) => {
  CTX.clearRect(0, 0, canvasManager.getWidth(), canvasManager.getHeight());

  cameraWrapper(() => {
    // Calculate new positions for all balls
    balls.forEach((b) => b.update(deltaTime));

    // Run collision detection on balls + holdBlasts
    const ballsInPlay = balls.filter(
      (b) => b.isRemaining() && b.shouldRender()
    );
    const currentBlasts = holdBlasts.filter((b) => !b.isGone());
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

      currentBlasts.forEach((blast) => {
        const collision = checkBallCollision(ballA, blast);
        if (collision[0]) {
          ballA.pop();
          audioManager.playSequentialPluck();
        }
      });
    });

    // Draw level + life text underneath balls
    levelManager.drawLevelNumber();

    if (!levelManager.isGameOver()) lifeManager.draw();

    // Draw ripples, balls, and hold blasts
    ripples.forEach((r) => r.draw());
    holdBlasts.forEach((b) => b.draw());
    balls.forEach((b) => b.draw(deltaTime));

    // Draw pointer hold circles
    // TODO Need to handle gesture previews better so we can show blasts vs slingshots
    pointerData.forEach((pointer) => {
      if (Date.now() - pointer.holdStart > BLAST_HOLD_THRESHOLD) {
        drawHoldBlastPreview(
          canvasManager,
          pointer.startPosition,
          pointer.holdStart
        );
      }
    });

    levelManager.drawInterstitialMessage({
      previewInitialMessage: (msElapsed) => {
        centerTextBlock(canvasManager, [`Preview of “${previewData.name}”`]);
        continueButtonManager.draw(msElapsed, 0, "Play Preview");
      },
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
          msElapsed,
          "Game over"
        );
        continueButtonManager.draw(msElapsed, 2000, "Try Again");
      },
      reachedEndOfGameMessage: (msElapsed) => {
        drawScore(
          canvasManager,
          clicksTotal,
          ballsPoppedTotal,
          ballsMissedTotal,
          msElapsed,
          "You beat all levels!"
        );
        continueButtonManager.draw(msElapsed, 2000, "Play Again");
      },
    });
  });
});

function handleGameClick({ x, y }) {
  const collidingBall = findBallAtPoint(balls, { x, y });
  clicksTotal++;
  clicksRound++;

  if (collidingBall) {
    collidingBall.pop();
    audioManager.playSequentialPluck();
  } else {
    ripples.push(makeRipple(canvasManager, { x, y }));
    audioManager.playMiss();
  }
}

function handleCompletePointerObject({
  startPosition,
  currentPosition,
  holdStart,
}) {
  const distance = Math.hypot(
    startPosition.x - currentPosition.x,
    startPosition.y - currentPosition.y
  );
  const duration = Date.now() - holdStart;
  const isSlingshot = distance > SLINGSHOT_MOVE_THRESHOLD;
  const isHoldBlast = !isSlingshot && duration > BLAST_HOLD_THRESHOLD;

  if (isSlingshot) {
    console.log("slingshot");
  } else if (isHoldBlast) {
    holdBlasts.push(makeHoldBlast(canvasManager, startPosition, duration));
    audioManager.playImpact();
  }
}

function onPop() {
  ballsPoppedTotal++;
  ballsPoppedRound++;

  if (balls.filter((b) => b.isRemaining()) <= 0) {
    levelManager.showLevelInterstitial();
  }
}

function onMiss() {
  if (!levelManager.isGameOver()) {
    ballsMissedTotal++;
    ballsMissedRound++;
    lifeManager.subtract();
    audioManager.playRandomFireworks();
    levelManager.setFirstMiss();

    if (lifeManager.getLives() <= 0) {
      onGameEnd();
    } else if (balls.filter((b) => b.isRemaining()) <= 0) {
      levelManager.showLevelInterstitial();
    }
  }
}

function onGameEnd() {
  audioManager.playLose();
  levelManager.onGameOver();
}

function onInterstitial() {
  resetOngoingVisuals();
}

function onLevelAdvance() {
  resetLevelData();

  const levelData = levels[levelManager.getLevel() - 1];
  // Allow popping animation to finish playing for previous level balls
  balls = balls
    .filter((b) => b.isPopping())
    .concat(makeLevelBalls(canvasManager, levelData, onPop, onMiss));

  // Call on first interaction. Subsequent calls are ignored.
  audioManager.initialize();
  audioManager.playRandomLevel();
}

function onPreviewAdvance() {
  resetLevelData();

  // Allow popping animation to finish playing for previous level balls
  balls = balls
    .filter((b) => b.isPopping())
    .concat(makeLevelBalls(canvasManager, previewData, onPop, onMiss));

  // Call on first interaction. Subsequent calls are ignored.
  audioManager.initialize();
  audioManager.playRandomLevel();
}
