import { FONT, FONT_WEIGHT_NORMAL } from "./constants.js";

export const centerTextBlock = (CTX, canvasWidth, canvasHeight, lines) => {
  const lineHeight = 32;
  CTX.save();
  CTX.translate(canvasWidth / 2, canvasHeight / 2);
  CTX.font = `${FONT_WEIGHT_NORMAL} 24px ${FONT}`;
  CTX.fillStyle = "#fff";
  CTX.textAlign = "center";
  lines.forEach((line, index) => {
    CTX.fillText(
      line,
      0,
      (index + 1) * lineHeight - (lines.length / 2) * lineHeight
    );
  });
  CTX.restore();
};
