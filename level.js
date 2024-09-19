import { yellow } from "./colors.js";
import { FONT, FONT_WEIGHT_BOLD } from "./constants.js";
import { levels as levelData } from "./levelData.js";
import { drawTextRotate } from "./textRotate.js";

export const makeLevelManager = (canvasManager, onAdvance, isPreview) => {
  const CTX = canvasManager.getContext();
  let level;
  let previousLevelValue;
  let lastLevelChangeStart;
  let interstitialShowing;
  let interstitialStart;
  let firstMissLevel;
  let hasShownFirstMissMessage;
  let gameOver;
  let hasShownPreviewInitialMessage;

  const reset = () => {
    level = false;
    previousLevelValue = false;
    interstitialShowing = false;
    firstMissLevel = false;
    hasShownFirstMissMessage = false;
    gameOver = false;
    hasShownPreviewInitialMessage = false;
  };
  reset();

  const isLastLevel = () => level > levelData.length;

  const showLevelInterstitial = () => {
    if (level) {
      previousLevelValue = level;
      level++;
      lastLevelChangeStart = Date.now();
    } else {
      previousLevelValue = false;
      level = 1;
    }

    interstitialShowing = true;
    interstitialStart = Date.now();
  };

  const dismissInterstitialAndAdvanceLevel = () => {
    if (isPreview) {
      hasShownPreviewInitialMessage = true;
    }

    if (firstMissLevel && !hasShownFirstMissMessage) {
      hasShownFirstMissMessage = true;
    }

    interstitialShowing = false;
    interstitialStart = false;
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

      if (isPreview && !hasShownPreviewInitialMessage) {
        previewInitialMessage(msElapsed);
      } else if (isLastLevel()) {
        reachedEndOfGameMessage(msElapsed);
      } else if (gameOver) {
        endGameMessage(msElapsed);
      } else if (level === 1 && !isPreview) {
        initialMessage(msElapsed);
      } else if (firstMissLevel && !hasShownFirstMissMessage && !isPreview) {
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

    if (!isPreview && previousLevelValue) {
      drawTextRotate(
        canvasManager,
        lastLevelChangeStart,
        `LEVEL ${previousLevelValue}`,
        `LEVEL ${level}`
      );
    } else {
      CTX.fillText(isPreview ? "PREVIEW" : `LEVEL ${level}`, 0, 0);
    }

    CTX.restore();
  };

  return {
    reset,
    getLevel: () => level,
    drawInterstitialMessage,
    isInterstitialShowing: () => interstitialShowing,
    drawLevelNumber,
    showLevelInterstitial,
    dismissInterstitialAndAdvanceLevel,
    setFirstMiss,
    isLastLevel,
    onGameOver,
    isGameOver: () => gameOver,
  };
};
