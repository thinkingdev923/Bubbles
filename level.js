import { yellow, white } from "./colors.js";
import { FONT, FONT_WEIGHT_BOLD, FONT_WEIGHT_NORMAL } from "./constants.js";
import { levels as levelData, getLevelDataByNumber } from "./levelData.js";
import { drawTextRotate } from "./textRotate.js";
import { clampedProgress, transition } from "./helpers.js";
import { easeOutCubic } from "./easings.js";
import { makeSpring } from "./spring.js";

export const makeLevelManager = (
  canvasManager,
  onInterstitial,
  onAdvance,
  previewData
) => {
  const CTX = canvasManager.getContext();
  let level;
  let previousLevelValue;
  let levelChangeStart;
  let hasCompletedInitialAdvance;
  let interstitialShowing;
  let interstitialStart;
  let firstMissLevel;
  let hasShownFirstMissMessage;
  let gameOver;
  let hasShownPreviewInitialMessage;
  let levelStarted;

  const slideDistance = 16;
  const slideSpring = makeSpring(0, {
    stiffness: 90,
    damping: 15,
    mass: 1.3,
    precision: 200,
  });

  const reset = () => {
    level = previewData ? previewData.name : 1;
    previousLevelValue = false;
    hasCompletedInitialAdvance = false;
    interstitialShowing = false;
    firstMissLevel = false;
    hasShownFirstMissMessage = false;
    gameOver = false;
    hasShownPreviewInitialMessage = false;
  };
  reset();

  const isLastLevel = () => level >= levelData.length;

  const showLevelInterstitial = () => {
    interstitialShowing = true;
    interstitialStart = Date.now();
    onInterstitial(interstitialStart);

    slideSpring.resetValue(0);
  };

  const dismissInterstitialAndAdvanceLevel = () => {
    // On the initial interstitial we want to show the "next" level, aka
    // "Level 1". However on subsequent  interstitials we want to show the
    // completed level aka the previous level, and only transition the level
    // indicator once the player has advanced by hitting "Continue"
    if (hasCompletedInitialAdvance) {
      previousLevelValue = level;
      level++;
      levelChangeStart = Date.now();
    } else {
      hasCompletedInitialAdvance = true;
    }

    if (previewData) {
      hasShownPreviewInitialMessage = true;
    }

    if (firstMissLevel && !hasShownFirstMissMessage) {
      hasShownFirstMissMessage = true;
    }

    interstitialShowing = false;
    interstitialStart = false;
    levelStarted = Date.now();
    slideSpring.setEndValue(slideDistance);

    onAdvance();
  };

  const onGameOver = () => {
    interstitialShowing = true;
    interstitialStart = Date.now();
    gameOver = true;
  };

  const setFirstMiss = () => {
    firstMissLevel = true;
  };

  const drawInterstitialMessage = ({
    previewInitialMessage,
    reachedEndOfGameMessage,
    endGameMessage,
    initialMessage,
    firstMissMessage,
    defaultMessage,
  }) => {
    if (interstitialShowing) {
      const msElapsed = Date.now() - interstitialStart;

      if (previewData && !hasShownPreviewInitialMessage) {
        previewInitialMessage(msElapsed);
      } else if (gameOver) {
        endGameMessage(msElapsed);
      } else if (isLastLevel()) {
        reachedEndOfGameMessage(msElapsed);
      } else if (level === 1 && !hasCompletedInitialAdvance && !previewData) {
        initialMessage(msElapsed);
      } else if (firstMissLevel && !hasShownFirstMissMessage && !previewData) {
        firstMissMessage(msElapsed);
      } else {
        defaultMessage(msElapsed);
      }
    }
  };

  const drawLevelNumber = () => {
    CTX.save();
    CTX.font = `${FONT_WEIGHT_BOLD} 14px ${FONT}`;
    CTX.fillStyle = yellow;
    CTX.letterSpacing = "1px";
    CTX.textAlign = "center";
    CTX.translate(canvasManager.getWidth() / 2, 24);

    if (!previewData && previousLevelValue) {
      drawTextRotate(
        canvasManager,
        levelChangeStart,
        `LEVEL ${previousLevelValue}`,
        `LEVEL ${level}`
      );
    } else {
      CTX.fillText(previewData ? "PREVIEW" : `LEVEL ${level}`, 0, 0);
    }

    CTX.restore();
  };

  const showLevelCountdown = () => Date.now() - levelStarted < 3000;

  const getLevelData = () =>
    previewData ? previewData : getLevelDataByNumber(level);

  const drawLevelCountdown = () => {
    slideSpring.update();

    const countdownRadius = 32;
    const timeRemaining = 3000 - (Date.now() - levelStarted);
    const blurIn = transition(
      16,
      0,
      clampedProgress(3000, 2400, timeRemaining),
      easeOutCubic
    );
    const fadeIn = transition(
      0,
      1,
      clampedProgress(3000, 2600, timeRemaining),
      easeOutCubic
    );
    const scaleIn = transition(
      0.9,
      1,
      clampedProgress(0, slideDistance, slideSpring.getCurrentValue())
    );

    CTX.save();

    CTX.globalAlpha = fadeIn;
    CTX.translate(canvasManager.getWidth() / 2, canvasManager.getHeight() / 2);
    CTX.scale(scaleIn, scaleIn);
    CTX.font = `${FONT_WEIGHT_BOLD} 32px ${FONT}`;
    CTX.fillStyle = white;
    CTX.textAlign = "center";
    CTX.filter = `blur(${blurIn}px)`;

    CTX.fillText(
      `Par of ${getLevelData().par}`,
      0,
      -16 - slideDistance + slideSpring.getCurrentValue()
    );

    CTX.translate(0, 48 + slideDistance - slideSpring.getCurrentValue());
    CTX.font = `${FONT_WEIGHT_NORMAL} 32px ${FONT}`;
    CTX.fillText(Math.ceil(timeRemaining / 1000), 0, 10);

    CTX.fillStyle = "rgba(255, 255, 255, .12)";
    CTX.beginPath();
    CTX.arc(0, 0, countdownRadius, 0, 2 * Math.PI, true);
    CTX.fill();

    CTX.lineWidth = 3;
    CTX.strokeStyle = "#fff";
    CTX.rotate(-Math.PI / 2);
    CTX.beginPath();
    CTX.arc(
      0,
      0,
      countdownRadius,
      0,
      transition(0, 2 * Math.PI, clampedProgress(3000, 0, timeRemaining)),
      true
    );
    CTX.stroke();

    CTX.restore();
  };

  return {
    reset,
    getLevel: () => level,
    getLevelData,
    drawInterstitialMessage,
    isInterstitialShowing: () => interstitialShowing,
    drawLevelNumber,
    showLevelCountdown,
    drawLevelCountdown,
    showLevelInterstitial,
    dismissInterstitialAndAdvanceLevel,
    setFirstMiss,
    isLastLevel,
    onGameOver,
    isGameOver: () => gameOver,
  };
};
