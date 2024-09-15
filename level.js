import { yellow } from "./colors.js";
import { FONT, FONT_WEIGHT_BOLD } from "./constants.js";

export const makeLevelManager = (canvasManager, onAdvance, isPreview) => {
  const CTX = canvasManager.getContext();
  let level;
  let interstitialShowing;
  let interstitialStart;
  let firstMissLevel;
  let hasShownFirstMissMessage;
  let gameOver;

  const reset = () => {
    level = false;
    interstitialShowing = false;
    firstMissLevel = false;
    hasShownFirstMissMessage = false;
    gameOver = false;
  };
  reset();

  const showLevelInterstitial = () => {
    level = level ? level + 1 : 1;
    interstitialShowing = true;
    interstitialStart = Date.now();
  };

  const dismissInterstitialAndAdvanceLevel = () => {
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
    previewMessage,
    initialMessage,
    firstMissMessage,
    defaultMessage,
    endGameMessage,
  }) => {
    if (interstitialShowing) {
      const msElapsed = Date.now() - interstitialStart;

      if (isPreview) {
        previewMessage(msElapsed);
      } else if (gameOver) {
        endGameMessage(msElapsed);
      } else if (level === 1) {
        initialMessage(msElapsed);
      } else if (firstMissLevel && !hasShownFirstMissMessage) {
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
    CTX.fillText(isPreview ? "PREVIEW" : `LEVEL ${level}`, 0, 0);
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
    onGameOver,
    isGameOver: () => gameOver,
  };
};
