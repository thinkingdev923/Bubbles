import { easeOutQuart } from "./easings.js";
import { clampedProgress, transition } from "./helpers.js";
import { FONT, FONT_WEIGHT_NORMAL } from "./constants.js";
import { randomColor, background } from "./colors.js";

export const makeContinueButtonManager = (canvasManager) => {
  const CTX = canvasManager.getContext();
  const buttonPath = new Path2D();
  const buttonWidth = 240;
  const buttonHeight = 72;
  const lifeIndicatorClearanceOffset = 65;
  const margin = 24;
  let withinDelay;
  let buttonColor = randomColor();

  buttonPath.roundRect(
    canvasManager.getWidth() / 2 - buttonWidth / 2,
    canvasManager.getHeight() -
      lifeIndicatorClearanceOffset -
      margin -
      buttonHeight,
    buttonWidth,
    buttonHeight,
    12
  );

  const wasButtonClicked = (x, y) => {
    buttonColor = randomColor();

    return (
      withinDelay &&
      CTX.isPointInPath(
        buttonPath,
        x * canvasManager.getScaleFactor(),
        y * canvasManager.getScaleFactor()
      )
    );
  };

  const draw = (msElapsed, delay, text = "Continue") => {
    withinDelay = msElapsed - delay > 0;
    const introProgress = clampedProgress(0, 800, msElapsed - delay);
    const wipeProgress = clampedProgress(0, 300, msElapsed - delay);
    const fadeIn = transition(0, 1, introProgress, easeOutQuart);
    const animateUp = transition(12, 0, introProgress, easeOutQuart);
    const rotateIn = transition(Math.PI / 12, 0, introProgress, easeOutQuart);
    const buttonBackgroundWipe = transition(
      0,
      2 * Math.PI - 0.00001,
      wipeProgress
    );

    CTX.save();

    // Draw button in non-transformed position of path (aside from a brief
    // rise animation). This is so we can use isPointInPath on this rect,
    // which is unaffected by transforms, and have it synced with the
    // displayed position of the button.
    CTX.strokeStyle = buttonColor;
    CTX.lineWidth = 4;
    CTX.globalAlpha = fadeIn;
    CTX.translate(0, animateUp);
    CTX.stroke(buttonPath);
    CTX.clip(buttonPath);

    // Now translate to the center of the button and perform animations and
    // render text
    CTX.translate(
      canvasManager.getWidth() / 2,
      canvasManager.getHeight() -
        lifeIndicatorClearanceOffset -
        margin -
        buttonHeight / 2
    );

    CTX.save();
    CTX.fillStyle = buttonColor;
    CTX.rotate(-Math.PI / 2);
    CTX.beginPath();
    CTX.arc(0, 0, buttonWidth / 2 + 12, 0, buttonBackgroundWipe);
    CTX.fill();
    CTX.restore();

    // Rotate text only
    CTX.rotate(rotateIn);
    CTX.font = `${FONT_WEIGHT_NORMAL} 24px ${FONT}`;
    CTX.fillStyle = background;
    CTX.textAlign = "center";
    CTX.textBaseline = "middle";
    CTX.fillText(text, 0, 0);
    CTX.restore();
  };

  return {
    draw,
    wasButtonClicked,
  };
};
