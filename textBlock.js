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
  },
  initialLinesArray
) => {
  const CTX = canvasManager.getContext();
  let linesArray = [...initialLinesArray];
  const verticalOffset =
    verticalAlign === "center" ? (linesArray.length / 2) * lineHeight : 0;
  let yPos = initialYPos;
  let textStart = Date.now();

  const updateLines = (newLines) => {
    textStart = Date.now();
    linesArray = [...newLines];
  };

  const updateYPos = (newYPos) => (yPos = newYPos);

  const draw = (passedMSElapsed = false) => {
    CTX.save();
    CTX.font = `${fontWeight} ${fontSize}px ${FONT}`;
    CTX.fillStyle = white;
    CTX.textAlign = textAlign;
    CTX.translate(xPos, yPos - verticalOffset);
    linesArray.forEach((line, index) => {
      const lineYPos = (index + 1) * lineHeight;
      const textSlideUpPosition = transition(
        lineYPos + lineHeight,
        lineYPos,
        clampedProgress(0, 800, passedMSElapsed || Date.now() - textStart),
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
    getYPos: () => yPos,
    getLines: () => linesArray,
    updateLines,
    updateYPos,
  };
};
