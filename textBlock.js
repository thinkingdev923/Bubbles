import { FONT, FONT_WEIGHT_NORMAL } from "./constants.js";
import { white } from "./colors.js";

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

  const updateLines = (newLines) => (linesArray = [...newLines]);

  const updateYPos = (newYPos) => (yPos = newYPos);

  const draw = () => {
    CTX.save();
    CTX.font = `${fontWeight} ${fontSize}px ${FONT}`;
    CTX.fillStyle = white;
    CTX.textAlign = textAlign;
    CTX.translate(xPos, yPos - verticalOffset);
    linesArray.forEach((line, index) =>
      CTX.fillText(line, 0, (index + 1) * lineHeight)
    );
    CTX.restore();
  };

  return {
    draw,
    getHeight: () => linesArray.length * lineHeight,
    getYPos: () => yPos,
    updateLines,
    updateYPos,
  };
};
