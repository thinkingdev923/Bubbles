import { FONT, FONT_WEIGHT_NORMAL, FONT_WEIGHT_BOLD } from "./constants.js";

export const makeScoreDisplay = (canvasManager, scoreStore, levelManager) => {
  const scoreDisplayStart = Date.now();
  const CTX = canvasManager.getContext();
  let mostRecentLevelDrawn = null;
  let stats = null;

  const updateStats = () => {
    const currentLevel = levelManager.getLevel();
    if (mostRecentLevelDrawn !== currentLevel) {
      stats = {
        tapsData: scoreStore.sumCategoryLevelEvents("taps", currentLevel).data,
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

      // Darken screen so it looks different from normal interstitial
      CTX.fillStyle = `rgba(0, 0, 0, 0.4)`;
      CTX.fillRect(0, 0, canvasManager.getWidth(), canvasManager.getHeight());

      // Display special message
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
    CTX.translate(32, 200);

    // Draw TAPS data section
    if (stats.taps) {
      CTX.fillStyle = "white";
      CTX.textBaseline = "top";
      CTX.font = `${FONT_WEIGHT_BOLD} 14px ${FONT}`;
      CTX.textAlign = "left";
      CTX.letterSpacing = "1px";
      CTX.fillText(`TAPS`, 0, 0);
      CTX.font = `${FONT_WEIGHT_NORMAL} 14px ${FONT}`;
      CTX.textAlign = "right";
      CTX.letterSpacing = "0px";
      CTX.translate(canvasManager.getWidth() - 64, 0);
      CTX.fillText(
        `${stats.tapsPopped} Hits, ${stats.taps - stats.tapsPopped} Misses`,
        0,
        0
      );
      CTX.translate(-canvasManager.getWidth() + 64, 32);
      stats.tapsData.forEach(({ popped }, index) => {
        CTX.fillStyle = popped ? "white" : "rgba(255, 255, 255, .2)";
        CTX.beginPath();
        CTX.arc(32 * index + 12, 12, 12, 0, 2 * Math.PI);
        CTX.closePath();
        CTX.fill();
      });
      CTX.translate(0, 80);
    }

    // Draw SLINGSHOTS data section
    if (stats.slingshots.length) {
      CTX.fillStyle = "white";
      CTX.font = `${FONT_WEIGHT_BOLD} 14px ${FONT}`;
      CTX.textAlign = "left";
      CTX.letterSpacing = "1px";
      CTX.fillText(`SLINGSHOTS`, 0, 0);
      CTX.font = `${FONT_WEIGHT_NORMAL} 14px ${FONT}`;
      CTX.textAlign = "right";
      CTX.letterSpacing = "0px";
      CTX.translate(canvasManager.getWidth() - 64, 0);
      CTX.fillText(`${stats.slingshots.length} Launched`, 0, 0);
      CTX.translate(-canvasManager.getWidth() + 64, 32);
      stats.slingshots.forEach(({ popped }, index) => {
        CTX.beginPath();
        CTX.fillStyle = "red";
        CTX.arc(72 * index + 12, 12, 12, 0, 2 * Math.PI);
        CTX.textAlign = "left";
        CTX.font = `${FONT_WEIGHT_BOLD} 24px ${FONT}`;
        CTX.fillStyle = "white";
        CTX.fillText(`${popped}x`, 72 * index + 30, 1);
        CTX.closePath();
        CTX.fill();
      });
      CTX.translate(0, 80);
    }

    // Draw BLASTS data section
    if (stats.blasts.length) {
      CTX.fillStyle = "white";
      CTX.font = `${FONT_WEIGHT_BOLD} 14px ${FONT}`;
      CTX.textAlign = "left";
      CTX.letterSpacing = "1px";
      CTX.fillText(`BLASTS`, 0, 0);
      CTX.font = `${FONT_WEIGHT_NORMAL} 14px ${FONT}`;
      CTX.textAlign = "right";
      CTX.letterSpacing = "0px";
      CTX.translate(canvasManager.getWidth() - 64, 0);
      CTX.fillText(`${stats.blasts.length} Detonated`, 0, 0);
      CTX.translate(-canvasManager.getWidth() + 64, 32);
      stats.blasts.forEach(({ popped }, index) => {
        CTX.beginPath();
        CTX.fillStyle = "red";
        CTX.arc(72 * index + 12, 12, 12, 0, 2 * Math.PI);
        CTX.textAlign = "left";
        CTX.font = `${FONT_WEIGHT_BOLD} 24px ${FONT}`;
        CTX.fillStyle = "white";
        CTX.fillText(`${popped}x`, 72 * index + 30, 1);
        CTX.closePath();
        CTX.fill();
      });
    }

    CTX.restore();
  };

  return { draw };
};
