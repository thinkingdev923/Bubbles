import { easeOutQuart } from "./easings.js";
import { clampedProgress, transition } from "./helpers.js";
import { FONT, FONT_WEIGHT_NORMAL } from "./constants.js";

export const makeContinueButtonManager = (canvasManager) => {
  const CTX = canvasManager.getContext();
  const buttonPath = new Path2D();
  const buttonWidth = 240;
  const buttonHeight = 72;
  const lifeIndicatorClearanceOffset = 65;
  const margin = 24;
  let withinDelay;

  buttonPath.rect(
    canvasManager.getWidth() / 2 - buttonWidth / 2,
    canvasManager.getHeight() -
      lifeIndicatorClearanceOffset -
      margin -
      buttonHeight,
    buttonWidth,
    buttonHeight
  );

  const wasButtonClicked = (x, y) =>
    withinDelay &&
    CTX.isPointInPath(
      buttonPath,
      x * canvasManager.getScaleFactor(),
      y * canvasManager.getScaleFactor()
    );

  const draw = (msElapsed, delay, text = "Continue") => {
    withinDelay = msElapsed - delay > 0;
    const introProgress = clampedProgress(0, 800, msElapsed - delay);
    const fadeIn = transition(0, 1, introProgress, easeOutQuart);
    const animateUp = transition(12, 0, introProgress, easeOutQuart);
    const rotateIn = transition(Math.PI / 24, 0, introProgress, easeOutQuart);

    CTX.save();

    // Draw button in non-transformed position of path (aside from a brief
    // rise animation). This is so we can use isPointInPath on this rect,
    // which is unaffected by transforms, and have it synced with the
    // displayed position of the button.
    CTX.fillStyle = "red";
    CTX.globalAlpha = fadeIn;
    CTX.translate(0, animateUp);
    CTX.fill(buttonPath);

    // Now translate to the center of the button and perform animations and
    // render text
    CTX.translate(
      canvasManager.getWidth() / 2,
      canvasManager.getHeight() -
        lifeIndicatorClearanceOffset -
        margin -
        buttonHeight / 2
    );

    // Rotate text only
    CTX.rotate(rotateIn);
    CTX.font = `${FONT_WEIGHT_NORMAL} 24px ${FONT}`;
    CTX.fillStyle = "#fff";
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
