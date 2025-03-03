import {
  FONT,
  FONT_WEIGHT_NORMAL,
  FONT_WEIGHT_BOLD,
  BLAST_MAX_SIZE,
} from "./constants.js";
import { getGradientBitmap, red, white } from "./colors.js";
import { clampedProgress, transition, randomBetween } from "./helpers.js";
import {
  easeInOutSine,
  easeOutQuad,
  easeOutCubic,
  easeOutBack,
  easeOutQuart,
  easeOutExpo,
} from "./easings.js";
import { makeGrid } from "./grid.js";
import { makeTextBlock } from "./textBlock.js";

const edgeMargin = 32;
const verticalMargin = 32;
const verticalMarginBetweenSections = 56;
const iconSize = 24;
const iconRadius = iconSize / 2;
const numPoppedTextWidth = 40;

export const makeScoreDisplay = (canvasManager, scoreStore, levelManager) => {
  const CTX = canvasManager.getContext();
  let scoreDisplayStart = Date.now();
  let mostRecentLevelDrawn = null;
  let stats = null;

  const topText = makeTextBlock(
    canvasManager,
    {
      xPos: edgeMargin,
      yPos: verticalMarginBetweenSections,
      fontSize: 28,
      fontWeight: FONT_WEIGHT_BOLD,
      lineHeight: 38,
    },
    []
  );

  const updateStats = () => {
    const currentLevel = levelManager.getLevel();

    if (mostRecentLevelDrawn !== currentLevel) {
      stats = {
        score: scoreStore.levelScoreNumber(),
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

      const textLines = [];

      if (levelManager.isGameWon()) textLines.push("You won!");

      if (levelManager.isGameLost()) {
        textLines.push("You lost!");
      } else {
        textLines.push(
          `${
            stats.score <= -4
              ? "Condor: "
              : stats.score === -3
              ? "Albatross: "
              : stats.score === -2
              ? "Eagle: "
              : stats.score === -1
              ? "Birdie: "
              : stats.score === 1
              ? "Bogey: "
              : stats.score === 2
              ? "Double Bogey: "
              : stats.score === 3
              ? "Triple Bogey: "
              : stats.score >= 4
              ? "Disaster: "
              : ""
          }${
            stats.score > 0 || stats.score < 0
              ? `${Math.abs(stats.score)} `
              : ""
          }${
            stats.score > 0 ? "over" : stats.score < 0 ? "under" : "Even with"
          } par`
        );
      }

      if (stats.totalMissed) {
        textLines.push(
          `Lost ${stats.totalMissed} ${
            stats.totalMissed === 1 ? "life" : "lives"
          }`
        );
      }

      topText.updateLines(textLines);
    }
  };

  const draw = () => {
    updateStats();

    // Draw top text section

    CTX.save();

    // Darken screen so it looks different from normal interstitial
    if (levelManager.isGameLost() || levelManager.isGameWon()) {
      CTX.fillStyle = "rgba(0, 0, 0, 0.4)";
      CTX.fillRect(0, 0, canvasManager.getWidth(), canvasManager.getHeight());
    }

    topText.draw();

    CTX.restore();

    // Draw stats sections

    CTX.save();

    const opacityTransition = transition(
      0,
      1,
      clampedProgress(0, 100, Date.now() - scoreDisplayStart),
      easeInOutSine
    );
    const slideUpTransition = transition(
      topText.getHeight() +
        topText.getYPos() +
        verticalMarginBetweenSections * 1.4,
      topText.getHeight() + topText.getYPos() + verticalMarginBetweenSections,
      clampedProgress(0, 816, Date.now() - scoreDisplayStart),
      easeOutExpo
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

  function drawTitleLine(leftText, rightText) {
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

  function drawTapItem({ popped, fill }, index) {
    const animationDelay = Math.min(index * 68, 816);

    if (popped) {
      const slideUp = transition(
        2,
        0,
        clampedProgress(
          animationDelay,
          200 + animationDelay,
          Date.now() - scoreDisplayStart
        ),
        easeOutCubic
      );
      const scaleUp = transition(
        0.98,
        1,
        clampedProgress(
          animationDelay,
          180 + animationDelay,
          Date.now() - scoreDisplayStart
        ),
        easeOutCubic
      );

      const preRenderImage = getGradientBitmap(fill);
      CTX.translate(iconRadius, slideUp);
      CTX.scale(scaleUp, scaleUp);
      CTX.drawImage(
        preRenderImage,
        -iconRadius,
        0,
        iconSize * canvasManager.getScaleFactor(),
        iconSize * canvasManager.getScaleFactor()
      );
    } else {
      const rippleProgress = clampedProgress(
        animationDelay,
        2000 + animationDelay,
        Date.now() - scoreDisplayStart
      );
      const outerCircleRadius = transition(
        iconRadius,
        iconRadius * 1.4,
        rippleProgress,
        easeOutQuad
      );
      const outerCircleFade = transition(1, 0, rippleProgress, easeOutQuad);
      const outerCircleLineWidth = transition(
        2,
        3,
        rippleProgress,
        easeOutQuad
      );
      const innerCircleRadius = transition(
        iconRadius / 2,
        iconRadius,
        rippleProgress,
        easeOutQuad
      );
      const innerCircleFade = transition(0.6, 1, rippleProgress, easeOutQuad);
      const innerCircleLineWidth = transition(
        1,
        2,
        rippleProgress,
        easeOutQuad
      );
      const hiddenCircleRadius = transition(
        0,
        iconRadius / 2,
        rippleProgress,
        easeOutQuad
      );

      CTX.strokeStyle = red;
      CTX.lineWidth = outerCircleLineWidth;
      CTX.globalAlpha = outerCircleFade;
      CTX.beginPath();
      CTX.arc(iconRadius, iconRadius, outerCircleRadius, 0, 2 * Math.PI);
      CTX.closePath();
      CTX.stroke();

      CTX.lineWidth = innerCircleLineWidth;
      CTX.globalAlpha = innerCircleFade;
      CTX.beginPath();
      CTX.arc(iconRadius, iconRadius, innerCircleRadius, 0, 2 * Math.PI);
      CTX.closePath();
      CTX.stroke();

      CTX.lineWidth = 1;
      CTX.globalAlpha = 0.6;
      CTX.beginPath();
      CTX.arc(iconRadius, iconRadius, hiddenCircleRadius, 0, 2 * Math.PI);
      CTX.closePath();
      CTX.stroke();
    }
  }

  function drawSlingshotItem({ popped, velocity }, index) {
    const animationDelay = Math.min(index * 64, 768);
    const textHeight = 17.2;
    const angleInRads = Math.atan2(velocity.y, velocity.x);
    const scaleIn = transition(
      0,
      1,
      clampedProgress(
        animationDelay,
        600 + animationDelay,
        Date.now() - scoreDisplayStart
      ),
      easeOutQuart
    );
    const rotateIn = transition(
      0,
      angleInRads,
      clampedProgress(
        animationDelay,
        600 + animationDelay,
        Date.now() - scoreDisplayStart
      ),
      easeOutBack
    );

    CTX.save();
    if (popped) {
      CTX.strokeStyle = red;
      CTX.fillStyle = red;
    } else {
      CTX.strokeStyle = "rgba(255, 255, 255, .3)";
      CTX.fillStyle = "rgba(255, 255, 255, .3)";
    }

    const arrowLength = 10;
    const arrowWidth = 6;
    const lineWidth = 5;

    CTX.translate(iconRadius, iconRadius);
    CTX.scale(scaleIn, scaleIn);
    CTX.rotate(rotateIn);
    CTX.beginPath();
    CTX.moveTo(-iconRadius, -lineWidth / 2);
    CTX.lineTo(iconRadius - arrowLength, -lineWidth / 2);
    CTX.lineTo(iconRadius - arrowLength, -lineWidth / 2 - arrowWidth);
    CTX.lineTo(iconRadius, 0);
    CTX.lineTo(iconRadius - arrowLength, lineWidth / 2 + arrowWidth);
    CTX.lineTo(iconRadius - arrowLength, lineWidth / 2);
    CTX.lineTo(-iconRadius, lineWidth / 2);
    CTX.closePath();
    CTX.fill();
    CTX.restore();

    applyTextStyle3(CTX);
    CTX.fillText(`x${popped}`, 30, iconRadius + textHeight / 2);
  }

  function drawBlastItem({ popped, power }, index) {
    const animationDelay = index * 88;
    const textHeight = 17.2;
    const blastIconNumVertices = 12;
    const blastIconRadius = transition(
      iconRadius / 3,
      iconRadius * 1.2,
      clampedProgress(0, BLAST_MAX_SIZE, power)
    );
    const blastIconJitter = transition(
      1,
      2.25,
      clampedProgress(0, BLAST_MAX_SIZE, power)
    );
    const scaleIn = transition(
      0,
      1,
      clampedProgress(
        animationDelay,
        300 + animationDelay,
        Date.now() - scoreDisplayStart
      ),
      easeOutQuad
    );

    const blastIconVertices = new Array(blastIconNumVertices)
      .fill()
      .map((_, index) => {
        const angle = (index / blastIconNumVertices) * Math.PI * 2;
        const distance = randomBetween(
          blastIconRadius - blastIconJitter,
          blastIconRadius + blastIconJitter
        );
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
        };
      });

    CTX.save();
    if (popped > 0) {
      CTX.fillStyle = red;
      CTX.strokeStyle = red;
    } else {
      CTX.fillStyle = "rgba(255, 255, 255, .3)";
      CTX.strokeStyle = "rgba(255, 255, 255, .5)";
    }
    CTX.globalAlpha = 0.2;
    CTX.translate(iconRadius, iconRadius);
    CTX.scale(scaleIn, scaleIn);
    CTX.beginPath();
    blastIconVertices.forEach(({ x, y }, index) => {
      index === 0 ? CTX.moveTo(x, y) : CTX.lineTo(x, y);
    });
    CTX.closePath();
    CTX.fill();
    CTX.globalAlpha = 1;
    CTX.stroke();
    CTX.restore();

    applyTextStyle3(CTX);
    CTX.fillText(`x${popped}`, 32, iconRadius + textHeight / 2);
  }

  return { draw };
};

function applyTextStyle1(CTX) {
  CTX.fillStyle = white;
  CTX.font = `${FONT_WEIGHT_BOLD} 14px ${FONT}`;
  CTX.textAlign = "left";
  CTX.letterSpacing = "1px";
}

function applyTextStyle2(CTX) {
  CTX.fillStyle = white;
  CTX.font = `${FONT_WEIGHT_NORMAL} 14px ${FONT}`;
  CTX.textAlign = "right";
  CTX.letterSpacing = "0px";
}

function applyTextStyle3(CTX) {
  CTX.fillStyle = white;
  CTX.font = `${FONT_WEIGHT_BOLD} 24px ${FONT}`;
  CTX.textAlign = "left";
  CTX.letterSpacing = "0px";
}
