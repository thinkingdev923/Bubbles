import { yellow } from "./colors.js";

export const makeLevelManager = (CTX, canvasWidth, onLevelEnd, onAdvance) => {
  let level;
  const reset = () => {
    level = false;
  };
  reset();

  const advanceLevel = () => {
    level = level ? level + 1 : 1;
    onLevelEnd();

    document.addEventListener("click", onAdvance, { once: true });
    document.addEventListener("touchstart", onAdvance, {
      passive: false,
      once: true,
    });
  };

  const draw = () => {
    CTX.save();
    CTX.font = "600 14px -apple-system, BlinkMacSystemFont, sans-serif";
    CTX.fillStyle = yellow;
    CTX.letterSpacing = "1px";
    CTX.textAlign = "center";
    CTX.translate(canvasWidth / 2, 20);
    CTX.fillText(`LEVEL ${level}`, 0, 0);
    CTX.restore();
  };

  return {
    reset,
    getLevel: () => level,
    draw,
    advanceLevel,
  };
};
