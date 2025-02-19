import { FONT, FONT_WEIGHT_NORMAL, FONT_WEIGHT_BOLD } from "./constants.js";
import { getGradientBitmap, red } from "./colors.js";
import { clampedProgress, transition, randomBetween } from "./helpers.js";
import { easeOutCirc, easeInOutSine } from "./easings.js";
import { makeGrid } from "./grid.js";

const edgeMargin = 32;
const verticalMargin = 32;
const verticalMarginBetweenSections = 56;
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
        taps: scoreStore.getTaps(currentLevel),
        tapsPopped: scoreStore.sumCategoryLevelEvents("taps", currentLevel)
          .numPopped,
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

  const drawTitleLine = (leftText, rightText) => {
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

  const drawTapItem = ({ popped, fill }) => {
    if (popped) {
      const preRenderImage = getGradientBitmap(fill);
      CTX.drawImage(
        preRenderImage,
        0,
        0,
        iconSize * canvasManager.getScaleFactor(),
        iconSize * canvasManager.getScaleFactor()
      );
    } else {
      CTX.strokeStyle = red;
      CTX.lineWidth = 2;
      CTX.beginPath();
      CTX.arc(iconsRadius, iconsRadius, iconsRadius, 0, 2 * Math.PI);
      CTX.closePath();
      CTX.stroke();

      CTX.lineWidth = 1;
      CTX.globalAlpha = 0.6;
      CTX.beginPath();
      CTX.arc(iconsRadius, iconsRadius, iconsRadius / 2, 0, 2 * Math.PI);
      CTX.closePath();
      CTX.stroke();
    }
  };

  const drawSlingshotItem = ({ popped }) => {
    const textHeight = 17.2;

    if (popped) {
      CTX.fillStyle = red;
    } else {
      CTX.fillStyle = `rgba(255, 255, 255, .3)`;
    }
    CTX.beginPath();
    CTX.arc(iconsRadius, iconsRadius, iconsRadius, 0, 2 * Math.PI);
    CTX.closePath();
    CTX.fill();
    applyTextStyle3(CTX);
    CTX.fillText(`x${popped}`, 30, iconsRadius + textHeight / 2);
  };

  const drawBlastItem = ({ popped }) => {
    const textHeight = 17.2;
    const blastIconNumVertices = 12;
    const blastIconVertices = new Array(blastIconNumVertices)
      .fill()
      .map((_, index) => {
        const angle = (index / blastIconNumVertices) * Math.PI * 2;
        const distance = randomBetween(iconsRadius - 2, iconsRadius + 2);
        return {
          x: iconsRadius + Math.cos(angle) * distance,
          y: iconsRadius + Math.sin(angle) * distance,
        };
      });

    if (popped > 0) {
      CTX.fillStyle = red;
      CTX.strokeStyle = red;
    } else {
      CTX.fillStyle = `rgba(255, 255, 255, .3)`;
      CTX.strokeStyle = `rgba(255, 255, 255, .5)`;
    }
    CTX.globalAlpha = 0.2;
    CTX.beginPath();
    blastIconVertices.forEach(({ x, y }, index) => {
      index === 0 ? CTX.moveTo(x, y) : CTX.lineTo(x, y);
    });
    CTX.closePath();
    CTX.fill();
    CTX.globalAlpha = 1;
    CTX.stroke();

    applyTextStyle3(CTX);
    CTX.fillText(`x${popped}`, 32, iconsRadius + textHeight / 2);
  };

  const draw = (specialState = false) => {
    updateStats();

    if (specialState) {
      CTX.save();

      // Darken screen so it looks different from normal interstitial
      CTX.fillStyle = `rgba(0, 0, 0, 0.4)`;
      CTX.fillRect(0, 0, canvasManager.getWidth(), canvasManager.getHeight());

      // Display special message
      CTX.translate(canvasManager.getWidth() / 2, 56);
      CTX.fillStyle = `rgba(255, 255, 255, 1)`;
      CTX.font = `${FONT_WEIGHT_BOLD} 24px ${FONT}`;
      CTX.textAlign = "center";
      if (specialState === "gameWon") CTX.fillText("You won!", 0, 0);
      if (specialState === "gameLost") CTX.fillText("You lost!", 0, 0);
      if (specialState === "firstMiss")
        CTX.fillText("Miss a bubble, lose a life", 0, 0);

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
      160,
      120,
      clampedProgress(0, 240, Date.now() - scoreDisplayStart),
      easeOutCirc
    );

    CTX.globalAlpha = opacityTransition;
    CTX.translate(0, slideUpTransition);

    if (stats.taps.length) {
      drawTitleLine(
        "TAPS",
        `${stats.tapsPopped} ${stats.tapsPopped === 1 ? "Hit" : "Hits"}, ${
          stats.taps.length - stats.tapsPopped
        } ${stats.taps.length - stats.tapsPopped === 1 ? "Miss" : "Misses"}`
      );

      CTX.translate(0, verticalMargin);

      const tapsGrid = makeGrid(canvasManager, stats.taps, {
        itemWidth: iconSize,
        itemHeight: iconSize,
      });

      tapsGrid.drawItems(drawTapItem);

      CTX.translate(0, tapsGrid.getHeight() + verticalMarginBetweenSections);
    }

    if (stats.slingshots.length) {
      drawTitleLine("SLINGSHOTS", `${stats.slingshots.length} Launched`);

      CTX.translate(0, verticalMargin);

      const slingshotsGrid = makeGrid(canvasManager, stats.slingshots, {
        itemWidth: iconSize + 8 + numPoppedTextWidth,
        itemHeight: iconSize,
      });

      slingshotsGrid.drawItems(drawSlingshotItem);

      CTX.translate(
        0,
        slingshotsGrid.getHeight() + verticalMarginBetweenSections
      );
    }

    if (stats.blasts.length) {
      drawTitleLine("BLASTS", `${stats.blasts.length} Detonated`);

      CTX.translate(0, edgeMargin);

      const blastsGrid = makeGrid(canvasManager, stats.blasts, {
        itemWidth: iconSize + 8 + numPoppedTextWidth,
        itemHeight: iconSize,
      });

      blastsGrid.drawItems(drawBlastItem);
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
