import { FONT, FONT_WEIGHT_NORMAL, FONT_WEIGHT_BOLD } from "./constants.js";
import { getGradientBitmap } from "./colors.js";

const edgeMargin = 32;
const iconSize = 24;
const iconsRadius = iconSize / 2;
const numPoppedTextWidth = 40;

const applyTextStyle1 = (CTX) => {
  CTX.fillStyle = "white";
  CTX.font = `${FONT_WEIGHT_BOLD} 14px ${FONT}`;
  CTX.textAlign = "left";
  CTX.letterSpacing = "1px";
};

const applyTextStyle2 = (CTX) => {
  CTX.fillStyle = "white";
  CTX.font = `${FONT_WEIGHT_NORMAL} 14px ${FONT}`;
  CTX.textAlign = "right";
  CTX.letterSpacing = "0px";
};

const applyTextStyle3 = (CTX) => {
  CTX.fillStyle = "white";
  CTX.font = `${FONT_WEIGHT_BOLD} 24px ${FONT}`;
  CTX.textAlign = "left";
  CTX.letterSpacing = "0px";
};

const drawTitleLine = (canvasManager, leftText, rightText) => {
  const CTX = canvasManager.getContext();

  CTX.save();
  applyTextStyle1(CTX);
  const leftTextWidth = CTX.measureText(leftText).width;
  const leftTextHeight = 10;

  CTX.fillText(leftText, edgeMargin, leftTextHeight);
  CTX.restore();

  CTX.save();
  applyTextStyle2(CTX);
  const rightTextWidth = CTX.measureText(rightText).width;
  CTX.fillText(
    rightText,
    canvasManager.getWidth() - edgeMargin,
    leftTextHeight
  );
  CTX.restore();

  const lineMargin = 8;
  CTX.fillStyle = "rgba(255, 255, 255, .2)";
  CTX.fillRect(
    leftTextWidth + edgeMargin + lineMargin,
    leftTextHeight / 2,
    canvasManager.getWidth() -
      leftTextWidth -
      rightTextWidth -
      edgeMargin * 2 -
      lineMargin * 2,
    1
  );
};

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
      CTX.translate(canvasManager.getWidth() / 2, 48);
      CTX.fillStyle = `rgba(255, 255, 255, 1)`;
      CTX.font = `${FONT_WEIGHT_NORMAL} 24px ${FONT}`;
      CTX.textAlign = "center";
      if (specialState === "gameWon") CTX.fillText("You won!", 0, 0);
      if (specialState === "gameLost") CTX.fillText("You lost!", 0, 0);
      CTX.restore();
    }

    CTX.save();
    CTX.translate(0, 168);

    if (stats.taps) {
      drawTitleLine(
        canvasManager,
        "TAPS",
        `${stats.tapsPopped} ${stats.tapsPopped === 1 ? "Hit" : "Hits"}, ${
          stats.taps - stats.tapsPopped
        } ${stats.taps - stats.tapsPopped === 1 ? "Miss" : "Misses"}`
      );
      CTX.translate(0, edgeMargin);
      stats.tapsData.forEach(({ popped }, index) => {
        if (popped) {
          const preRenderImage = getGradientBitmap("#EA98AA");
          CTX.drawImage(
            preRenderImage,
            (iconSize + 8) * index + edgeMargin,
            0,
            iconSize * 2,
            iconSize * 2
          );
        } else {
          CTX.fillStyle = "rgba(255, 255, 255, .2)";
          CTX.beginPath();
          CTX.arc(
            (iconSize + 8) * index + edgeMargin + iconsRadius,
            iconsRadius,
            iconsRadius,
            0,
            2 * Math.PI
          );
          CTX.closePath();
          CTX.fill();
        }
      });
      CTX.translate(0, 80);
    }

    if (stats.slingshots.length) {
      drawTitleLine(
        canvasManager,
        "SLINGSHOTS",
        `${stats.slingshots.length} Launched`
      );
      CTX.translate(0, edgeMargin);
      stats.slingshots.forEach(({ popped }, index) => {
        CTX.beginPath();
        CTX.fillStyle = "red";
        CTX.arc(
          (iconSize + numPoppedTextWidth + 8) * index +
            edgeMargin +
            iconsRadius,
          iconsRadius,
          iconsRadius,
          0,
          2 * Math.PI
        );
        applyTextStyle3(CTX);
        const textHeight = 17.2;
        CTX.fillText(
          `x${popped}`,
          72 * index + 62,
          iconsRadius + textHeight / 2
        );
        CTX.closePath();
        CTX.fill();
      });
      CTX.translate(0, 80);
    }

    if (stats.blasts.length) {
      drawTitleLine(
        canvasManager,
        "BLASTS",
        `${stats.blasts.length} Detonated`
      );
      CTX.translate(0, edgeMargin);
      stats.blasts.forEach(({ popped }, index) => {
        CTX.beginPath();
        CTX.fillStyle = "red";
        CTX.arc(
          (iconSize + numPoppedTextWidth + 8) * index +
            edgeMargin +
            iconsRadius,
          iconsRadius,
          iconsRadius,
          0,
          2 * Math.PI
        );
        applyTextStyle3(CTX);
        const textHeight = 17.2;
        CTX.fillText(
          `x${popped}`,
          72 * index + 62,
          iconsRadius + textHeight / 2
        );
        CTX.closePath();
        CTX.fill();
      });
    }

    CTX.restore();
  };

  return { draw };
};
