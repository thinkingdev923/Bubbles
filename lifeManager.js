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
    const marginFromBottom = 64;

    // Draw container
    CTX.save();
    CTX.strokeStyle = red;
    CTX.lineWidth = 3;
    CTX.translate(
      canvasManager.getWidth() / 2,
      canvasManager.getHeight() - marginFromBottom
    );
    CTX.beginPath();
    CTX.roundRect(-width / 2, 0, width, height, height);
    CTX.stroke();
    CTX.restore();

    // Draw heart
    CTX.save();
    CTX.fillStyle = red;
    CTX.translate(
      canvasManager.getWidth() / 2 - width / 2 + 13,
      canvasManager.getHeight() - marginFromBottom + 7
    );
    const heart = new Path2D(
      "m23.4048 5.64209c1.9234 4.75631-.5924 11.52211-10.8187 17.20591-.1791.0996-.3811.1519-.5864.1519-.2054 0-.4073-.0523-.5864-.1519-10.22631-5.685-12.74212-12.4508-10.817489-17.2071.934139-2.30919 2.894739-3.96438 5.206699-4.47568 2.03495-.449474 4.25939.7089 6.19839 3.23448 1.939-2.52558 4.1634-3.683954 6.1996-3.23448 2.3107.5113 4.2713 2.16768 5.2043 4.47687z"
    );
    CTX.fill(heart);
    CTX.restore();

    // Draw text
    CTX.save();
    CTX.fillStyle = red;
    CTX.font = `${FONT_WEIGHT_BOLD} 24px ${FONT}`;
    CTX.textAlign = "center";
    CTX.translate(
      canvasManager.getWidth() / 2 + 15,
      canvasManager.getHeight() - marginFromBottom + height / 2 + 8
    );
    if (previousLivesValue) {
      drawTextRotate(
        canvasManager,
        lastSubtractStart,
        `${previousLivesValue}`,
        `${lives}`
      );
    } else {
      CTX.fillText(`${lives}`, 0, 0);
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
