import { FONT, FONT_WEIGHT_NORMAL } from "./constants.js";
import { white } from "./colors.js";
import { clampedProgress, transition } from "./helpers.js";
import { easeOutExpo } from "./easings.js";

export const makeTextBlock = (
  canvasManager,
  {
    xPos,
    yPos: initialYPos,
    textAlign,
    verticalAlign = "top",
    fontSize = 24,
    fontWeight = FONT_WEIGHT_NORMAL,
    lineHeight = 32,
    letterSpacing = "0px",
    fill = white,
  },
  initialLinesArray
) => {
  const CTX = canvasManager.getContext();
  let linesArray = [...initialLinesArray];
  let verticalOffset =
    verticalAlign === "center" ? (linesArray.length / 2) * lineHeight : 0;
  let yPos = initialYPos;
  let textStart = Date.now();

  const updateLines = (newLines) => {
    textStart = Date.now();
    linesArray = [...newLines];
    verticalOffset =
      verticalAlign === "center" ? (linesArray.length / 2) * lineHeight : 0;
  };

  const updateYPos = (newYPos) => (yPos = newYPos);

  const getBoundingBox = () => {
    const leading = lineHeight - fontSize;

    return {
      top: yPos - verticalOffset + leading,
      bottom: yPos - verticalOffset + leading + lineHeight * linesArray.length,
    };
  };

  const draw = (passedMSElapsed = false) => {
    CTX.save();
    CTX.font = `${fontWeight} ${fontSize}px ${FONT}`;
    CTX.fillStyle = fill;
    CTX.textAlign = textAlign;
    CTX.letterSpacing = letterSpacing;
    CTX.translate(xPos, yPos - verticalOffset);
    linesArray.forEach((line, index) => {
      const lineYPos = (index + 1) * lineHeight;
      const textSlideUpPosition = transition(
        lineYPos + lineHeight,
        lineYPos,
        clampedProgress(0, 816, passedMSElapsed || Date.now() - textStart),
        easeOutExpo
      );

      CTX.save();

      // Draw clipping mask
      CTX.beginPath();
      CTX.rect(
        -xPos,
        lineYPos - fontSize,
        canvasManager.getWidth(),
        lineHeight
      );
      CTX.clip();

      // Move text up into non clipped area
      CTX.fillText(line, 0, textSlideUpPosition);
      CTX.restore();
    });
    CTX.restore();
  };

  return {
    draw,
    getHeight: () => linesArray.length * lineHeight,
    getBoundingBox,
    getLines: () => linesArray,
    updateLines,
    updateYPos,
  };
};
