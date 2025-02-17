import { FONT, FONT_WEIGHT_NORMAL, FONT_WEIGHT_BOLD } from "./constants.js";
import { getGradientBitmap } from "./colors.js";
import { clampedProgress, transition } from "./helpers.js";
import { easeOutCirc, easeInOutSine } from "./easings.js";

const edgeMargin = 32;
const verticalMargin = 32;
const verticalMarginBetweenSections = 80;
const iconSize = 24;
const iconsRadius = iconSize / 2;
const numPoppedTextWidth = 40;

export const makeScoreDisplay = (canvasManager, scoreStore, levelManager) => {
  const CTX = canvasManager.getContext();
  let scoreDisplayStart = Date.now();
  let mostRecentLevelDrawn = null;
  let stats = null;

  const updateStats = () => {
    const currentLevel = levelManager.getLevel();

    if (mostRecentLevelDrawn !== currentLevel) {
      stats = {
        taps: { ...scoreStore.sumCategoryLevelEvents("taps", currentLevel) },
        slingshots: scoreStore.getSlingshots(currentLevel),
        blasts: scoreStore.getBlasts(currentLevel),
        totalPopped: scoreStore.sumPopped(currentLevel),
        totalMissed: scoreStore.sumCategoryLevelEvents(
          "missedBubbles",
          currentLevel
        ).num,
      };

      mostRecentLevelDrawn = currentLevel;
      scoreDisplayStart = Date.now();
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
      CTX.translate(canvasManager.getWidth() / 2, 52);
      CTX.fillStyle = `rgba(255, 255, 255, 1)`;
      CTX.font = `${FONT_WEIGHT_BOLD} 24px ${FONT}`;
      CTX.textAlign = "center";
      if (specialState === "gameWon") CTX.fillText("You won!", 0, 0);
      if (specialState === "gameLost") CTX.fillText("You lost!", 0, 0);
      CTX.restore();
    }

    CTX.save();

    const opacityTransition = transition(
      0,
      1,
      clampedProgress(0, 120, Date.now() - scoreDisplayStart),
      easeInOutSine
    );
    const slideUpTransition = transition(
      200,
      168,
      clampedProgress(0, 240, Date.now() - scoreDisplayStart),
      easeOutCirc
    );

    CTX.globalAlpha = opacityTransition;
    CTX.translate(0, slideUpTransition);

    if (stats.taps.data) {
      drawTitleLine(
        canvasManager,
        "TAPS",
        `${stats.taps.numPopped} ${
          stats.taps.numPopped === 1 ? "Hit" : "Hits"
        }, ${stats.taps.num - stats.taps.numPopped} ${
          stats.taps.num - stats.taps.numPopped === 1 ? "Miss" : "Misses"
        }`
      );
      CTX.translate(0, verticalMargin);
      stats.taps.data.forEach(({ popped, fill }, index) => {
        if (popped) {
          const preRenderImage = getGradientBitmap(fill);
          CTX.drawImage(
            preRenderImage,
            (iconSize + 8) * index + edgeMargin,
            0,
            iconSize * canvasManager.getScaleFactor(),
            iconSize * canvasManager.getScaleFactor()
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
      CTX.translate(0, verticalMarginBetweenSections);
    }

    if (stats.slingshots.length) {
      drawTitleLine(
        canvasManager,
        "SLINGSHOTS",
        `${stats.slingshots.length} Launched`
      );
      CTX.translate(0, verticalMargin);
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
      CTX.translate(0, verticalMarginBetweenSections);
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

function applyTextStyle1(CTX) {
  CTX.fillStyle = "white";
  CTX.font = `${FONT_WEIGHT_BOLD} 14px ${FONT}`;
  CTX.textAlign = "left";
  CTX.letterSpacing = "1px";
}

function applyTextStyle2(CTX) {
  CTX.fillStyle = "white";
  CTX.font = `${FONT_WEIGHT_NORMAL} 14px ${FONT}`;
  CTX.textAlign = "right";
  CTX.letterSpacing = "0px";
}

function applyTextStyle3(CTX) {
  CTX.fillStyle = "white";
  CTX.font = `${FONT_WEIGHT_BOLD} 24px ${FONT}`;
  CTX.textAlign = "left";
  CTX.letterSpacing = "0px";
}

function drawTitleLine(canvasManager, leftText, rightText) {
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
}
