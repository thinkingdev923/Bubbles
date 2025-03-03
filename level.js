import { yellow, white } from "./colors.js";
import { FONT, FONT_WEIGHT_BOLD } from "./constants.js";
import { levels as levelData, getLevelDataByNumber } from "./levelData.js";
import { drawTextRotate } from "./textRotate.js";
import { clampedProgress, transition } from "./helpers.js";

import { makeTextBlock } from "./textBlock.js";

export const makeLevelManager = (
  canvasManager,
  onInterstitial,
  onAdvance,
  previewData
) => {
  const CTX = canvasManager.getContext();
  const countdownDuration = 2400;
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

  const levelCountdownText = makeTextBlock(
    canvasManager,
    {
      xPos: canvasManager.getWidth() / 2,
      yPos: canvasManager.getHeight() / 2,
      textAlign: "center",
      verticalAlign: "center",
      fontSize: 32,
    },
    [""]
  );

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
  };

  const dismissInterstitialAndAdvanceLevel = () => {
    if (previewData) {
      hasShownPreviewInitialMessage = true;
      level = previewData.name;
    }

    // On the initial interstitial we want to show the "next" level, aka
    // "Level 1". However on subsequent  interstitials we want to show the
    // completed level aka the previous level, and only transition the level
    // indicator once the player has advanced by hitting "Continue"
    else if (hasCompletedInitialAdvance) {
      previousLevelValue = level;
      level++;
      levelChangeStart = Date.now();
    } else {
      hasCompletedInitialAdvance = true;
    }

    if (firstMissLevel && !hasShownFirstMissMessage) {
      hasShownFirstMissMessage = true;
    }

    levelCountdownText.updateLines([`Par of ${getLevelData().par}`]);
    interstitialShowing = false;
    interstitialStart = false;
    levelStarted = Date.now();

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

  const showLevelCountdown = () =>
    Date.now() - levelStarted < countdownDuration;

  const getLevelData = () =>
    previewData ? previewData : getLevelDataByNumber(level);

  const drawLevelCountdown = () => {
    const timeRemaining = countdownDuration - (Date.now() - levelStarted);

    levelCountdownText.draw();

    CTX.save();
    CTX.translate(canvasManager.getWidth() / 2, canvasManager.getHeight() / 2);
    CTX.lineWidth = timeRemaining / 400;
    CTX.strokeStyle = white;
    CTX.rotate(-Math.PI / 2);
    CTX.beginPath();
    CTX.arc(
      0,
      0,
      120,
      0,
      transition(
        0,
        2 * Math.PI,
        clampedProgress(countdownDuration, 0, timeRemaining)
      ),
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
    isGameLost: () => gameOver && !isLastLevel(),
    isGameWon: () => gameOver && isLastLevel(),
  };
};
