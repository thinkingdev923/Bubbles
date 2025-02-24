import { makeCanvasManager } from "./canvas.js";
import { BLAST_MAX_DURATION, FONT, FONT_WEIGHT_BOLD } from "./constants.js";
import {
  animate,
  clampedProgress,
  findBallAtPoint,
  randomBetween,
  transition,
  getBoundedPosition,
} from "./helpers.js";
import {
  checkParticleCollision,
  adjustParticlePositions,
  resolveParticleCollision,
} from "./particle.js";
import { makeRipple } from "./ripple.js";
import { makeAudioManager } from "./audio.js";
import { makeLifeManager } from "./lives.js";
import { makeLevelManager } from "./level.js";
import { makeContinueButtonManager } from "./continueButton.js";
import { makeActivePointer } from "./activePointer.js";
import { makeTextBlock } from "./textBlock.js";
import { makeScoreDisplay } from "./scoreDisplay.js";
import { makeLevelBalls } from "./levelData.js";
import { makeScoreStore } from "./scoreStore.js";
import { easeOutElastic, easeOutQuint } from "./easings.js";

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
  maxWidth: 800,
  attachNode: "#canvas",
});
const audioManager = makeAudioManager();
const lifeManager = makeLifeManager(canvasManager);
const levelManager = makeLevelManager(
  canvasManager,
  onInterstitial,
  previewDataPresent ? onPreviewAdvance : onLevelAdvance,
  previewData
);
const scoreStore = makeScoreStore(levelManager);
const scoreDisplay = makeScoreDisplay(canvasManager, scoreStore, levelManager);
const continueButtonManager = makeContinueButtonManager(canvasManager);
const CTX = canvasManager.getContext();

// These are all reset on game restart
let activePointers;
let pointerTriggerOutput;
let previousLevelBalls;
let balls;
let ripples;

function resetGame() {
  activePointers = [];
  pointerTriggerOutput = [];
  previousLevelBalls = [];
  balls = [];
  ripples = [];
  lifeManager.reset();
  levelManager.reset();
  levelManager.showLevelInterstitial();
  audioManager.resetPluckSequence();
  scoreStore.reset();
}
resetGame();

function resetLevelData() {
  audioManager.resetPluckSequence();
}

function resetOngoingVisuals() {
  activePointers = [];
  pointerTriggerOutput = pointerTriggerOutput.filter((b) => !b.isGone());
  ripples = [];
}

canvasManager.getElement().addEventListener("pointerdown", (e) => {
  const { pointerId, offsetX: x, offsetY: y } = e;

  if (levelManager.isInterstitialShowing()) {
    continueButtonManager.handleClick(
      { x, y },
      levelManager.isGameOver() || levelManager.isLastLevel()
        ? resetGame
        : levelManager.dismissInterstitialAndAdvanceLevel
    );
  } else {
    activePointers.push(
      makeActivePointer(
        canvasManager,
        audioManager,
        scoreStore,
        pointerId,
        { x, y },
        onPointerTrigger,
        handleGameClick
      )
    );
  }

  e.preventDefault();
});

canvasManager.getElement().addEventListener("pointerup", (e) => {
  const { pointerId, offsetX: x, offsetY: y } = e;

  activePointers.forEach((pointer, pointerIndex) => {
    if (pointerId === pointer.getId()) {
      pointer.setPosition({ x, y });
      activePointers.splice(pointerIndex, 1);
      if (!levelManager.isInterstitialShowing()) pointer.trigger();
    }
  });

  e.preventDefault();
});

canvasManager.getElement().addEventListener("pointermove", (e) => {
  const { pointerId, offsetX: x, offsetY: y } = e;

  activePointers.forEach((pointer) => {
    if (pointerId === pointer.getId()) pointer.setPosition({ x, y });
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

  if (
    pointerTriggerOutput.filter((o) => !o.isGone() && o.causesShake()).length
  ) {
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
    // Trigger holdBlasts that have been held down past the max time
    if (!levelManager.isInterstitialShowing()) {
      activePointers.forEach((p, pointerIndex) => {
        if (p.isHoldBlast() && p.getDuration() >= BLAST_MAX_DURATION) {
          activePointers.splice(pointerIndex, 1);
          p.trigger();
        }
      });
    }

    // Run collision detection on bubbles and bounce bubbles off eachother
    // Run collision detection on blasts + slingshots and pop colliding bubbles
    const ballsInPlay = balls.filter(
      (b) => b.isRemaining() && b.shouldRender()
    );
    ballsInPlay.forEach((ballA) => {
      ballsInPlay.forEach((ballB) => {
        if (ballA !== ballB) {
          const collision = checkParticleCollision(ballA, ballB);
          if (collision[0]) {
            adjustParticlePositions(ballA, ballB, collision[1]);
            resolveParticleCollision(ballA, ballB);
          }
        }
      });
      pointerTriggerOutput
        .filter((p) => !p.isGone())
        .forEach((output) => {
          const collision = checkParticleCollision(ballA, output);
          if (collision[0]) {
            output.isHoldBlast()
              ? ballA.pop(output.getRelativeVelocity(ballA.getPosition()))
              : ballA.pop(output.getVelocity());

            output.logCollision();

            audioManager.playSequentialPluck();
          }
        });
    });

    // Draw text elements (level, life, interstitial) underneath bubbles
    levelManager.drawInterstitialMessage({
      previewInitialMessage: (msElapsed) => {
        makeTextBlock(
          canvasManager,
          {
            xPos: canvasManager.getWidth() / 2,
            yPos: canvasManager.getHeight() / 2,
            textAlign: "center",
          },
          [`Preview of “${previewData.name}”`]
        ).draw();
        continueButtonManager.draw(msElapsed, 600, "Play Preview");
      },
      initialMessage: (msElapsed) => {
        makeTextBlock(
          canvasManager,
          {
            xPos: canvasManager.getWidth() / 2,
            yPos: canvasManager.getHeight() / 2,
            textAlign: "center",
          },
          [`Pop the bubble`]
        ).draw();
        continueButtonManager.draw(msElapsed, 600, "Play");
      },
      firstMissMessage: (msElapsed) => {
        scoreDisplay.draw("firstMiss");
        continueButtonManager.draw(msElapsed, 960);
      },
      defaultMessage: (msElapsed) => {
        scoreDisplay.draw();
        continueButtonManager.draw(msElapsed, 960);
      },
      endGameMessage: (msElapsed) => {
        scoreDisplay.draw("gameLost");
        continueButtonManager.draw(msElapsed, 1920, "Try Again");
      },
      reachedEndOfGameMessage: (msElapsed) => {
        scoreDisplay.draw("gameWon");
        continueButtonManager.draw(msElapsed, 1920, "Play Again");
      },
    });

    levelManager.drawLevelNumber();

    if (!levelManager.isInterstitialShowing() && !levelManager.isGameOver())
      lifeManager.draw();

    // Draw main game elements
    ripples.forEach((r) => r.draw());
    previousLevelBalls.forEach((b) => b.draw(deltaTime));

    if (levelManager.showLevelCountdown()) {
      levelManager.drawLevelCountdown();
    } else {
      balls.forEach((b) => b.draw(deltaTime));
    }

    pointerTriggerOutput.forEach((b) => b.draw(deltaTime));
    activePointers.forEach((p) => p.draw());

    // Draw combo messages over everything

    scoreStore.recentCombos(levelManager.getLevel()).forEach((c) => {
      const boundedPosition = getBoundedPosition(
        canvasManager,
        c.position,
        100
      );
      const text = `x${c.popped}!`;
      const textHeight = 48;

      const slideUp = transition(
        boundedPosition.y + 60,
        boundedPosition.y + textHeight / 2,
        clampedProgress(0, 300, Date.now() - c.timestamp),
        easeOutQuint
      );
      const rotateIn = transition(
        -Math.PI / 2,
        Math.PI / 80,
        clampedProgress(0, 1600, Date.now() - c.timestamp),
        easeOutElastic
      );
      const scaleIn = transition(
        0.01,
        1,
        clampedProgress(0, 400, Date.now() - c.timestamp),
        easeOutQuint
      );

      CTX.save();
      CTX.translate(boundedPosition.x, slideUp);
      CTX.rotate(rotateIn);
      CTX.scale(scaleIn, scaleIn);
      CTX.font = `${FONT_WEIGHT_BOLD} 64px ${FONT}`;

      // Shadow
      CTX.fillStyle = "#000";
      CTX.textAlign = "center";
      CTX.fillText(text, 0, 0);

      // Text
      CTX.translate(-2, -3);
      CTX.fillStyle = "#fff";
      CTX.fillText(text, 0, 0);

      CTX.restore();
    });
  });
});

function handleGameClick({ x, y }) {
  const collidingBall = findBallAtPoint(balls, { x, y });

  if (collidingBall) {
    scoreStore.recordTap({ x, y }, 1, collidingBall.getFill());
    collidingBall.pop();
    audioManager.playSequentialPluck();
  } else {
    scoreStore.recordTap({ x, y }, 0);
    ripples.push(makeRipple(canvasManager, { x, y }));
    audioManager.playMiss();
  }
}

function onPointerTrigger(output) {
  pointerTriggerOutput.push(output);
}

function onPop() {
  if (balls.filter((b) => b.isRemaining()) <= 0) {
    // Pause before showing interstitial so user can see the final bubble pop
    setTimeout(levelManager.showLevelInterstitial, 600);
  }
}

function onMiss() {
  if (!levelManager.isGameOver()) {
    scoreStore.recordMiss();
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

  // Allow popping animation to finish playing for previous level bubbles
  previousLevelBalls = balls.filter((b) => b.isPopping());
  balls = makeLevelBalls(
    canvasManager,
    levelManager.getLevelData(),
    onPop,
    onMiss
  );

  // Call on first interaction. Subsequent calls are ignored.
  audioManager.initialize();
  audioManager.playRandomLevel();
}

function onPreviewAdvance() {
  resetLevelData();

  // Allow popping animation to finish playing for previous level bubbles
  balls = balls
    .filter((b) => b.isPopping())
    .concat(makeLevelBalls(canvasManager, previewData, onPop, onMiss));

  // Call on first interaction. Subsequent calls are ignored.
  audioManager.initialize();
  audioManager.playRandomLevel();
}
