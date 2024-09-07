import { yellow } from "./colors.js";

export const makeLevelManager = (
  CTX,
  canvasWidth,
  canvasHeight,
  onLevelEnd,
  onAdvance
) => {
  let level;
  let interstitialShowing;
  let firstMissLevel;
  const reset = () => {
    level = false;
    interstitialShowing = false;
    firstMissLevel = false;
  };
  reset();

  const advanceLevel = () => {
    level = level ? level + 1 : 1;
    interstitialShowing = true;
    onLevelEnd();

    const advance = (e) => {
      interstitialShowing = false;
      onAdvance(e);
    };

    document.addEventListener("click", advance, { once: true });
    document.addEventListener("touchstart", advance, {
      passive: false,
      once: true,
    });
  };

  const setFirstMiss = () => {
    if (!firstMissLevel) firstMissLevel = level;
  };

  const drawInterstitialMessage = ({
    initialMessage,
    firstMissMessage,
    defaultMessage,
  }) => {
    if (interstitialShowing) {
      if (level === 1) {
        initialMessage();
      } else if (firstMissLevel && firstMissLevel === level - 1) {
        firstMissMessage();
      } else {
        defaultMessage();
      }
    }
  };

  const drawLevelNumber = () => {
    CTX.save();
    CTX.font = "600 14px -apple-system, BlinkMacSystemFont, sans-serif";
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
  };
};
