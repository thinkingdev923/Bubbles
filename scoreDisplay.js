import { centerTextBlock } from "./centerTextBlock.js";
import { getSpeedFromVelocity } from "./helpers.js";
import { FONT, FONT_WEIGHT_NORMAL } from "./constants.js";

export const makeScoreDisplay = (canvasManager, scoreStore, levelManager) => {
  const scoreDisplayStart = Date.now();
  const CTX = canvasManager.getContext();
  let mostRecentLevelDrawn = null;
  let stats = null;

  const updateStats = () => {
    const currentLevel = levelManager.getLevel();
    if (mostRecentLevelDrawn !== currentLevel) {
      stats = {
        taps: scoreStore.sumCategoryLevelEvents("taps", currentLevel).num,
        tapsPopped: scoreStore.sumCategoryLevelEvents("taps", currentLevel)
          .numPopped,
        popped: scoreStore.sumPopped(currentLevel),
        missed: scoreStore.sumCategoryLevelEvents("missedBubbles", currentLevel)
          .num,
        slingshots: scoreStore.getSlingshots(currentLevel),
        blasts: scoreStore.getBlasts(currentLevel),
      };

      mostRecentLevelDrawn = currentLevel;
    }
  };

  const draw = (specialState = false) => {
    updateStats();

    if (specialState === "gameWon" || specialState === "gameLost") {
      CTX.save();
      CTX.fillStyle = `rgba(0, 0, 0, 0.4)`;
      CTX.fillRect(0, 0, canvasManager.getWidth(), canvasManager.getHeight());

      CTX.translate(canvasManager.getWidth() / 2, 44);
      CTX.fillStyle = `rgba(255, 255, 255, 1)`;
      CTX.font = `${FONT_WEIGHT_NORMAL} 24px ${FONT}`;
      CTX.textAlign = "center";
      CTX.textBaseline = "middle";
      if (specialState === "gameWon") CTX.fillText("You won!", 0, 0);
      if (specialState === "gameLost") CTX.fillText("You lost!", 0, 0);
      CTX.restore();
    }

    CTX.save();

    const slingshotText = stats.slingshots.map(
      ({ popped, velocity }) =>
        `- popping ${popped} at ${Math.round(
          getSpeedFromVelocity(velocity)
        )} speed${popped > 1 ? " COMBO!" : ""}`
    );

    const blastText = stats.blasts.map(
      ({ popped, power }) =>
        `- popping ${popped} at ${Math.round(power)} power${
          popped > 1 ? " COMBO!" : ""
        }`
    );

    const text = [
      `Total Popped: ${stats.popped}`,
      `Lives Lost: ${stats.missed}`,
      "",
      `Taps: ${stats.taps}`,
      `- Popping: ${stats.tapsPopped}`,
      `Slingshots: ${stats.slingshots.length}`,
      ...slingshotText,
      `Blasts: ${stats.blasts.length}`,
      ...blastText,
    ];

    centerTextBlock(canvasManager, text);

    CTX.restore();
  };

  return { draw };
};
