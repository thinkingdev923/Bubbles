import { red } from "./colors.js";
import { FONT, FONT_WEIGHT_BOLD, LIVES } from "./constants.js";
import { drawTextRotate } from "./textRotate.js";

export const makeLifeManager = (canvasManager) => {
  const CTX = canvasManager.getContext();
  let lives;
  let previousLivesValue;
  let lastSubtractStart;

  const reset = () => {
    lives = LIVES;
    previousLivesValue = false;
    lastSubtractStart = false;
  };
  reset();

  const subtract = () => {
    previousLivesValue = lives;
    lives--;
    lastSubtractStart = Date.now();
  };

  const draw = () => {
    const width = 72;
    const height = 38;
    const textVerticalOffset = 1;
    const marginFromBottom = 64;

    CTX.save();
    CTX.font = `${FONT_WEIGHT_BOLD} 24px ${FONT}`;
    CTX.fillStyle = red;
    CTX.strokeStyle = red;
    CTX.lineWidth = 3;
    CTX.textAlign = "center";
    CTX.textBaseline = "middle";

    CTX.translate(
      canvasManager.getWidth() / 2,
      canvasManager.getHeight() - marginFromBottom
    );
    CTX.beginPath();
    CTX.roundRect(-width / 2, 0, width, height, height);
    CTX.stroke();
    CTX.translate(0, height / 2 + textVerticalOffset);

    if (previousLivesValue) {
      drawTextRotate(
        canvasManager,
        lastSubtractStart,
        `♥ ${previousLivesValue}`,
        `♥ ${lives}`
      );
    } else {
      CTX.fillText(`♥ ${lives}`, 0, 0);
    }

    CTX.restore();
  };

  return {
    draw,
    reset,
    subtract,
    getLives: () => lives,
  };
};
