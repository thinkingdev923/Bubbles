import { FONT, FONT_WEIGHT_NORMAL } from "./constants.js";
import { white } from "./colors.js";

export const makeTextBlock = (
  canvasManager,
  {
    xPos,
    yPos,
    textAlign,
    verticalAlign = "top",
    fontSize = 24,
    fontWeight = FONT_WEIGHT_NORMAL,
    lineHeight = 32,
  },
  linesArray
) => {
  const CTX = canvasManager.getContext();
  const verticalOffset =
    verticalAlign === "center" ? (linesArray.length / 2) * lineHeight : 0;

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
  };
};
