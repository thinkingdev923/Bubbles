import { yellow } from "./colors.js";
import { FONT, FONT_WEIGHT_BOLD } from "./constants.js";

export const makeLevelManager = (
  CTX,
  canvasWidth,
  canvasHeight,
  onLevelEnd,
  onAdvance
) => {
  let level;
  let interstitialShowing;
  let interstitialStart;
  let firstMissLevel;
  let gameOver;

  const reset = () => {
    level = false;
    interstitialShowing = false;
    firstMissLevel = false;
    gameOver = false;
  };
  reset();

  const advanceLevel = () => {
    level = level ? level + 1 : 1;
    interstitialShowing = true;
    interstitialStart = Date.now();
    onLevelEnd();

    const advance = (e) => {
      interstitialShowing = false;
      interstitialStart = false;
      onAdvance(e);
    };

    document.addEventListener("click", advance, { once: true });
    document.addEventListener("touchstart", advance, {
      passive: false,
      once: true,
    });
  };

  const onGameOver = () => {
    interstitialShowing = true;
    gameOver = true;
  };

  const setFirstMiss = () => {
    if (!firstMissLevel) firstMissLevel = level;
  };

  const drawInterstitialMessage = ({
    initialMessage,
    firstMissMessage,
    defaultMessage,
    endGameMessage,
  }) => {
    if (interstitialShowing) {
      const interstitialTimeElapsed = Date.now() - interstitialStart;

      if (gameOver) {
        endGameMessage(interstitialTimeElapsed);
      } else if (level === 1) {
        initialMessage(interstitialTimeElapsed);
      } else if (firstMissLevel && firstMissLevel === level - 1) {
        firstMissMessage(interstitialTimeElapsed);
      } else {
        defaultMessage(interstitialTimeElapsed);
      }
    }
  };

  const drawLevelNumber = () => {
    CTX.save();
    CTX.font = `${FONT_WEIGHT_BOLD} 14px ${FONT}`;
    CTX.fillStyle = yellow;
    CTX.letterSpacing = "1px";
    CTX.textAlign = "center";
    CTX.translate(canvasWidth / 2, 24);
    CTX.fillText(`LEVEL ${level}`, 0, 0);
    CTX.restore();
  };

  return {
    reset,
    getLevel: () => level,
    drawInterstitialMessage,
    drawLevelNumber,
    advanceLevel,
    setFirstMiss,
    onGameOver,
    isGameOver: () => gameOver,
  };
};
